import pandas as pd
import vectorbt as vbt
import time
import os
import json


#INTERNAL METHODS
from utils.botEventLogger import forge_event  , forge_trade_action
from utils.botShutter import shutdown_bot
from utils.sender import SendTradeDetails
from utils.botEventLogger import botEvent , botInstance

#EXTERNAL LIBS
from binance import Client 
from dotenv import load_dotenv

load_dotenv()

DS = None
isActive = False

class IndicatorGenerator:
    def __init__(self , symbol, quantity , strategy , dataStreame):
        self.df = pd.DataFrame()
        self.last_candle_time = None
        self.initialized = False
        self.symbol = symbol
        self.quantity = quantity
        self.exchangeCredentials = json.loads(os.getenv("bot_user_spec"))
        self.positionState = "waiting"
        self.strategy = strategy
        global DS
        DS = dataStreame


    def on_new_candle(self, dataFrame: pd.DataFrame):
        print("demo" , self.quantity)
        start = time.time()

        self.df = dataFrame.copy()

        if len(self.df) < 200:
            print("[IndicatorGenerator] :: Waiting for enough candles...")
            return

        latest_candle_time = self.df["close_time"].iloc[-1]
        if self.last_candle_time == latest_candle_time:
            return  
        self.last_candle_time = latest_candle_time

        close = self.df["close"]
        high = self.df["high"]
        low = self.df["low"]
        volume = self.df["volume"]


        ema_20 = vbt.MA.run(close, window=20, short_name="EMA").ma
        ema_50 = vbt.MA.run(close, window=50, short_name="EMA").ma
        ema_200 = vbt.MA.run(close, window=200, short_name="EMA").ma

        rsi = vbt.RSI.run(close, window=14).rsi

        atr = vbt.ATR.run(high, low, close, window=14).atr

        vol_avg = volume.rolling(window=20).mean()
        vol_spike = volume / vol_avg

        macd = vbt.MACD.run(close, fast_window=12, slow_window=26, signal_window=9)
        macd_val = macd.macd
        signal = macd.signal
        hist = macd.hist

        psy_window = 12
        psy = (close.diff() > 0).rolling(psy_window).sum() / psy_window * 100

        indicators = {
            "ema_20": ema_20.iloc[-1],
            "ema_50": ema_50.iloc[-1],
            "ema_200": ema_200.iloc[-1],
            "rsi": rsi.iloc[-1],
            "atr": atr.iloc[-1],
            "vol_spike": vol_spike.iloc[-1],
            "macd": macd_val.iloc[-1],
            "signal": signal.iloc[-1],
            "hist": hist.iloc[-1],
            "psy": psy.iloc[-1]
        }


        trend = (
            "Bullish" if ema_50.iloc[-1] > ema_200.iloc[-1]
            else "Bearish"
        )

        overbought = rsi.iloc[-1] > 70
        oversold = rsi.iloc[-1] < 30

        if trend == "Bullish" and oversold and vol_spike.iloc[-1] > 1.2 and hist.iloc[-1] > 0 and self.positionState != "BUY":
            signal_action = "BUY"
            self.positionState = "BUY"
        elif trend == "Bearish" and overbought and hist.iloc[-1] < 0:
            signal_action = "SELL"
        else:
            signal_action  = "HOLD" if self.positionState != "waiting" else self.positionState

        
        response = SendTradeDetails(self.exchangeCredentials["botId"], self.strategy , self.symbol, signal_action ,  self.quantity)
        if signal_action == "BUY":
            forge_trade_action({"k8sPodName" : response.botId , "status" : "running" , "result" : {}})
            forge_event({"type" :"running", "botId" : response.botId , "message" : (f"BOT BUY :: {self.symbol}") , "meta" : { "orderId" : response.clientOrderId}})
            global isActive
            isActive = True
        elif signal_action == "SELL":
            shutdown_bot({"pod_name" : response.botId})
            forge_trade_action({"k8sPodName" : response.botId , "status" : "completed" , "result" : {}})
            forge_event({"type" :"trade", "botId" : response.botId , "message" : (f"BOT SELL :: {self.symbol}") , "meta" : { "order" : response}})
            # destroy the k8s pod after successful selling the trade

def force_bot_stop():
    DS.unsubscribe()
    DS.disconnect()
    data = json.loads(os.getenv("bot_user_spec"))
    trade = json.loads(os.getenv("bot_pod_spec"))
    if isActive:
        bClient = Client(api_key= data["exchangeApiKey"] , api_secret=data["exchangeApiSecret"])
        bClient.order_market_sell({
            "symbol" : trade["symbol"],
            "quantity" : trade["quantity"]
        })
        existedBot = botInstance.find_one_and_update({"k8sPodName" : data["botId"]} , {"$set" : { "status" : "stopped"} })
        forge_event({"type" : "stopped" , "botId" : existedBot["botId"] , "message" : "SELL" , "meta" : {data , trade} })
        shutdown_bot({"pod_name" : data["botId"]})
    else:
        forge_event({"type" : "stopped" , "botId" : existedBot["botId"] , "message" : "SELL" , "meta" : {data , trade} })
    
    print("Bot is not stopped !!!")
    