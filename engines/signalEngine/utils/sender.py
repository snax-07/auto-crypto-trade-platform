import grpc
from gRPC.generated import trade_pb2_grpc , trade_pb2

def SendTradeDetails(botId , strategy, symbol , side , quantity = None):
    channel = grpc.insecure_channel("localhost:50051")
    stub = trade_pb2_grpc.TradeBotServiceStub(channel=channel)

    request = trade_pb2.TradeBotRequest(
        bot_id=botId,
        exchangePair=symbol,
        amount = quantity,
        strategy=strategy,
        action=side
    )
    response = stub.TradeBotAction(request)
    print(response)
    return response
