import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { AwardIcon } from "lucide-react";

const fetchExchangeInfo = async () => {
  const res = await axios.get("https://api.binance.com/api/v3/exchangeInfo");
    const symbols = res.data.symbols.filter((symbol : any) => symbol.status === "TRADING")
    return symbols;
};

export function useExchangeInfo() {
  return useQuery({
    queryKey: ["exchangeInfo"],
    queryFn: fetchExchangeInfo,
    staleTime: Infinity,   // never refetch
    gcTime: Infinity,   // keep forever
  });
}



