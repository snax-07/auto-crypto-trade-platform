import { useState ,useEffect } from "react";
import { useAuth, UserIn } from "./useAuth";

export default function use2FA(value  : any , delay = 400 ){
   const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;

}