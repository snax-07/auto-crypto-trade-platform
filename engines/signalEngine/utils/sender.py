import grpc
import time
from gRPC.generated import trade_pb2, trade_pb2_grpc


def SendTradeDetails(botId, strategy, symbol, side, quantity=None):
    channel = grpc.insecure_channel("localhost:50051")
    stub = trade_pb2_grpc.TradeBotServiceStub(channel)

    # Correct message type and field names
    request = trade_pb2.TradeRequest(
        bot_id=botId,
        symbol=symbol,
        action=side,
        quantity=quantity if quantity is not None else 0.0,
        strategy=strategy,
        timestamp=int(time.time() * 1000)  # milliseconds
    )

    # Correct RPC name from proto
    response = stub.ExecuteTrade(request)
    print(response)
    return response
