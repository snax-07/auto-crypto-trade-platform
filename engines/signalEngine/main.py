import importlib
import asyncio
import os
from dotenv import load_dotenv
import json

load_dotenv()


print(os.getenv("bot_pod_spec"))
strategy = json.loads(os.getenv("bot_pod_spec"))["strategy"]
def main():
    module = importlib.import_module(f"strategies.{strategy.capitalize()}_stat.{strategy}_strategy")
    cls = getattr(module, strategy)
    strategyExecutor = cls()

    asyncio.run(strategyExecutor.run_bot())

if __name__ == "__main__":
     main()
