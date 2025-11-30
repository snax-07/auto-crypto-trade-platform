import asyncio
import pymongo

from tradeIndicator.dataStreamer import DataStreamer
from binance import AsyncClient, BinanceSocketManager

async def main():
    #THIS ENSURE THAT ALL LISTENERS WILL GET OFF
    #1.ensure that the order is opened or not like completed or sell order is executed
    #2.if not make sell order and log the event and also update the instacnce and log event 
    #3.close all connection like binance , pymongo and all websocket connection
    DataStreamer.unsubscribe();