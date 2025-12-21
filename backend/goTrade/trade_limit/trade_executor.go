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
	"math"
	"time"

	"github.com/binance/binance-connector-go"
	"go.mongodb.org/mongo-driver/v2/bson"
)

// ExecutionManifest reflects the JSON payload from your Redis queue
type ExecutionManifest struct {
	OrderType     string  `json:"order_type"`
	OrderSymbol   string  `json:"order_symbol"`
	OrderQuantity float64 `json:"order_quantity"`
	OrderPrice    float64 `json:"order_price"`
	OrderSide     string  `json:"order_side"`
	UserEmail     string  `json:"user_email"`
}

// ExecutionMeta for logging successful trades to MongoDB
type ExecutionMeta struct {
	Status        string    `json:"status" bson:"status"`
	Side          string    `json:"side" bson:"side"`
	ActionOwner   string    `json:"owner" bson:"owner"`
	UserId        string    `json:"userId" bson:"userId"`
	OrderId       int64     `json:"orderId" bson:"orderId"`
	Symbol        string    `json:"symbol" bson:"symbol"`
	Quantity      string    `json:"executedQty" bson:"executedQty"`
	QuoteOrderQty string    `json:"cummulativeQuoteQty" bson:"cummulativeQuoteQty"`
	Price         string    `json:"price" bson:"price"`
	CreatedAt     time.Time `json:"createdAt" bson:"createdAt"`
}

// normalize rounds a float to the specified number of decimal places.
// This prevents -1013 errors caused by floating-point math noise.
func normalize(val float64, precision int) float64 {
	p := math.Pow10(precision)
	return math.Floor(val*p) / p
}

func ExecuteTradeLimit(orderString string) error {
	userColl := data.User
	tradeColl := data.Trade
	var (
		userDoc struct {
			ExchangeCredentials []struct {
				APIKeyEncrypted    string `bson:"apiKeyEncrypted"`
				APISecretEncrypted string `bson:"apiSecretEncrypted"`
			} `bson:"exchangeCredentials"`
		}
		order ExecutionManifest
	)

	ctx, cancel := context.WithTimeout(context.Background(), 15*time.Second)
	defer cancel()

	// 1. Unmarshal JSON from Redis
	if err := json.Unmarshal([]byte(orderString), &order); err != nil {
		return fmt.Errorf("parsing manifest: %w", err)
	}

	// 2. Retrieve Encrypted API Keys
	err := userColl.FindOne(ctx, bson.M{"email": order.UserEmail}).Decode(&userDoc)
	if err != nil {
		return fmt.Errorf("user not found: %w", err)
	}

	// 3. Decrypt Credentials
	apiKey, err := decrypt(userDoc.ExchangeCredentials[0].APIKeyEncrypted)
	if err != nil { return err }
	apiSecret, err := decrypt(userDoc.ExchangeCredentials[0].APISecretEncrypted)
	if err != nil { return err }

	// 4. Initialize Binance Client (Testnet)
	client := binance_connector.NewClient(apiKey, apiSecret, "https://testnet.binance.vision")

	// 5. Apply Precision Normalization
	// BTCUSDT Testnet usually: Price (2 decimals), Quantity (5-6 decimals)
	cleanPrice := normalize(order.OrderPrice, 2)
	cleanQty   := normalize(order.OrderQuantity, 5)

	// 6. Execute the Order
	resp, err := client.NewCreateOrderService().
		Symbol(order.OrderSymbol).
		Type("LIMIT").
		Side(order.OrderSide).
		TimeInForce("GTC").
		Quantity(cleanQty).
		Price(cleanPrice).
		Do(ctx)

	if err != nil {
		// This captures -1013 and other API rejections
		fmt.Printf("[Binance Error] Symbol: %s, Price: %f, Error: %v\n", order.OrderSymbol, cleanPrice, err)
		return fmt.Errorf("binance order failed: %w", err)
	}

	// 7. Process Successful Response
	fullResp, ok := resp.(*binance_connector.CreateOrderResponseFULL)
	if !ok {
		return fmt.Errorf("unexpected response type: %T", resp)
	}

	meta := ExecutionMeta{
		Status:        fullResp.Status,
		Side:          order.OrderSide,
		ActionOwner:   "MANUAL",
		UserId:        order.UserEmail,
		OrderId:       fullResp.OrderId,
		Symbol:        fullResp.Symbol,
		Quantity:      fullResp.ExecutedQty,
		QuoteOrderQty: fullResp.CummulativeQuoteQty,
		Price:         fullResp.Price,
		CreatedAt:     time.Now(),
	}

	// 8. Log Execution to DB in Background
	go func(m ExecutionMeta) {
		bgCtx, bgCancel := context.WithTimeout(context.Background(), 5*time.Second)
		defer bgCancel()
		_, _ = tradeColl.InsertOne(bgCtx, m)
	}(meta)

	fmt.Printf("✔ Successfully placed %s LIMIT order for %s at %s\n", meta.Side, meta.Symbol, meta.Price)
	return nil
}

// decrypt handles AES-GCM decryption for API credentials
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