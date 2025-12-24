"use client"

import { useEffect, useRef, useState, JSX } from "react"
import {
  createChart,
  CandlestickSeries,
  IChartApi,
  ISeriesApi,
  LogicalRange,
  UTCTimestamp,
} from "lightweight-charts"
import { useTrade, MarketData } from "@/hooks/useTrade"

/* -------------------- TYPES -------------------- */
type Candle = {
  time: UTCTimestamp
  open: number
  high: number
  low: number
  close: number
}

type Interval = "1m" | "5m" | "15m" | "1h" | "1d"

type OrderBookLevel = {
  price: number
  qty: number
}

type OrderBook = {
  bids: OrderBookLevel[]
  asks: OrderBookLevel[]
}

export default function TradePage(): JSX.Element {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const chartRef = useRef<IChartApi | null>(null)
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null)

  const dataRef = useRef<Candle[]>([])
  const earliestTimeRef = useRef<UTCTimestamp | null>(null)
  const loadingHistoryRef = useRef(false)

  const [initialHistoryLoaded, setInitialHistoryLoaded] = useState(false)
  const [interval, setIntervalValue] = useState<Interval>("1m")
  const [ohlcv, setOhlcv] = useState<Candle | null>(null)
  const [symbol, setSymbol] = useState("BTCUSDT")

  const { setMarket } = useTrade()

  const MAX_LEVELS = 10
  const orderBookRef = useRef<OrderBook>({ bids: [], asks: [] })
  const orderBookReadyRef = useRef(false)
  const [orderBook, setOrderBook] = useState<OrderBook>({ bids: [], asks: [] })

  /* -------------------- HELPERS -------------------- */
  function mergeAndSort(older: readonly Candle[], current: readonly Candle[]): Candle[] {
    const map = new Map<UTCTimestamp, Candle>()
    for (const c of current) map.set(c.time, c)
    for (const c of older) map.set(c.time, c)
    return Array.from(map.values()).sort((a, b) => a.time - b.time)
  }

  function updateOrderBook(side: OrderBookLevel[], updates: [string, string][], isBid: boolean): OrderBookLevel[] {
    const map = new Map(side.map(l => [l.price, l.qty]))
    for (const [p, q] of updates) {
      const price = Number(p)
      const qty = Number(q)
      if (qty === 0) map.delete(price)
      else map.set(price, qty)
    }
    return Array.from(map.entries())
      .map(([price, qty]) => ({ price, qty }))
      .sort((a, b) => (isBid ? b.price - a.price : a.price - b.price))
      .slice(0, MAX_LEVELS)
  }

  /* -------------------- CHART INIT -------------------- */
  useEffect(() => {
    if (!containerRef.current) return
    const chart = createChart(containerRef.current, {
      layout: { background: { color: "#fff" }, textColor: "#1E2329" },
      grid: { vertLines: { color: "#F0F3FA" }, horzLines: { color: "#F0F3FA" } },
      timeScale: { 
        timeVisible: true,
        fixLeftEdge: true, // Prevents scrolling into empty space
        fixRightEdge: true,
      },
      rightPriceScale: { 
        borderColor: "#E6E8EB",
        autoScale: true, // Rescales Y-axis when you scroll or change symbols
      },
    })
    const series = chart.addSeries(CandlestickSeries)
    chartRef.current = chart
    seriesRef.current = series
    return () => chart.remove()
  }, [])

  /* -------------------- SYNC CONTEXT & INITIAL DATA -------------------- */
  useEffect(() => {
    const series = seriesRef.current
    const chart = chartRef.current
    if (!series || !chart) return

    let alive = true
    
    // CRITICAL: Clear ALL references to old symbol data immediately
    dataRef.current = [] 
    earliestTimeRef.current = null
    series.setData([]) 

    fetch(`http://localhost:8080/api/candles?symbol=${symbol}&interval=${interval}`)
      .then(res => res.json())
      .then((data: Candle[]) => {
        if (!alive || !data?.length) return
        const sorted = [...data].sort((a, b) => a.time - b.time)
        
        series.setData(sorted)
        dataRef.current = sorted
        earliestTimeRef.current = sorted[0].time

        // THE FIX: Reset the zoom and fit the content perfectly
        chart.timeScale().fitContent()
        
        // Ensure bars have some width even if there are few of them
        chart.timeScale().applyOptions({ barSpacing: 10 })

        setInitialHistoryLoaded(true)

        setMarket((prev): MarketData => ({
          ...prev,
          exchangePair: symbol.replace("/", ""),
          interval: interval,
          orderType: prev?.orderType || "LIMIT",
        } as MarketData))
      })

    return () => { alive = false }
  }, [interval, symbol, setMarket])

  /* -------------------- PAGINATION (Scroll Handling) -------------------- */
  useEffect(() => {
    const chart = chartRef.current
    if (!chart) return
    const onScroll = async (range: LogicalRange | null) => {
      // If we are looking at the far left (past candles)
      if (!range || range.from > 0 || loadingHistoryRef.current || !earliestTimeRef.current || !seriesRef.current) return
      
      loadingHistoryRef.current = true
      const res = await fetch(`http://localhost:8080/api/candles?symbol=${symbol}&interval=${interval}&before=${earliestTimeRef.current}`)
      const older: Candle[] = await res.json()
      
      if (older?.length && seriesRef.current) {
        // Merge without duplicates from previous symbol
        const merged = mergeAndSort(older, dataRef.current)
        seriesRef.current.setData(merged)
        dataRef.current = merged
        earliestTimeRef.current = merged[0].time
      }
      loadingHistoryRef.current = false
    }
    chart.timeScale().subscribeVisibleLogicalRangeChange(onScroll)
    return () => chart.timeScale().unsubscribeVisibleLogicalRangeChange(onScroll)
  }, [interval, symbol])

  /* -------------------- LIVE WS & PRICE SYNC -------------------- */
  useEffect(() => {
    let alive = true
    orderBookReadyRef.current = false

    fetch(`https://api.binance.com/api/v3/depth?symbol=${symbol.replace("/", "").toUpperCase()}&limit=10`)
      .then(res => res.json())
      .then(snapshot => {
        if (!alive) return
        orderBookRef.current.bids = snapshot.bids.map(([p, q]: [string, string]) => ({ price: +p, qty: +q }))
        orderBookRef.current.asks = snapshot.asks.map(([p, q]: [string, string]) => ({ price: +p, qty: +q }))
        orderBookReadyRef.current = true
      })

    const candleWS = new WebSocket("ws://localhost:8081")
    const depthWS = new WebSocket(`wss://stream.binance.com:9443/ws/${symbol.replace("/", "").toLowerCase()}@depth10@100ms`)

    candleWS.onmessage = e => {
      if (!alive || !seriesRef.current) return
      const candle: Candle = JSON.parse(e.data)
      if (!candle?.time) return
      
      // Only update if the websocket message matches our current symbol
      // (Your proxy should ideally handle this, but adding a local check is safer)
      seriesRef.current.update(candle)
      setOhlcv(candle)
      dataRef.current = mergeAndSort([candle], dataRef.current)

      setMarket((prev) => ({
        ...prev,
        price: candle.close, 
      } as MarketData))
    }

    depthWS.onmessage = e => {
      if (!alive || !orderBookReadyRef.current) return
      const data = JSON.parse(e.data)
      orderBookRef.current.bids = updateOrderBook(orderBookRef.current.bids, data.bids, true)
      orderBookRef.current.asks = updateOrderBook(orderBookRef.current.asks, data.asks, false)
    }

    const id = setInterval(() => {
      if (alive) setOrderBook({ bids: [...orderBookRef.current.bids], asks: [...orderBookRef.current.asks] })
    }, 150)

    return () => {
      alive = false
      clearInterval(id)
      candleWS.close()
      depthWS.close()
    }
  }, [symbol, interval, setMarket])

  return (
    <>
      <div className="bg-white border border-gray-200 rounded-xl p-3 flex flex-wrap items-center gap-6 shadow-sm">
        <div className="flex items-center gap-4 border-r border-gray-100 pr-6">
          <select 
            value={symbol} onChange={(e) => setSymbol(e.target.value)}
            className="font-black text-lg bg-transparent border-none outline-none cursor-pointer"
          >
            <option value="BTCUSDT">BTC/USDT</option>
            <option value="ETHUSDT">ETH/USDT</option>
            <option value="SOLUSDT">SOL/USDT</option>
          </select>
          <span className="text-green-500 font-bold text-lg">{ohlcv?.close}</span>
        </div>

        <div className="flex bg-gray-100 p-1 rounded-lg">
          {(['1m', '5m', '15m', '1h', '1d'] as Interval[]).map(t => (
            <button 
              key={t} onClick={() => setIntervalValue(t)}
              className={`px-3 py-1 text-[11px] font-bold rounded-md transition-all ${interval === t ? 'bg-white shadow-sm' : 'text-gray-400'}`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="flex gap-4 text-[11px] text-gray-400 font-medium ml-auto md:ml-0">
          <div>O <span className="text-black ml-1 font-mono">{ohlcv?.open}</span></div>
          <div>H <span className="text-red-500 ml-1 font-mono">{ohlcv?.high}</span></div>
          <div>L <span className="text-green-500 ml-1 font-mono">{ohlcv?.low}</span></div>
          <div>C <span className="text-black ml-1 font-mono">{ohlcv?.close}</span></div>
          {initialHistoryLoaded ? "Live" : "Loading"}
        </div>
      </div>

      <div className="flex flex-col xl:flex-row gap-3 flex-grow min-h-[500px]">
        <div className="flex-grow bg-white border border-gray-200 rounded-2xl shadow-sm flex flex-col overflow-hidden">
          <div className="p-4 border-b border-gray-50">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Market Chart</span>
          </div>
          <div ref={containerRef} className="h-full w-full"></div>
        </div>

        <div className="w-full xl:w-72 bg-white border border-gray-200 rounded-2xl shadow-sm flex flex-col overflow-hidden">
          <div className="p-4 border-b border-gray-50">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Order Book</span>
          </div>
          <div className="p-2 space-y-0.5 font-mono text-[10px]">
            {orderBook.asks.map((level, i) => (
              <div key={`ask-${i}`} className="flex justify-between py-0.5 hover:bg-red-50/50 px-2 rounded">
                <span className="text-red-500">{level.price.toFixed(2)}</span>
                <span className="text-gray-400">{level.qty.toFixed(4)}</span>
              </div>
            ))}
            <div className="py-3 text-center text-lg font-bold text-green-500 bg-green-50/30 my-2 rounded">
              {ohlcv?.close}
            </div>
            {orderBook.bids.map((level, i) => (
              <div key={`bid-${i}`} className="flex justify-between py-0.5 hover:bg-green-50/50 px-2 rounded">
                <span className="text-green-500">{level.price.toFixed(2)}</span>
                <span className="text-gray-400">{level.qty.toFixed(4)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}