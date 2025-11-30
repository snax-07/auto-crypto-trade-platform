import json
import asyncio
from redis.asyncio import Redis

async def publish_event(pod_id, action, bot_id):
    redis = Redis.from_url("redis://localhost:6379")
    channel = f"pod-{pod_id}-events"

    event = {
        "action": action,
        "botId": bot_id
    }

    await redis.publish(channel, json.dumps(event))
    print(f"Published to {channel}: {event}")


async def main():
    pod_id = input("Enter POD_ID: ").strip()
    
    while True:
        action = input("Action (start/stop): ").strip()
        bot_id = input("Bot ID: ").strip()

        await publish_event(pod_id, action, bot_id)
        print()

if __name__ == "__main__":
    asyncio.run(main())
