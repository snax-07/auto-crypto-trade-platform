import crypto from "crypto";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { encryptText, decryptText } from "../utils/credentials_encrytor.js";
import { BCRYPT_SALT_ROUNDS } from "../utils/secretEnv.js";

const SALT_ROUNDS = parseInt(BCRYPT_SALT_ROUNDS || "12", 10);


const ExchangeCredentialSchema = new mongoose.Schema(
  {
    _id: { type: mongoose.Schema.Types.ObjectId, auto: true },

    exchangeName: { type: String, required: true, index: true }, // e.g., 'binance'

    apiKeyEncrypted: { type: String, required: true },
    apiSecretEncrypted: { type: String, required: true },
    passphraseEncrypted: { type: String },

    isActive: { type: Boolean, default: true },

    createdAt: { type: Date, default: Date.now }
  },
  { _id: true }
);

ExchangeCredentialSchema.methods.getDecrypted = function () {
  return {
    exchangeName: this.exchangeName,
    apiKey: decryptText(this.apiKeyEncrypted),
    apiSecret: decryptText(this.apiSecretEncrypted),
    passphrase: this.passphraseEncrypted
      ? decryptText(this.passphraseEncrypted)
      : null,
    isActive: this.isActive
  };
};



const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, index: true },
  hashedPassword: { type: String, required: true },
  name: { type: String },
  role: { type: String, enum: ["admin", "trader"], default: "trader" },
  subscription : {type : String , default : "REGULAR" , enum : ["REGULAR" , "PREMIUM" , "DIAMOND"]},

  exchangeCredentials: { type: [ExchangeCredentialSchema], default: [] },
  isVerified: { type: Boolean, default: false },
  isPanVerified: { type: Boolean, default: false },
  UIDAINumber: { type: String },
  phoneNumber : {type : Number},
  referralCode : {type : String},

  marketWatchList : {type : [String] , default: []},
  botCount : {type : Number , default :0},
  
  otp: { type: String },
  refreshToken: { type: String, default: null },
  otpExpiryTime: { type: Date },
  verificationAttempt: { type: Number, default: 3 },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});



UserSchema.methods.hashOtp = function (plainOtp) {
  this.otp = crypto
    .createHash("SHA256")
    .update(plainOtp)
    .digest("hex");

  // OTP valid for 30 minutes
  this.otpExpiryTime = new Date(Date.now() + 30 * 60 * 1000);
  return this.otp;
};



UserSchema.methods.verifyOtp = function (plainOtp) {
  const hashed = crypto
    .createHash("SHA256")
    .update(plainOtp)
    .digest("hex");

  if (!this.otpExpiryTime || new Date() > this.otpExpiryTime) {
    return { status: false, message: "OTP expired" };
  }


  if (this.otp !== hashed) {
    this.verificationAttempt -= 1;
    return { status: false, message: "Invalid OTP" };
  }


  this.isVerified = true;
  this.otp = null;
  this.otpExpiryTime = null;

  return { status: true, message: "OTP verified successfully" };
};


UserSchema.pre("save", async function (next) {
  try {
    this.updatedAt = new Date();

    if (this.isModified("hashedPassword")) {
      const isAlreadyHashed =
        this.hashedPassword.startsWith("$2a$") ||
        this.hashedPassword.startsWith("$2b$");

      if (!isAlreadyHashed) {
        const salt = await bcrypt.genSalt(SALT_ROUNDS);
        this.hashedPassword = await bcrypt.hash(this.hashedPassword, salt);
      }
    }

    next();
  } catch (err) {
    next(err);
  }
});


UserSchema.methods.setPassword = async function (plainPwd) {
  const salt = await bcrypt.genSalt(SALT_ROUNDS);
  this.hashedPassword = await bcrypt.hash(plainPwd, salt);
};


UserSchema.methods.verifyPassword = function (plainPwd) {
  return bcrypt.compare(plainPwd, this.hashedPassword);
};

UserSchema.methods.changePassword = async function(newPassword){
  const hashedPassword = await bcrypt.hash(newPassword , 12);
  this.hashedPassword = hashedPassword;
}

UserSchema.methods.addExchangeCredential = function ({
  exchangeName,
  apiKey,
  apiSecret,
  passphrase = null
}) {
  const cred = {
    exchangeName,
    apiKeyEncrypted: encryptText(apiKey),
    apiSecretEncrypted: encryptText(apiSecret),
    passphraseEncrypted: passphrase ? encryptText(passphrase) : undefined
  };

  this.exchangeCredentials.push(cred);
  return cred;
};

UserSchema.methods.removeExchangeCredential = function (credentialId) {
  this.exchangeCredentials = this.exchangeCredentials.filter(
    (c) => c._id.toString() !== credentialId.toString()
  );
};

UserSchema.methods.updateExchangeCredential = function (credentialId, updates) {
  const credential = this.exchangeCredentials.id(
    new mongoose.Types.ObjectId(credentialId)
  );

  if (!credential) throw new Error("Exchange credential not found");

  if (updates.exchangeName) credential.exchangeName = updates.exchangeName;
  if (updates.apiKey) credential.apiKeyEncrypted = encryptText(updates.apiKey);
  if (updates.apiSecret)
    credential.apiSecretEncrypted = encryptText(updates.apiSecret);

  if (typeof updates.passphrase !== "undefined") {
    credential.passphraseEncrypted = updates.passphrase
      ? encryptText(updates.passphrase)
      : undefined;
  }

  if (typeof updates.isActive !== "undefined") {
    credential.isActive = updates.isActive;
  }

  this.updatedAt = new Date();
  return credential;
};


const User =
  mongoose.models.User || mongoose.model("User", UserSchema);

export default User;
export { ExchangeCredentialSchema };
