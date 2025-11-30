import crypto from "crypto";

const RAW_KEY = process.env.SECRET_KEY || "emer_sec_key";
const SECRET_KEY = crypto.createHash("sha256").update(RAW_KEY).digest(); // ✅ 32 bytes
const ALGO = "aes-256-gcm"; 
const IV_LENGTH = 12; 

function encryptText(plain) {
  if (!plain) return null;

  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGO, SECRET_KEY, iv);
  const encrypted = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();

  return Buffer.concat([iv, tag, encrypted]).toString("base64");
}

function decryptText(ciphertext) {
  if (!ciphertext) return null;

  const data = Buffer.from(ciphertext, "base64");
  const iv = data.slice(0, IV_LENGTH);
  const tag = data.slice(IV_LENGTH, IV_LENGTH + 16);
  const encrypted = data.slice(IV_LENGTH + 16);

  const decipher = crypto.createDecipheriv(ALGO, SECRET_KEY, iv);
  decipher.setAuthTag(tag);
  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);

  return decrypted.toString("utf8");
}


export { encryptText, decryptText };
