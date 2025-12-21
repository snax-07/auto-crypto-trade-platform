/*---------MODULES IMPORTS----------*/
import express from 'express'
import cors from 'cors'
import { WebSocketServer } from 'ws';

/*---------INTERNAL ROUTE IMPORTS-------*/
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

function alignEndTime(timestampMs, interval) {
  const map = {
    "1m": 60_000,
    "5m": 5 * 60_000,
    "15m": 15 * 60_000,
    "1h": 60 * 60_000,
    "1d": 24 * 60 * 60_000,
  }

  const step = map[interval]
  return Math.floor(timestampMs / step) * step
}


app.get("/api/candles", async (req, res) => {
  try {
    const { symbol = "BTCUSDT", interval = "1m", before } = req.query

    const LOOKBACK_DAYS = {
      "1m": 30,
      "5m": 180,
      "15m": 365,
      "1h": 730,
      "1d": 3000,
    }

    const days = LOOKBACK_DAYS[interval] ?? 30

    const rawEnd = before
      ? Number(before) * 1000
      : Date.now()

    // ✅ ALIGN TIMESTAMP (THIS FIXES 400 ERROR)
    let fetchEnd = alignEndTime(rawEnd, interval)

    const startTime =
      fetchEnd - days * 24 * 60 * 60 * 1000

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

      // move backwards in time
      fetchEnd = data[0][0] - 1

      if (fetchEnd <= startTime) break
    }

    return res.json(formatted)
  } catch (e) {
    console.log(e.message)
    return res.status(500).json({ error: e.message })
  }
})

/*---------------WEBSOCKET REGISTARY--------------*/

const wss = new WebSocketServer({ port: 8081 })
wss.on("connection", (client) => {
  console.log("Client connected")

  const binanceWS = new WebSocket(
    "wss://stream.binance.com/ws/btcusdt@kline_1m"
  )

  binanceWS.onmessage = (event) => {
    const data = JSON.parse(event.data.toString())
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
  }

  client.on("close", () => {
    if(binanceWS.readyState){
      console.log("Client disconnected !!!!")
      return;
    }
    binanceWS.close()
    console.log("Client disconnected")
  })
})


app.listen(PORT , () => console.log(`server is running on ${process.env.PORT} `));