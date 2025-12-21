"use client"

import { Children, createContext, Dispatch, SetStateAction, useContext, useEffect, useState } from "react"
import { useAuth } from "./useAuth"
import axios from "axios"
import { toast } from "sonner"

//-------------TYPES-----------//
type executedOrder = {
    _id : string
    time : string
    symbol : string
    side : string
    price : number
    total : number
    status : string
    actionowner : string
}
export type MarketData = {
    orderType : string
    exchangePair : string
    quantity : number
    quoteOrderQty : number   
    strategy : string
    price : number
    interval : string
}

type MarketContextType = {
    market : MarketData | null;
    setMarket  : Dispatch<SetStateAction<MarketData>>;
    setExecutionOrder  : Dispatch<SetStateAction<executedOrder[]>>;
    executionOrder : executedOrder[];
}

const MarketContext = createContext<MarketContextType | null>(null)

export const MarketProvider = ({ children } : {children : React.ReactNode}) => {
    const [market , setMarket] = useState<MarketData>({
        orderType: "",
        quantity: 0,
        quoteOrderQty: 0,
        strategy: "",
        interval: "1m",
        exchangePair : "",
        price : 0
})
    const [executionOrder , setExecutionOrder] = useState<executedOrder[]>([])
    const {user} = useAuth();

    useEffect(() => {
        console.log("Market Auth Provider")
        console.log(market)
        console.log(executionOrder)
        const fetchMarketGoods = async ()=> {
            const res = await axios.get("http://localhost:8080/api/v1/order/getHistory", {withCredentials : true});
            if(!res.data.ok){
                toast.error("Internal server error !!!")
            };
            setExecutionOrder(res.data.history)
        }

        fetchMarketGoods();
    }, []);

    return(
        <MarketContext.Provider value={{
            market ,
            setMarket ,
            setExecutionOrder,
            executionOrder
        }}>
            {children}
        </MarketContext.Provider>
    )
};


export const useTrade = () => {
    const ctx = useContext(MarketContext);
    if(!ctx) throw new Error("useTrade must be inside the MarketProvider");
    return ctx;
}