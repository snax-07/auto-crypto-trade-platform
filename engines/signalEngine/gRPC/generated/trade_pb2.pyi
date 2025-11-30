from google.protobuf import descriptor as _descriptor
from google.protobuf import message as _message
from typing import ClassVar as _ClassVar, Optional as _Optional

DESCRIPTOR: _descriptor.FileDescriptor

class TradeBotRequest(_message.Message):
    __slots__ = ("bot_id", "action", "exchangePair", "amount", "strategy")
    BOT_ID_FIELD_NUMBER: _ClassVar[int]
    ACTION_FIELD_NUMBER: _ClassVar[int]
    EXCHANGEPAIR_FIELD_NUMBER: _ClassVar[int]
    AMOUNT_FIELD_NUMBER: _ClassVar[int]
    STRATEGY_FIELD_NUMBER: _ClassVar[int]
    bot_id: str
    action: str
    exchangePair: str
    amount: float
    strategy: str
    def __init__(self, bot_id: _Optional[str] = ..., action: _Optional[str] = ..., exchangePair: _Optional[str] = ..., amount: _Optional[float] = ..., strategy: _Optional[str] = ...) -> None: ...

class TradeBotRequestReply(_message.Message):
    __slots__ = ("success", "prevAction", "isRunning", "isCompltedSuccefully")
    SUCCESS_FIELD_NUMBER: _ClassVar[int]
    PREVACTION_FIELD_NUMBER: _ClassVar[int]
    ISRUNNING_FIELD_NUMBER: _ClassVar[int]
    ISCOMPLTEDSUCCEFULLY_FIELD_NUMBER: _ClassVar[int]
    success: bool
    prevAction: str
    isRunning: bool
    isCompltedSuccefully: bool
    def __init__(self, success: bool = ..., prevAction: _Optional[str] = ..., isRunning: bool = ..., isCompltedSuccefully: bool = ...) -> None: ...
