package redisclient

import (
	"context"
	"github.com/redis/go-redis/v9"
	"log"
)

var (
	Client *redis.Client
	Ctx    = context.Background()
)

// Init connects to Redis
func Init() {
	Client = redis.NewClient(&redis.Options{
		Addr: "localhost:6379", // make sure this matches Node.js Redis
		DB:   0,                // default DB
	})
	
	if err := Client.Ping(Ctx).Err(); err != nil {
		log.Fatal("Redis connection failed:", err)
	}

	log.Println("Connected to Redis successfully")
}
