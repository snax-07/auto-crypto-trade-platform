import os
from pymongo import MongoClient

DB_URL = os.getenv("DB_URL");
mongo  = MongoClient(DB_URL)["SnaxQuantum"];

botInstanceDB = mongo['BotInstance'];
botEventDB = mongo['BotEvent'];
tradeDB = mongo['Trade'];
user = mongo['User']
