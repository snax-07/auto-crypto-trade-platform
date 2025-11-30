import crypto from "crypto";
import mongoose from "mongoose";

const resetTokenSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "User",
        index: true
    },

    token: {
        type: String,
        required: true,
        unique: true,
        index: true
    },

    expiresAt: {
        type: Date,
        required: true,
        // TTL index -> MongoDB deletes the document 30 minutes after expiresAt
        index: { expires: 60 * 30 }
    },

    used: {
        type: Boolean,
        default: false
    }

}, { timestamps: true });

resetTokenSchema.statics.createTokenForUser = async function (userId) {
    const token = crypto.randomBytes(32).toString("hex");

    const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

    await this.create({
        userId,
        token,
        expiresAt
    });

    return token;
};

resetTokenSchema.statics.validateToken = async function (token) {
    const record = await this.findOne({ token });

    if (!record) return { valid: false, reason: "invalid" };
    if (record.used) return { valid: false, reason: "used" };
    if (record.expiresAt < new Date()) return { valid: false, reason: "expired" };
    return { valid: true, record };
};


resetTokenSchema.methods.markAsUsed = async function () {
    this.used = true;
    await this.save();
};



const ResetToken = mongoose.model("ResetToken", resetTokenSchema);
export default ResetToken;
