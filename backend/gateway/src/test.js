import fs from "fs";
import crypto from "crypto";
import WebSocket from "ws";

// ----------------------
// CONFIG
// ----------------------
const API_KEY = "JolPA5ylfos8qL86qk4fKn7UFlwzQRqx1tg5Nsm7NzSe2CYH4cpsVLekEuqGHgu1";           // The API key generated after registering your public key
const PRIVATE_KEY_PATH = "./test-prv-key.pem";  // Private key in project root

// Load the private Ed25519 key
const privateKeyPem = fs.readFileSync(PRIVATE_KEY_PATH, "utf8");
const privateKey = crypto.createPrivateKey({
  key: privateKeyPem,
  format: "pem",
  type: "pkcs8"
});

// Connect to the Binance Spot Testnet WS-API
const ws = new WebSocket("wss://ws-api.testnet.binance.vision/ws-api/v3");

// ----------------------
// Authentication
// ----------------------
ws.on("open", () => {
  console.log("Connected → Sending auth request…");

  const timestamp = Date.now();
  const payload = `timestamp=${timestamp}`;

  // Ed25519 signature (no hash algorithm)
  const signature = crypto.sign(null, Buffer.from(payload), privateKey)
                          .toString("base64");
  const authPayload = {
    id: 1,
    method: "auth",
    params: {
      apiKey: API_KEY,
      timestamp: timestamp,
      signature: signature
    }
  };

  ws.send(JSON.stringify(authPayload));
});

// ----------------------
// Handlers
// ----------------------
ws.on("message", (msg) => {
  console.log("WS →", msg.toString());
});

ws.on("error", (err) => {
  console.error("WS Error:", err.message);
});

ws.on("close", () => {
  console.log("WS closed");
});
