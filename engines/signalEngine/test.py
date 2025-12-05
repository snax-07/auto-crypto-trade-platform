import json
import os
from dotenv import load_dotenv
load_dotenv()

from binance.client import Client
from utils.botEventLogger import forge_stopped_action

data = json.loads(os.getenv("bot_user_spec"))


client = Client(api_key=data["exchangeApiKey"] , api_secret= data["exchangeApiSecret"])
client.API_URL = 'https://testnet.binance.vision/api'

resp = client.order_market_buy(symbol="BTCUSDT" , quantity=0.001)
print(resp)