import mongoose, { Schema } from "mongoose";



const TradeHistorySchema = new Schema({
    userId : {
        type : mongoose.Schema.Types.ObjectId,
        required : true
    },
    executionOwner : {
        type : String,
        required : true
    },
    time : {
        type : Date,
        default : new Date(Date.now()).toLocaleDateString("en-GB")
    },
    exchangePair : {
        type : String,
        required : true
    },
    price : {
        type : Number,
        required : true
    },
    totalOrderPrice: {
        type : Number,
        required : true,
    },
    side : {
        type : String,
        required : true
    },
});


TradeHistorySchema.index({
    userId : 1
});

const TradeHis = mongoose.models.TradeHis || mongoose.model("TradeHis" , TradeHistorySchema);
export default TradeHis