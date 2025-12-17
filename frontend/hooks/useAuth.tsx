"use client";

import axios from "axios";
import { createContext, useContext, useEffect, useState , SetStateAction , Dispatch} from "react";

export type UserIn = {
  _id: string;
  email: string;
  name: string;
  avatar: string;
  subscription : string;
  isPanVerified : boolean;
  marketWatchList : string[];
  referralCode?: string | null;
  phoneNumber?: string | null;
};

type AuthContextType = {
  user: UserIn | null;
  setUser: Dispatch<SetStateAction<UserIn | null>>;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<UserIn | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("client auth provider")
    console.log("User : " , user)
    const fetchMe = async () => {
      try {
        const res = await axios.get("http://localhost:8080/api/v1/auth/me" , {withCredentials : true})
        if (!res.data.ok) throw new Error("Not authenticated");
        console.log(res.data.user, "demo")
        const data = res.data
        setUser(data.user);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchMe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};
