import mongoose from "mongoose";

const TradeSchema = new mongoose.Schema({
  botId: { type: mongoose.Schema.Types.ObjectId, ref: 'BotInstance', required: true, index: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true }, // denormalized for quick queries
  exchange: { type: String, required: true },
  pair: { type: String, required: true },
  side: { type: String, enum: ['BUY','SELL'], required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  commission: { type: Number, default: 0 },
  status: { type: String, enum: ['success','failed','partial'], default: 'success' },
  exchangeOrderId: { type: String },
  timestamp: { type: Date, default: Date.now, index: true },
  latencyMs: { type: Number } // for signal->exec measurement
});

TradeSchema.index({ botId: 1, timestamp: -1 });
const Trade = mongoose.models.Trade || mongoose.model("Trade" , TradeSchema);
export default Trade
