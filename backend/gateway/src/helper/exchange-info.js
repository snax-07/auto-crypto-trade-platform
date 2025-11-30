import axios from "axios"

let exchangeInfoCache = null;
let lastFetchTime = 0;
let CACHE_TTL = 5 * 60 * 1000;


async function getExchnageInfo(pair){
    const now =  Date.now();
    if(exchangeInfoCache && now - lastFetchTime < CACHE_TTL ){
        return exchangeInfoCache;
    }


    const exchangeInfoResponse = await axios.get(`https://api.binance.com/api/v3/exchangeInfo?symbol=${pair}`);

    exchangeInfoCache = exchangeInfoResponse.data.symbols[0];
    lastFetchTime = now;

    return exchangeInfoCache;
}


export default getExchnageInfo;