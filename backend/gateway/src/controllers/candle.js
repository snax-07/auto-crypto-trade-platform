import WebSocket, { WebSocketServer } from "ws";
import axios from "axios";



const allCandlesSpot = async (req , res) => {
  try {
    const {
      interval , 
      pair,
      before //THIS IS USED FOR THE CREATING THE SCROLL EFFECT AND LOAD DATA WITHOUT BUFFER
    } = req.query;

    //THIS IS THREADPOINT IN RANGE WE WILL FETCH THE DATA
    const LOOKBACK_DAYS = {
      "1m" : 30,
      "5m": 180,
      "15m": 365,
      "1h": 730,
      "1d": 3000
    };

    const days = LOOKBACK_DAYS[interval] ?? 150;

    const endTime = before ? 
                    Number(before) * 1000 :
                    Date.now();
    const startTime = endTime - (days * 24 * 60 * 60 * 1000);

    let fetchEnd = endTime;

    //THIS WILL CONTAIN FOR THAT SPECIFIC TIME RANGE RETURN TO THE USER
    const formatted = [];

    while(formatted.length < 1000){
      const {data} = await axios.get(
        "https://api.binance.com/api/v3/klines",
        {
          params : {
            symbol : pair,
            interval,
            limit : 1000,
            endTime : fetchEnd
          }
        }
      );

      if(!data.length) break;

      for(const k of data){
        if(!k?.[0]) continue;

        formatted.push({
          time : Math.floor(k[0] / 1000),
          open : +k[1],
          high : +k[2],
          low : +k[3],
          close : +k[4]
        })
      }

      fetchEnd = data[0][0] - 1
      if(fetchEnd <= startTime) break;
    }
    console.log("Candle Sent : " + formatted.length)
    res.status(200).json(formatted);
  } catch (error) {
    return res.status(500).json({
      message : "[SERVER] Intenal Error!!",
      error : error.message || error
    });
  }
}


export {
  allCandlesSpot
}