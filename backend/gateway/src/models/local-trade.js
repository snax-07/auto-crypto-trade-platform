import mongoose from 'mongoose';
const OrderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true },
  orderId : Number,
  exchangePair: String,
  side: String,
  quantity: Number,
  quoteOrderQty: Number,
  orderType: { type: String, default: 'MARKET' },
  status: { type: String, default: 'queued' },
  attempts: { type: Number, default: 0 },
  lastError: String,
  exchangeOrderId: String,
  executionMeta: Object
}, { timestamps: true });

export default mongoose.models.Order || mongoose.model('Order', OrderSchema);
