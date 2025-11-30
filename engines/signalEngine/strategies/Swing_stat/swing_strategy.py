import json
from tradeIndicator.dataStreamer import DataStreamer
from tradeIndicator.indicatorGenerator import IndicatorGenerator
import os


class swing:
    def __init__(self):
        self.data = json.loads(os.getenv("bot_pod_spec"))
        self.symbol = self.data["pair"]
        self.quantity = float(self.data["quantity"])
        self.timeFrame = self.data["timeFrame"]
        self.strategy = self.data["strategy"]

    
    async def run_bot(self):
        DS = DataStreamer(self.symbol , self.timeFrame)
        await DS.connect()
        await DS.fetch_historical_data()
        IG = IndicatorGenerator(self.symbol , self.quantity , self.strategy)
        DS.subscribe(IG.on_new_candle)
        await DS.stream_live_data()