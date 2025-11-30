package data

import (
    "context"
    "fmt"
    "log"

    "go.mongodb.org/mongo-driver/v2/mongo"
    "go.mongodb.org/mongo-driver/v2/mongo/options"
    "go.mongodb.org/mongo-driver/v2/mongo/readpref"
)

var (
    Client *mongo.Client
    Trade  *mongo.Collection
    User   *mongo.Collection
)


func InitMongo() {
	uri := "mongodb+srv://snax:snax@snax1.svjz8.mongodb.net/"
	if uri == "" {
		log.Fatal("Mongo connection URL not found !!")
	}

	serverApi := options.ServerAPI(options.ServerAPIVersion1)
	opts := options.Client().ApplyURI(uri).SetServerAPIOptions(serverApi)

	// v2: Connect only takes *options.ClientOptions, no context argument
	var err error
	Client, err = mongo.Connect(opts)
	if err != nil {
		panic(err)
	}

	// Ping still uses context
	if err := Client.Ping(context.TODO(), readpref.Primary()); err != nil {
		panic(err)
	}

	// Initialize collections
	Trade = Client.Database("SnaxQuantum").Collection("trade")
	User = Client.Database("SnaxQuantum").Collection("users")

	fmt.Println("MongoDB connected successfully!")
}

// Call this when program exits
func CloseMongo() {
	if err := Client.Disconnect(context.TODO()); err != nil {
		panic(err)
	}
}