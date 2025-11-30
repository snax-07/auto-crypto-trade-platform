import os
import json
import asyncio
from redis.asyncio import Redis

# -----------------------------
# Hardcoded bot configs (DB simulation)
# -----------------------------
BOT_CONFIGS = {
    "bot-A": {
        "botId": "bot-A",
        "strategy": "swing",
        "interval": 2
    },
    "bot-c": {
        "botId": "bot-c",
        "strategy": "swing",
        "interval": 2
    },
    "bot-B": {
        "botId": "bot-B",
        "strategy": "grid",
        "interval": 5
    }
}

BOT_TASKS = {}

def get_bot_config(bot_id):
    return BOT_CONFIGS.get(bot_id)


# -----------------------------
# Bot Strategy Logic
# -----------------------------
async def run_swing_logic(bot):
    print(f"[{bot['botId']}] SWING running...")
    await asyncio.sleep(1)


async def run_grid_logic(bot):
    print(f"[{bot['botId']}] GRID running...")
    await asyncio.sleep(1)


async def run_bot(bot):
    interval = bot["interval"]

    while True:
        if bot["strategy"] == "swing":
            await run_swing_logic(bot)
        elif bot["strategy"] == "grid":
            await run_grid_logic(bot)

        await asyncio.sleep(interval)


# -----------------------------
# Bot Control
# -----------------------------
def start_bot(bot):
    bot_id = bot["botId"]

    if bot_id in BOT_TASKS:
        print(f"Bot {bot_id} already running")
        return

    task = asyncio.create_task(run_bot(bot))
    BOT_TASKS[bot_id] = task
    print(f"Started bot {bot_id}")


def stop_bot(bot_id):
    task = BOT_TASKS.get(bot_id)

    if task:
        task.cancel()
        del BOT_TASKS[bot_id]
        print(f"Stopped bot {bot_id}")


# -----------------------------
# Redis Listener
# -----------------------------
async def redis_worker(pod_id):
    redis = Redis.from_url("redis://localhost:6379")

    channel = f"pod-{pod_id}-events"
    pubsub = redis.pubsub()
    await pubsub.subscribe(channel)

    print(f"Listening on {channel}")

    async for message in pubsub.listen():
        if message["type"] != "message":
            continue

        event = json.loads(message["data"].decode())
        action = event["action"]
        bot_id = event["botId"]

        if action == "start":
            bot = get_bot_config(bot_id)
            if not bot:
                print(f"Unknown bot: {bot_id}")
                continue
            start_bot(bot)

        elif action == "stop":
            stop_bot(bot_id)


# -----------------------------
# Main
# -----------------------------
async def main():
    pod_id = os.getenv("POD_ID", "local")
    listener = asyncio.create_task(redis_worker(pod_id))
    await listener


if __name__ == "__main__":
    asyncio.run(main())
