package main

import (
	"context"
	"flag"
	"fmt"

	"log"
	"net"
	"os"
	"os/signal"
	pb "tradeExecutor/gRPC/proto"

	"github.com/binance/binance-connector-go"
	"google.golang.org/grpc"
)

type TradeExecutorServer struct {
	pb.UnimplementedTradeBotServiceServer
	 activeBots map[string]string
	 client *binance_connector.Client
}

var (
	port = flag.Int("port" , 50051 , "Server port where server is listening !!!")
	completed = flag.Bool("status" , true , "Bot is ready to destroy !!")
	running = flag.Bool("active" , true , "Bot is active or n")
	exchangeApiKey = os.Getenv("exchangeApiKey")
	exchangeApiSecret = os.Getenv("exchangeApiSecret")
	exchangeBaseURL = flag.String("exchangeBaseURL" , "https://testnet.binance.vision" , "THIS WILL ACT AS THE MAIN REFRENCE POINT FOR API CALLING AND INTEIGRATING THE CLIENT IN TRADEEXECUTOR!!!")
)

func (s *TradeExecutorServer) TradeBotAction(ctx  context.Context , req *pb.TradeBotRequest) (*pb.TradeBotRequestReply , error){
	log.Printf("Request received ::: bot_id =%s , action=%s , pair=%s , amount=%.5f , strategy=%s" ,
				req.BotId , req.Action , req.ExchangePair , req.Amount, req.Strategy)
    s.activeBots[req.BotId] = req.Action
	

	if req.Action == "BUY" {
		ctx := context.Background()
		order ,  err := s.client.NewCreateOrderService().Symbol(req.ExchangePair).Quantity(req.Amount).Type("MARKET").Side(req.Action).Do(ctx)

		if err != nil {
			fmt.Print(err)
		}
		fmt.Print(order)
	}




	reply := &pb.TradeBotRequestReply{
		BotId: req.BotId,
		ClientOrderId: "testing client order id",//order.ClientOrderId,
		IsCompleted: *completed,
		OrderStatus: "Order status",
		Strategy: req.Strategy,
	}

	return reply , nil
}

func newServer() *TradeExecutorServer  {
	s := &TradeExecutorServer{
			activeBots: make(map[string]string),
			client: binance_connector.NewClient(exchangeApiKey , exchangeApiSecret , *exchangeBaseURL),
	}
	return s
}

func main(){
	lis , err := net.Listen("tcp" , fmt.Sprintf(":%d"  , *port))
	if err != nil {
		log.Fatalf("Failed to lsiten : %v" , err)
	}

	var opts []grpc.ServerOption

	grpcServer := grpc.NewServer(opts...)
	pb.RegisterTradeBotServiceServer(grpcServer, newServer() )

	go func ()  {
		log.Printf("TradeExecutor is listening on port %d..." , *port)
		if err := grpcServer.Serve(lis); err != nil{
			log.Fatalf("Failed to serve :: %v " , err)
		}
	}()

	ch := make(chan os.Signal, 1)
	signal.Notify(ch, os.Interrupt)
	<-ch
	log.Println("Shutting down TradeBot gRPC server...")
	grpcServer.GracefulStop()
	log.Println("Server stopped.")

}

// package main

// import (
// 	"context"
// 	"fmt"
// 	"log"
// 	"os"


// 	"github.com/binance/binance-connector-go"
// )

// func main() {
// 	apiKey := os.Getenv("BINANCE_API_KEY")
// 	secretKey := os.Getenv("BINANCE_API_SECRET")
// 	baseURL := "https://testnet.binance.vision" 
// 	if apiKey == "" || secretKey == "" {
// 		log.Fatal("Please set BINANCE_API_KEY and BINANCE_API_SECRET environment variables")
// 	}

// 	client := binance_connector.NewClient(apiKey,secretKey,baseURL)
// account, err := client.NewGetAccountService().Do(context.Background())
// if err != nil {
//     fmt.Println("Error fetching account info:", err)
//     return
// }

// for _, balance := range account.Balances {
//     fmt.Println(balance.Asset, ":", balance.Free)
// }


// 	// ctx , cancel := context.WithTimeout(context.Background() , 5*time.Second)
// 	// defer cancel()
// 	// order , err := client.NewCreateOrderService().Symbol("BTCUSDT").Quantity(0.001).Type("MARKET").Side("SELL").Do(ctx)
// 	// if err != nil {
// 	// 	fmt.Printf("Order error :: %v" , err)
// 	// }
// 	// fmt.Print(order)
// }
