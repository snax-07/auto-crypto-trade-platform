import pandas as pd
import asyncio
import json
import os
from binance import AsyncClient, BinanceSocketManager
from concurrent.futures import ThreadPoolExecutor

class DataStreamer:
    def __init__(self, symbol: str, time_frame: str, limit: int = 300):
        self.symbol = symbol.upper()
        self.time_frame = time_frame
        self.limit = limit
        self.client = None
        self.df = pd.DataFrame()
        self.listeners = []
        self.exchangeCredentials = json.loads(os.getenv("bot_user_spec"))
        self.executor = ThreadPoolExecutor(max_workers=2)  # For heavy callbacks

    async def connect(self):
        self.client = await AsyncClient.create(
            self.exchangeCredentials["exchangeApiKey"],
            self.exchangeCredentials["exchangeApiSecret"]
        )
        print(f"[DataStreamer] :: Connected to Binance for {self.symbol}")

    async def fetch_historical_data(self):
        klines = await self.client.get_klines(
            symbol=self.symbol,
            interval=self.time_frame,
            limit=self.limit
        )
        self.df = pd.DataFrame(klines, columns=[
            "open_time", "open", "high", "low", "close", "volume",
            "close_time", "qav", "num_trades", "tbbav", "tbqav", "ignore"
        ])
        self.df[["open", "high", "low", "close", "volume"]] = \
            self.df[["open", "high", "low", "close", "volume"]].astype(float)
        print(f"[DataStreamer] :: Historical candles loaded ({len(self.df)})")

    async def stream_live_data(self):
        while True:
            try:
                bsm = BinanceSocketManager(self.client)
                socket = bsm.kline_socket(symbol=self.symbol, interval=self.time_frame)
    
                async with socket as stream:
                    print(f"[DataStreamer] :: Live stream started for {self.symbol}")
                    while True:
                        try:
                            msg = await stream.recv()  # use recv(), NOT async for
                            if not msg or "k" not in msg:
                                continue
                            candle = msg["k"]
                            if candle.get("x"):  # closed candle
                                new_row = {
                                    "open_time": candle["t"],
                                    "open": float(candle["o"]),
                                    "high": float(candle["h"]),
                                    "low": float(candle["l"]),
                                    "close": float(candle["c"]),
                                    "volume": float(candle["v"]),
                                    "close_time": candle["T"],
                                }
                                await self._handle_new_candle(new_row)
                        except Exception as e:
                            print(f"[Stream error] {e}, continuing...")
                            await asyncio.sleep(1)
            except Exception as e:
                print(f"[BinanceWebsocketClosed] Connection closed ({e}). Reconnecting in 5s...")
                await asyncio.sleep(5)
    

    async def _handle_new_candle(self, candle):
        self.df.loc[len(self.df)] = candle
        if len(self.df) > self.limit:
            self.df = self.df.iloc[-self.limit:]
        print(f"[DataStreamer] :: New candle appended. Total: {len(self.df)}")


        loop = asyncio.get_running_loop()
        for callback in self.listeners:
            loop.run_in_executor(self.executor, callback, self.df.copy())

    def subscribe(self, callback):
        self.listeners.append(callback)

    def get_latest_data(self):
        return self.df.iloc[-1].to_dict()

    async def close(self):
        await self.client.close_connection()
        print("[DataStreamer] :: Connection closed.")

    def unsubscribe(self):
        self.listeners.clear()
        print("Receiver is deplecated !!!")
    
    def disconnect(self):
        asyncio.get_event_loop().create_task(self.client.close_connection())
        print("Connection is closed !!!")