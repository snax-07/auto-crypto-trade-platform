import os
import json
import asyncio
import importlib
import signal

from dotenv import load_dotenv
from tradeIndicator.indicatorGenerator import IndicatorGenerator , force_bot_stop

load_dotenv()

print(os.getenv("bot_pod_spec"))
strategy = json.loads(os.getenv("bot_pod_spec"))["strategy"]


#  FOLLOWING IS AN SIMPLE MECHANISM TO SHUTDOWN THE BOT IN A GENTLE WAY !!!
stop_event = asyncio.Event()

def shutdown_forged_bot_pod(*_):
    force_bot_stop();
    print("Final call")
    stop_event.set()

signal.signal(signal.SIGTERM, shutdown_forged_bot_pod)
signal.signal(signal.SIGINT, shutdown_forged_bot_pod)

async def main():
    module = importlib.import_module(
        f"strategies.{strategy.capitalize()}_stat.{strategy}_strategy"
    )
    cls = getattr(module, strategy)
    executor = cls()

    # Run the bot in parallel with waiting for shutdown
    bot_task = asyncio.create_task(executor.run_bot())

    await stop_event.wait()
    bot_task.cancel()

if __name__ == "__main__":
    asyncio.run(main())
