/*---------MODULES IMPORTS----------*/
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import axios from 'axios';
import cookieParser from 'cookie-parser';
import WebSocket, { WebSocketServer } from 'ws';
import http from 'http';

/*---------INTERNAL ROUTE IMPORTS-------*/
import userRouter from './routes/user.routes.js';
import botRouter from './routes/automationBot.routes.js';
import { PORT } from './utils/secretEnv.js';
import { 
    botRateLimiterContext, 
    globalRateLimiterContext, 
    tradeRateLimiterContext 
} from './utils/rateLimiter.js';

// Load Env
dotenv.config();

const app = express();
app.use(express.json())
app.use(cors({
  origin : "http://localhost:3000",
  credentials : true
}));
app.use(cookieParser());
/*---------MIDDLEWARE----------*/
app.use(express.json());
app.use(globalRateLimiterContext);
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

/*---------ROUTES----------*/
app.use('/api/v1/auth', userRouter);
app.use('/api/v1/exchange', userRouter);
app.use('/api/v1/order', tradeRateLimiterContext, userRouter);
app.use('/api/v1/bot', botRateLimiterContext, botRouter);

/*---------CANDLE ALIGNMENT UTILS----------*/
function alignEndTime(timestampMs, interval) {
    const map = {
        "1m": 60_000, "5m": 300_000, "15m": 900_000, "1h": 3_600_000, "1d": 86_400_000
    };
    const step = map[interval] || 60_000;
    return Math.floor(timestampMs / step) * step;
}

/*---------HTTP CANDLES ENDPOINT----------*/

let sym = "BTCUSDT"
app.get("/api/candles", async (req, res) => {
    try {
        const { symbol, interval, before } = req.query;
        if (!symbol) return res.status(400).json({ error: "Symbol is required" });

        sym = symbol
        const LOOKBACK_DAYS = { "1m": 30, "5m": 180, "15m": 365, "1h": 730, "1d": 3000 };
        const days = LOOKBACK_DAYS[interval] ?? 30;
        const rawEnd = before ? Number(before) * 1000 : Date.now();
        let fetchEnd = alignEndTime(rawEnd, interval);
        const startTime = fetchEnd - days * 24 * 60 * 60 * 1000;

        const formatted = [];
        while (formatted.length < 1000) {
            const { data } = await axios.get("https://api.binance.com/api/v3/klines", {
                params: { symbol, interval, endTime: fetchEnd, limit: 1000 }
            });
            if (!data.length) break;
            for (const k of data) {
                formatted.push({ 
                    time: Math.floor(k[0] / 1000), 
                    open: +k[1], 
                    high: +k[2], 
                    low: +k[3], 
                    close: +k[4] 
                });
            }
            fetchEnd = data[0][0] - 1;
            if (fetchEnd <= startTime) break;
        }
        return res.json(formatted);
    } catch (e) {
        return res.status(500).json({ error: e.message });
    }
});

/*---------------WEBSOCKET REGISTRY--------------*/
// Attaching WebSocket to the HTTP server
const wss = new WebSocketServer({ port : 8081 });

wss.on("connection", (client, req) => {
    console.log("Client connected to Gateway WS");

   const url = new URL(req.url, `http://${req.headers.host}`);
// Get symbol from query params, e.g., ?symbol=ethusdt
const symbolFromUrl = url.searchParams.get('symbol') || 'btcusdt'; 
// Remove the 'x' that was at the end of this line in your snippet
    
    let binanceWS = null;

    const connectToBinance = (symbol) => {
        if (binanceWS) {
            binanceWS.terminate(); // Use terminate for cleaner cleanup
        }
        
        const cleanSymbol = symbol.toLowerCase();
        // Use the 'WebSocket' class imported from 'ws'
        binanceWS = new WebSocket(`wss://stream.binance.com/ws/${cleanSymbol}@kline_1m`);

        binanceWS.on('message', (data) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(data.toString());
            }
        });

        binanceWS.on('error', (err) => console.error(`Binance WS Error [${cleanSymbol}]:`, err.message));
        
        binanceWS.on('close', () => console.log(`Binance connection closed for ${cleanSymbol}`));
    };

    connectToBinance(symbolFromUrl);

    client.on("message", (msg) => {
        try {
            const data = JSON.parse(msg.toString());
            if (data.type === "SUBSCRIBE" && data.symbol) {
                console.log(`Switching to: ${data.symbol}`);
                connectToBinance(data.symbol);
            }
        } catch (e) { /* ignore invalid JSON */ }
    });

    client.on("close", () => {
        console.log("Client disconnected");
        if (binanceWS) binanceWS.terminate();
    });
});

/*---------START SERVER----------*/
app.listen(PORT, () => {
    console.log(`Server & WebSocket running on port ${PORT}`);
});