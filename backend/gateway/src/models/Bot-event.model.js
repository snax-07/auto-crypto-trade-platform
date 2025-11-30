import mongoose from "mongoose";

const BotEventSchema = new mongoose.Schema({
  botId: { type: mongoose.Schema.Types.ObjectId, ref: 'BotInstance', required: true, index: true },
  type: { type: String, required: true, index: true }, // e.g., 'started','signal','trade','error','stopped'
  message: { type: String },
  meta: { type: Object }, // optional structured metadata
  timestamp: { type: Date, default: Date.now, index: true }
});

BotEventSchema.index({ botId: 1, timestamp: -1 });

const BotEvent = mongoose.models.BotEvent || mongoose.model("BotEvent" , BotEventSchema);
export default BotEvent;
