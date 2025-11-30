import mongoose from "mongoose";

const PerfMetricSchema = new mongoose.Schema({
  botId: { type: mongoose.Schema.Types.ObjectId, ref: 'BotInstance', index: true },
  snapshotAt: { type: Date, default: Date.now, index: true },
  pnl: { type: Number, default: 0 },
  winRate: { type: Number, default: 0 },
  lossRate: { type: Number, default: 0 },
  avgLatencyMs: { type: Number, default: 0 },
  tradesCount: { type: Number, default: 0 },
  maxDrawdown: { type: Number, default: 0 }
});

PerfMetricSchema.index({ botId: 1, snapshotAt: -1 });

const BotMatrics = mongoose.models.BotMatrics || mongoose.model("BotMatrics" , PerfMetricSchema);
export default BotMatrics;
