import os
import json
import time

from dotenv import load_dotenv
from pymongo import AsyncMongoClient , server_api ,MongoClient

load_dotenv()
DB_URL = json.loads(os.getenv("bot_user_spec"))["DB_URL"]
mongo_client = MongoClient(DB_URL)["SnaxQuantum"]
botEvent = mongo_client["BotEvent"]
botInstance = mongo_client["botinstances"]



def forge_event(data):
    """
    data: {
        "botId": str,
        "type": str,   # "running", "trade", "stopped"
        "message": str,
        "meta": dict   # can include order_id, trade details, etc.
    }
    """
    try:
        botEvent.insert_one({
            "botId": data["botId"],
            "type": data["type"],
            "message": data["message"],
            "meta": data.get("meta", None),
            "timestamp": int(time.time() * 1000)
        })
        print(f"Event logged for bot {data['botId']}")
    except Exception as e:
        print(f"Failed to log bot event: {e}")
        raise


def forge_trade_action(data):
    """
    data: {
        "k8sPodName": botId,
        "status": "inposition" or "completed",
        "trade": TradeResponse from Go server
    }
    """
    try:
        bot_record = botInstance.find_one({"k8sPodName": data["k8sPodName"]})
        if not bot_record:
            print(f"No bot instance found for {data['k8sPodName']}")
            return

        trade_data = data.get("trade", {})

        # Initialize result summary if not exists
        resultSummary = bot_record.get("resultSummary", {
            "buys": [],
            "sells": [],
            "total_cost": 0.0,
            "total_proceeds": 0.0,
            "pnl": 0.0,
            "pnl_percentage": 0.0
        })

        # Compute metrics
        if trade_data.get("action") == "BUY":
            cost = trade_data.get("quote_qty", 0.0)
            resultSummary["buys"].append({
                "symbol": trade_data.get("symbol"),
                "quantity": trade_data.get("executed_qty", 0.0),
                "avg_price": trade_data.get("avg_price", 0.0),
                "cost": cost,
                "order_id": trade_data.get("order_id")
            })
            resultSummary["total_cost"] += cost

        elif trade_data.get("action") == "SELL":
            proceeds = trade_data.get("quote_qty", 0.0)
            resultSummary["sells"].append({
                "symbol": trade_data.get("symbol"),
                "quantity": trade_data.get("executed_qty", 0.0),
                "avg_price": trade_data.get("avg_price", 0.0),
                "proceeds": proceeds,
                "order_id": trade_data.get("order_id")
            })
            resultSummary["total_proceeds"] += proceeds

        # Compute overall PnL
        resultSummary["pnl"] = resultSummary["total_proceeds"] - resultSummary["total_cost"]
        if resultSummary["total_cost"] > 0:
            resultSummary["pnl_percentage"] = (resultSummary["pnl"] / resultSummary["total_cost"]) * 100

        # Update bot instance
        botInstance.update_one(
            {"k8sPodName": data["k8sPodName"]},
            {"$set": {
                "status": data["status"],
                "resultSummary": resultSummary,
                "lastTrade": trade_data
            }}
        )
        print(f"Bot {data['k8sPodName']} trade action updated successfully!")

    except Exception as e:
        print(f"Error updating trade action: {e}")
        raise


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

