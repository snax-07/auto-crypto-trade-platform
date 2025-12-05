import os
import json
import time

from dotenv import load_dotenv
from pymongo import AsyncMongoClient , server_api ,MongoClient

load_dotenv()
DB_URL = json.loads(os.getenv("bot_user_spec"))["DB_URL"]
mongo_client = MongoClient(DB_URL)["SnaxQuantum"]
botEvent = mongo_client["BotEvent"]
botInstance = mongo_client["BotInstance"]



#THIS WILL LOG ONLY EVENT LIKE BOT CREATED  , BOT MADE SELL , BOT DEPLETED , ETC.    
def forge_event(data):
    try:
        eventLogged  = botEvent.insert_one({
            "botId" : data["botId"],
            "type" : data["type"],
            "message" : data["message"],
            "meta" : data["meta"] or None
        })

        if not eventLogged:
            print(f"Bot event for demo")
        print("New Bot Event is logged !!!")
    except:
        raise NotImplementedError



def forge_trade_action(data):
    try:
        botInstanceUpdate = botInstance.update_one({
            "k8sPodName" : data["k8sPodName"],
            "status" : data["status"],
            "resultSummary" : data["result"]
        }).acknowledged

        if not botInstanceUpdate:
            print("Bot instanc is not updated")
        print("Bot intance is updated !!!")
    except:
        raise NotImplementedError


def forge_stopped_action(data):
    try:
        botInstanceUpdate = botInstance.update_one({
            "k8sPodName" : data["k8sPodName"],
            "status" : "stopped",
            "stopTime" : time.gmtime(),
            "resultSummary" : data["result"]
        }).acknowledged

        if not botInstanceUpdate:
            print("Bot instanc is not updated")
        print("Bot intance is updated !!!")
    except:
        raise NotImplementedError

