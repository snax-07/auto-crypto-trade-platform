import Redis from "ioredis";
import dotenv from 'dotenv-flow'

dotenv.config()

console.log(process.env.REDIS_URL)
const redis = new Redis(process.env.REDIS_URL);

(async () => {
  await redis.set("ping", "pong");

  const value = await redis.get("ping");

  console.log(value);
})();