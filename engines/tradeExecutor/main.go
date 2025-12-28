package main

import (
	"context"
	"flag"
	"fmt"
	"log"
	"net"
	"os"
	"os/signal"
	"strconv"

	pb "tradeExecutor/gRPC/proto/tradebotpb"

	"github.com/binance/binance-connector-go"
	"google.golang.org/grpc"
)

type TradeExecutorServer struct {
	pb.UnimplementedTradeBotServiceServer
	activeBots map[string]string
	client     *binance_connector.Client
}

var (
	port              = flag.Int("port", 50051, "Server port where server is listening")
	exchangeApiKey    = os.Getenv("exchangeApiKey")
	exchangeApiSecret = os.Getenv("exchangeApiSecret")
	exchangeBaseURL   = flag.String("exchangeBaseURL", "https://testnet.binance.vision", "Base URL for Binance API")
)

func (s *TradeExecutorServer) ExecuteTrade(ctx context.Context, req *pb.TradeRequest) (*pb.TradeResponse, error) {
	log.Printf("Request received ::: bot_id=%s, action=%s, pair=%s, amount=%.5f, strategy=%s",
		req.BotId, req.Action, req.Symbol, req.Quantity, req.Strategy)

	s.activeBots[req.BotId] = req.Action

	if req.Action != "BUY" && req.Action != "SELL" {
		return &pb.TradeResponse{
			BotId:  req.BotId,
			Symbol: req.Symbol,
			Action: req.Action,
			Status: "HOLD",
		}, nil
	}

	orderResp, err := s.client.NewCreateOrderService().
		Symbol(req.Symbol).
		Quantity(req.Quantity).
		Type("MARKET").
		Side(req.Action).
		Do(ctx)
	if err != nil {
		log.Printf("Order error: %v", err)
		return nil, err
	}

	order, ok := orderResp.(*binance_connector.CreateOrderResponseFULL)

	fmt.Print(order)
	if !ok {
		log.Printf("Failed to cast order response")
		return nil, fmt.Errorf("invalid order response type")
	}

	// Build gRPC fills
	var protoFills []*pb.Fill
	for _, f := range order.Fills {
		price, err := strconv.ParseFloat(f.Price, 64)
    if err != nil {
        log.Printf("Error parsing price: %v", err)
        price = 0
    }

    qty, err := strconv.ParseFloat(f.Qty, 64)
    if err != nil {
        log.Printf("Error parsing qty: %v", err)
        qty = 0
    }

    commission, err := strconv.ParseFloat(f.Commission, 64)
    if err != nil {
        log.Printf("Error parsing commission: %v", err)
        commission = 0
    }
		protoFills = append(protoFills, &pb.Fill{
			Price:           price,
			Qty:             qty,
			Commission:      commission,
			CommissionAsset: f.CommissionAsset,
			TradeId:         f.TradeId,
		})
	}

var executedAt int64 = int64(order.TransactTime)

// Parse avg price
var avgPrice float64= 0

// Parse executed quantity
var executedQty float64
if q, err := strconv.ParseFloat(order.ExecutedQty, 64); err == nil {
    executedQty = q
} else {
    executedQty = 0
}

// Parse quote quantity
var quoteQty float64
if q, err := strconv.ParseFloat(order.CummulativeQuoteQty, 64); err == nil {
    quoteQty = q
} else {
    quoteQty = 0
}

// Parse commission
var commission float64
if len(order.Fills) > 0 {
    commission , err = strconv.ParseFloat(order.Fills[0].Commission , 64);
	if err != nil{
		commission = 0
	}
}

commissionAsset := ""
if len(order.Fills) > 0 {
    commissionAsset = order.Fills[0].CommissionAsset
}
// Now build the protobuf
resp := &pb.TradeResponse{
    BotId:           req.BotId,
    Symbol:          req.Symbol,
    Action:          req.Action,
    OrderId:         fmt.Sprintf("%d", order.OrderId),
    Status:          order.Status,
    AvgPrice:        avgPrice,
    ExecutedQty:     executedQty,
    QuoteQty:        quoteQty,
    Commission:      commission,
    CommissionAsset: commissionAsset,
    ExecutedAt:      executedAt,
    Fills:           protoFills,
}


	return resp, nil
}


func newServer() *TradeExecutorServer {
	return &TradeExecutorServer{
		activeBots: make(map[string]string),
		client:     binance_connector.NewClient(exchangeApiKey, exchangeApiSecret, *exchangeBaseURL),
	}
}

func main() {
	flag.Parse()

	lis, err := net.Listen("tcp", fmt.Sprintf(":%d", *port))
	if err != nil {
		log.Fatalf("Failed to listen: %v", err)
	}

	grpcServer := grpc.NewServer()
	pb.RegisterTradeBotServiceServer(grpcServer, newServer())

	go func() {
		log.Printf("TradeExecutor is listening on port %d...", *port)
		if err := grpcServer.Serve(lis); err != nil {
			log.Fatalf("Failed to serve: %v", err)
		}
	}()

	ch := make(chan os.Signal, 1)
	signal.Notify(ch, os.Interrupt)
	<-ch
	log.Println("Shutting down TradeBot gRPC server...")
	grpcServer.GracefulStop()
	log.Println("Server stopped.")
}
