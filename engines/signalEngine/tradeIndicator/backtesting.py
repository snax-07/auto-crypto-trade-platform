import os
import pandas as pd
import numpy as np
import vectorbt as vbt
from binance import AsyncClient
from dotenv import load_dotenv
import asyncio

load_dotenv()

async def on_newCandle():
    client = await AsyncClient.create(
        os.getenv("exchangeCredentials['apiKey']"),
        os.getenv("exchangeCredentials['apiSecret']")
    )

    klines = await client.get_historical_klines(
        "BTCUSDT", "1h", start_str="1 JAN, 2025", end_str="1 NOV, 2025"
    )
    await client.close_connection() 

    data = pd.DataFrame(klines, columns=[
        "open_time", "open", "high", "low", "close", "volume",
        "close_time", "qav", "num_trades", "tbbav", "tbqav", "ignore"
    ])

    data[['open', 'high', 'low', 'close', 'volume']] = data[['open', 'high', 'low', 'close', 'volume']].astype(float)
    data.dropna(inplace=True)

    close = data['close']
    high = data['high']
    low = data['low']
    volume = data['volume']

    # ============================
    # 🔍 Technical Indicators
    # ============================
    ema_20 = vbt.MA.run(close, window=50).ma
    ema_50 = vbt.MA.run(close, window=100).ma
    ema_200 = vbt.MA.run(close, window=200).ma
    rsi = vbt.RSI.run(close, window=14).rsi
    atr = vbt.ATR.run(high, low, close, window=14).atr

    vol_avg = volume.rolling(window=20).mean()
    vol_spike = volume / vol_avg

    macd = vbt.MACD.run(close, fast_window=12, slow_window=26, signal_window=9)
    hist = macd.hist

    # ============================
    # 📈 Entry/Exit Conditions
    # ============================
    trend = np.where(ema_50 > ema_200, "Bullish", "Bearish")

    buy_condition = (
        (ema_20 > ema_50) &
        (ema_50 > ema_200) &
        (rsi < 40) &
        (trend == "Bullish") &
        (vol_spike > 1.2)
    )

    sell_condition = (
        (ema_20 < ema_50) &
        (ema_50 < ema_200) &
        (rsi > 60) &
        (trend == "Bearish")
    )

    entries = buy_condition.astype(bool)
    exits = sell_condition.astype(bool)

    stop_loss_pct = 0.01   # 1% stop-loss
    take_profit_pct = 0.02 # 2% take-profit

    # Build pseudo stop-loss and take-profit triggers
    stop_loss_trigger = close.pct_change().lt(-stop_loss_pct)
    take_profit_trigger = close.pct_change().gt(take_profit_pct)

    # Merge with sell conditions
    final_exits = exits | stop_loss_trigger | take_profit_trigger

    # Create portfolio
    portfolio = vbt.Portfolio.from_signals(
        close=close,
        entries=entries,
        exits=final_exits,
        size=0.1,
        fees=0.001,
        slippage=0.0005,
        freq='4h'
    )

    print("===== Backtest Results =====")
    print(portfolio.stats())

asyncio.run(on_newCandle())
