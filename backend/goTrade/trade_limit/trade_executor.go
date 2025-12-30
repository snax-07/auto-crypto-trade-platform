package trade_limit

import (
	"context"
	"crypto/aes"
	"crypto/cipher"
	"crypto/sha256"
	"encoding/base64"
	"encoding/json"
	"errors"
	"fmt"
	"goTrade/data"
	"time"

	"github.com/binance/binance-connector-go"
	"go.mongodb.org/mongo-driver/v2/bson"
)

type ExecutionManifest struct {
	OrderType          string  `json:"type"`
	OrderSymbol        string  `json:"pair"`
	OrderSide          string  `json:"side"`
	OrderQuantity      float64 `json:"order_quantity"`
	OrderPrice         float64 `json:"order_price"`
	UserEmail          string  `json:"user_email"`
	OrderQuoteOrderQty float64 `json:"order_quoteOrderQty"`
}

func ExecuteTradeLimit(orderString string) error {
	userColl := data.User
	tradeColl := data.Trade
	var order ExecutionManifest

	if err := json.Unmarshal([]byte(orderString), &order); err != nil {
		return fmt.Errorf("parsing manifest: %w", err)
	}

	ctx, cancel := context.WithTimeout(context.Background(), 15*time.Second)
	defer cancel()

	// 1. Retrieve Credentials
	var userDoc struct {
		ExchangeCredentials []struct {
			APIKeyEncrypted    string `bson:"apiKeyEncrypted"`
			APISecretEncrypted string `bson:"apiSecretEncrypted"`
		} `bson:"exchangeCredentials"`
	}
	err := userColl.FindOne(ctx, bson.M{"email": order.UserEmail}).Decode(&userDoc)
	if err != nil {
		return fmt.Errorf("user not found: %w", err)
	}

	apiKey, _ := decrypt(userDoc.ExchangeCredentials[0].APIKeyEncrypted)
	apiSecret, _ := decrypt(userDoc.ExchangeCredentials[0].APISecretEncrypted)

	client := binance_connector.NewClient(apiKey, apiSecret, "https://testnet.binance.vision")

	// 2. Prepare Order Service
	orderService := client.NewCreateOrderService().
		Symbol(order.OrderSymbol).
		Side(order.OrderSide)

	// 3. Type Logic
	if order.OrderType == "LIMIT" {
		if order.OrderPrice <= 0 || order.OrderQuantity <= 0 {
			return fmt.Errorf("LIMIT rejected. Price: %f, Qty: %f. Data: %s", order.OrderPrice, order.OrderQuantity, orderString)
		}
		orderService.Type("LIMIT").
			TimeInForce("GTC").
			Price(order.OrderPrice).
			Quantity(order.OrderQuantity)
	} else {
		if order.OrderQuoteOrderQty > 0 {
			orderService.Type("MARKET").QuoteOrderQty(order.OrderQuoteOrderQty)
		} else {
			orderService.Type("MARKET").Quantity(order.OrderQuantity)
		}
	}

	// 4. Execute Trade
	resp, err := orderService.Do(ctx)
	if err != nil {
		return fmt.Errorf("Binance API error: %w", err)
	}

	// 5. Success Logging
	fullResp := resp.(*binance_connector.CreateOrderResponseFULL)
	fmt.Printf("✔ Trade Success: %s %s %s at %s\n", fullResp.Symbol, order.OrderType, order.OrderSide, fullResp.Price)
	
    // Background DB Log (simplified for brevity)
    go func() {
        tradeColl.InsertOne(context.Background(), bson.M{
            "userId": order.UserEmail,
            "orderId": fullResp.OrderId,
            "symbol": fullResp.Symbol,
            "price": fullResp.Price,
            "createdAt": time.Now(),
			"status" : fullResp.Status,
			"actionOwner" : "MANUAL",
			"quantity" : order.OrderQuantity,
			"quoteOrderQty" : order.OrderQuoteOrderQty,
			"total" : order.OrderPrice,
        })
    }()

	return nil
}

// Keep your decrypt function exactly as it is...
func decrypt(encoded string) (string, error) {
	cipherData, err := base64.StdEncoding.DecodeString(encoded)
	if err != nil || len(cipherData) < 28 {
		return "", errors.New("invalid key format")
	}
	iv, tag, ciphertext := cipherData[:12], cipherData[12:28], cipherData[28:]
	key := sha256.Sum256([]byte("emer_sec_key"))
	block, err := aes.NewCipher(key[:])
	if err != nil { return "", err }
	gcm, err := cipher.NewGCM(block)
	if err != nil { return "", err }
	plaintext, err := gcm.Open(nil, iv, append(ciphertext, tag...), nil)
	if err != nil { return "", err }
	return string(plaintext), nil
}