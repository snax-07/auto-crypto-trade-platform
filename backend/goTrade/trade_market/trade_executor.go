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
	OrderType          string  `json:"order_type"`
	OrderSymbol        string  `json:"order_symbol"`
	OrderQuantity      float64 `json:"order_quantity,omitempty"`
	OrderQuoteOrderQty float64 `json:"order_quoteOrderQty,omitempty"`
	OrderSide          string  `json:"order_side"`
	UserId             string  `json:"user_id"`
}

type ExchangeCredential struct {
	APIKeyEncrypted    string `bson:"apiKeyEncrypted"`
	APISecretEncrypted string `bson:"apiSecretEncrypted"`
}

type UserDoc struct {
	UserID             bson.ObjectID        `bson:"_id"`
	ExchangeCredentials []ExchangeCredential `bson:"exchangeCredentials"`
}

type ExecutionMeta struct {
	Status        string `json:"status"`
	UserId        string `json:"userId,omitempty"`
	OrderId		  int64  `json:"orderId,omitempty"`
	Symbol        string `json:"symbol"`
	Quantity      string `json:"executedQty"`
	QuoteOrderQty string `json:"cummulativeQuoteQty"`
}

func ExecuteTradeMarket(orderString string) error {
	user := data.User
	trade := data.Trade
	var	( userDoc UserDoc
		  order ExecutionManifest
		  meta ExecutionMeta 
		)

		ctx , cancel := context.WithTimeout(context.Background() , 3*time.Second);
		defer cancel();

	if err := json.Unmarshal([]byte(orderString), &order); err != nil {
		fmt.Println("Error:", err)
		return err
	}

	err := user.FindOne(context.TODO(), bson.M{"email": "demo"}).Decode(&userDoc)
	if err != nil {
		fmt.Println("Find Error:", err)
		return err
	}

	apiKeyDecrypted, err := decryptExchangeCred(userDoc.ExchangeCredentials[0].APIKeyEncrypted)
	if err != nil { return err }

	apiSecretDecrypted, _ := decryptExchangeCred(userDoc.ExchangeCredentials[0].APISecretEncrypted)

	binanceClient := binance_connector.NewClient(apiKeyDecrypted, apiSecretDecrypted, "https://testnet.binance.vision")

	orderSer := binanceClient.NewCreateOrderService().
		Symbol(order.OrderSymbol).
		Type(order.OrderType).
		Side(order.OrderSide)

	if order.OrderQuantity > 0 {
		orderSer.Quantity(float64(order.OrderQuantity))
	}

	if order.OrderQuoteOrderQty > 0 {
		orderSer.QuoteOrderQty(float64(order.OrderQuoteOrderQty))
	}

	response, err := orderSer.Do(context.Background())
	if err != nil {
		fmt.Println("Error while executing order !!!", err)
		return err
	}

	respBytes, err := json.Marshal(response)
	if err != nil {
		fmt.Println("Error marshalling response:", err)
		return nil
	}

	if err := json.Unmarshal(respBytes, &meta); err != nil {
		fmt.Println("Error while parsing execution meta !!!", err)
		return nil
	}

	meta.UserId = userDoc.UserID.Hex();
	fmt.Println(meta)

	response , err = trade.InsertOne(ctx , meta);
	if err != nil {
		fmt.Println("[Error]Logging Trade" , err);
		return err;
	}

	return nil
}

func decryptExchangeCred(encoded string) (string, error) {
	data, err := base64.StdEncoding.DecodeString(encoded)
	if err != nil {
		return "", err
	}

	if len(data) < 12+16 {
		return "", errors.New("ciphertext too short")
	}
	iv := data[:12]
	tag := data[12:28]
	ciphertext := data[28:]

	key := sha256.Sum256([]byte("emer_sec_key"))

	block, err := aes.NewCipher(key[:])
	if err != nil {
		return "", err
	}

	gcm, err := cipher.NewGCM(block)
	if err != nil {
		return "", err
	}

	fullCipher := append(ciphertext, tag...)

	plain, err := gcm.Open(nil, iv, fullCipher, nil)
	if err != nil {
		return "", err
	}

	return string(plain), nil
}
