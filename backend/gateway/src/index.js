import express from 'express'
import cors from 'cors'
import userRouter from './routes/user.routes.js'
import { PORT } from './utils/secretEnv.js';
import cookieParser from 'cookie-parser'
import botRouter from './routes/automationBot.routes.js';
import { botRateLimiterContext, globalRateLimiterContext, tradeRateLimiterContext } from './utils/rateLimiter.js';
const app = express();

import axios, { all } from 'axios';


app.use(express.json())
app.use(globalRateLimiterContext)
app.use(cors({
    origin : 'http://localhost:3000',
    credentials: true
}))
app.use(express.urlencoded({extended : true}));
app.use(cookieParser());
app.use(express.json())


//User Routes
app.use('/api/v1/auth',userRouter);
app.use('/api/v1/exchange' , userRouter)
app.use('/api/v1/order' ,tradeRateLimiterContext ,  userRouter)

//Automation Routes / BOT Routes
app.use('/api/v1/bot' , botRateLimiterContext , botRouter);

//DEMO

app.get("/api/candles", async (req, res) => {
  try {
    const {
      symbol = "BTCUSDT",
      interval = "1m",
      before, // unix seconds
    } = req.query

    const LOOKBACK_DAYS = {
      "1m": 30,
      "5m": 180,
      "15m": 365,
      "1h": 730,
      "1d": 3000,
    }

    const days = LOOKBACK_DAYS[interval] ?? 30
    const endTime = before
      ? Number(before) * 1000
      : Date.now()

    const startTime = endTime - days * 24 * 60 * 60 * 1000

    let fetchEnd = endTime
    const formatted = []

    while (formatted.length < 1000) {
      const { data } = await axios.get(
        "https://api.binance.com/api/v3/klines",
        {
          params: {
            symbol,
            interval,
            endTime: fetchEnd,
            limit: 1000,
          },
        }
      )

      if (!data.length) break

      for (const k of data) {
        if (!k?.[0]) continue

        formatted.push({
          time: Math.floor(k[0] / 1000),
          open: +k[1],
          high: +k[2],
          low: +k[3],
          close: +k[4],
        })
      }

      fetchEnd = data[0][0] - 1
      if (fetchEnd <= startTime) break
    }
    res.json(formatted)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})


import WebSocket, { WebSocketServer } from "ws"
import { json } from 'stream/consumers';

const wss = new WebSocketServer({ port: 8081 })

wss.on("connection", (client) => {
  console.log("Client connected")

  const binanceWS = new WebSocket(
    "wss://stream.binance.com/ws/btcusdt@kline_1m"
  )

  binanceWS.on("message", (msg) => {
    const data = JSON.parse(msg.toString())
    const k = data.k
    const candle = {
      time: k.t / 1000,
      open: +k.o,
      high: +k.h,
      low: +k.l,
      close: +k.c,
      volume : +k.v
    }

    client.send(JSON.stringify(candle))
  })

  client.on("close", () => {
    if(binanceWS.readyState){
      console.log("Client disconnected !!!!")
      return;
    }
    binanceWS.close()
    console.log("Client disconnected")
  })
})

console.log("✅ WebSocket server running on ws://localhost:8081")


app.listen(PORT , () => console.log(`server is running on ${process.env.PORT} `));