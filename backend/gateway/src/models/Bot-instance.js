import mongoose from "mongoose";

const BotInstanceSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  strategy: { type: String, required: true},
  name: { type: String }, // optional friendly name
  pair: { type: String, required: true }, // "BTC/USDT"
  params: { type: Object, default: {} }, // runtime params overridden by user
  quantity: { type: Number }, // optional
  status: { type: String, enum: ['starting','running','stopped','error','completed'], default: 'starting', index: true },
  k8sPodName: { type: String, index: true },
  startTime: { type: Date, default: Date.now },
  stopTime: { type: Date },
  logsUrl: { type: String },
  resultSummary: { type: Object }, // JSON summary after completion
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

BotInstanceSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// helper to mark stopped
BotInstanceSchema.methods.markStopped = function(resultSummary={}) {
  this.status = 'stopped';
  this.stopTime = new Date();
  if (resultSummary) this.resultSummary = resultSummary;
  return this.save();
};

BotInstanceSchema.index({ userId: 1, status: 1 });

const BotInstance = mongoose.models.BotInstance || mongoose.model("BotInstance" , BotInstanceSchema);
export default BotInstance;
