package main

import (
	"context"
	"goTrade/data"
	"goTrade/redisclient"
	 "goTrade/trade_limit"
	"goTrade/trade_market"
	"fmt"
)

func main() {
    data.InitMongo()
    redisclient.Init()
    defer data.CloseMongo()
    
    ctx := context.Background()

    // Market Orders Worker
    go func() {
        fmt.Println(">>> Worker Active: Listening for Market Orders...")
        for {
            result, err := redisclient.Client.BLPop(ctx, 0, "orders_market").Result()
            if err != nil {
                fmt.Printf("Redis Error (Market): %v\n", err)
                continue
            }

            orderData := result[1]
            fmt.Printf("Processing Market Order: %s\n", orderData)

            // Capture the error from the execution function
            err = trade_market.ExecuteTradeMarket(orderData)
            if err != nil {
                fmt.Printf("[ERROR] Trade Execution Failed: %v\n", err)
            }
        }
    }()

    // Limit Orders Worker
    go func() {
        fmt.Println(">>> Worker Active: Listening for Limit Orders...")
        for {
            result, err := redisclient.Client.BLPop(ctx, 0, "orders_limit").Result()
            if err != nil {
                fmt.Printf("Redis Error (Limit): %v\n", err)
                continue
            }
            fmt.Print(result[1])
            err = trade_limit.ExecuteTradeLimit(result[1])
            if err != nil {
                fmt.Printf("[ERROR] Limit Execution Failed: %v\n", err)
            }
        }
    }()

    select {} // Block forever
}