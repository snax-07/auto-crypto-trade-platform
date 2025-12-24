import { MarketProvider } from "@/hooks/useTrade";
import Trading from "./Trading";

export default function Page(){
    return(
        <MarketProvider>
            <Trading />
        </MarketProvider>
    )
}