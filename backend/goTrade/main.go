package main

import (
	"context"
	"goTrade/data"
	"goTrade/redisclient"
	 "goTrade/trade_limit"
	"goTrade/trade_market"
)


func main() {
	data.InitMongo();
	redisclient.Init();
	defer data.CloseMongo();
	ctx := context.Background();
	go func() {
    for {
        result, err := redisclient.Client.BLPop(ctx, 0, "orders_market").Result()
        if err != nil { continue }
        trade_market.ExecuteTradeMarket(result[1])
    }
	}()


	go func() {
    for {
        result, err := redisclient.Client.BLPop(ctx, 0, "orders_limit").Result()
        if err != nil { continue }
        trade_limit.ExecuteTradeLimit(result[1])
    }
	}()
	select{};
}
