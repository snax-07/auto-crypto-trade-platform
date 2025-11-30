import { createClient } from "redis";

const client = createClient();

client.on("error", (err) => console.log("Redis client error:", err));

let isConnected = false;

export async function forgeRedisClient(){
  if(!isConnected){
    await client.connect();
    isConnected= true;
  }

  return client;
} 
