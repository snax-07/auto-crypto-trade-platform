package trade_market

import (
	"context"
	"encoding/json"
	"fmt"
	"goTrade/data"

	"crypto/aes"
	"crypto/cipher"
	"crypto/sha256"
	"encoding/base64"

	"github.com/binance/binance-connector-go"
	"go.mongodb.org/mongo-driver/v2/bson"

	"errors"
	"time"
)

type ExecutionManifest struct {
	OrderType          string  `json:"order_type"`          // Expecting "MARKET"
	OrderSymbol        string  `json:"pair"`
	OrderQuantity      float64 `json:"order_quantity,omitempty"`      // For Market by Amount
	OrderQuoteOrderQty float64 `json:"order_quoteOrderQty,omitempty"` // For Market by Total
	OrderSide          string  `json:"side"`
	UserEmail          string  `json:"user_email"`
}

type UserDoc struct {
	UserID              bson.ObjectID        `bson:"_id"` // Fixed: MongoDB uses _id
	ExchangeCredentials []ExchangeCredential `bson:"exchangeCredentials"`
}

type ExchangeCredential struct {
	APIKeyEncrypted    string `bson:"apiKeyEncrypted"`
	APISecretEncrypted string `bson:"apiSecretEncrypted"`
}

type ExecutionMeta struct {
	Status        string `json:"status"`
	Side 		  string `json:"side"`
	ActionOwner   string `json:"owner"`
	UserId        string `json:"userId,omitempty"`
	OrderId       int64  `json:"orderId"`
	Symbol        string `json:"symbol"`
	Quantity      string `json:"executedQty"`          // Binance returns these as strings
	QuoteOrderQty string `json:"cummulativeQuoteQty"` 
	Total         string  `json:"total"`// Corrected field name
}

func ExecuteTradeMarket(orderString string) error {
	user := data.User
	trade := data.Trade
	var (
		userDoc UserDoc
		order   ExecutionManifest
		meta    ExecutionMeta
	)

	

	// Context for the entire process
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// 1. Parse incoming order request
	if err := json.Unmarshal([]byte(orderString), &order); err != nil {
		return fmt.Errorf("invalid order string: %v", err)
	}

	// 2. Fetch User Credentials
	err := user.FindOne(ctx, bson.M{"email": order.UserEmail}).Decode(&userDoc)
	if err != nil {
		return fmt.Errorf("failed to find user: %v", err)
	}

	// 3. Decrypt Keys
	apiKey, err := decryptExchangeCred(userDoc.ExchangeCredentials[0].APIKeyEncrypted)
	if err != nil { return err }
	apiSecret, err := decryptExchangeCred(userDoc.ExchangeCredentials[0].APISecretEncrypted)
	if err != nil { return err }

	// 4. Initialize Binance Client (Testnet)
	binanceClient := binance_connector.NewClient(apiKey, apiSecret, "https://testnet.binance.vision")

	// 5. Build Market Order
	orderService := binanceClient.NewCreateOrderService().
		Symbol(order.OrderSymbol).
		Type("MARKET"). // Force Market
		Side(order.OrderSide)

	// Use Quantity OR QuoteOrderQty
	if order.OrderQuantity > 0 {
		orderService.Quantity(order.OrderQuantity)
	} else if order.OrderQuoteOrderQty > 0 {
		orderService.QuoteOrderQty(order.OrderQuoteOrderQty)
	} else {
		return errors.New("market order requires either quantity or quoteOrderQty")
	}

	// 6. Execute Trade
// 1. Execute the trade
// 6. Execute Trade
// 6. Execute Trade
resp, err := orderService.Do(ctx)
if err != nil {
	return fmt.Errorf("binance trade error: %v", err)
}

// 7. Type assert to Binance response struct
orderResp, ok := resp.(*binance_connector.CreateOrderResponseFULL)
if !ok {
	return fmt.Errorf("unexpected binance response type: %T", resp)
}

fmt.Print(orderResp)

// 8. Map response → ExecutionMeta
meta = ExecutionMeta{
	Status:        orderResp.Status,
	UserId:        order.UserEmail,
	OrderId:       orderResp.OrderId,
	Symbol:        orderResp.Symbol,
	Quantity:      orderResp.ExecutedQty,
	QuoteOrderQty: orderResp.CummulativeQuoteQty,
	Total: orderResp.CummulativeQuoteQty,
	ActionOwner: "MANUAL",
	Side: order.OrderSide,
}


	// 8. Log to MongoDB
	_, err = trade.InsertOne(ctx, meta)
	if err != nil {
		fmt.Println("[Warning] Trade executed but logging failed:", err)
	}

	// 9. Success Print
	fmt.Println("--- TRADE EXECUTED SUCCESSFULLY ---")
	fmt.Printf("Symbol: %s | Side: %s | OrderID: %d\n", meta.Symbol, order.OrderSide, meta.OrderId)
	fmt.Printf("Executed Qty: %s | Total Spent: %s\n", meta.Quantity, meta.QuoteOrderQty)
	fmt.Printf("User Email %s\n",meta.UserId)
	fmt.Println("------------------------------------")

	return nil
}

func decryptExchangeCred(encoded string) (string, error) {
	data, err := base64.StdEncoding.DecodeString(encoded)
	if err != nil { return "", err }

	if len(data) < 28 { return "", errors.New("ciphertext too short") }
	iv := data[:12]
	tag := data[12:28]
	ciphertext := data[28:]

	key := sha256.Sum256([]byte("emer_sec_key"))
	block, err := aes.NewCipher(key[:])
	if err != nil { return "", err }

	gcm, err := cipher.NewGCM(block)
	if err != nil { return "", err }

	// GCM Open expects ciphertext + tag
	fullCipher := append(ciphertext, tag...)
	plain, err := gcm.Open(nil, iv, fullCipher, nil)
	if err != nil { return "", err }

	return string(plain), nil
}