import React, { createContext, useContext, useEffect, useState } from "react";
import { pb } from "./pocketbase";

type User = any;

const AuthContext = createContext({
  user: null as User | null,
  setUser: (u: User | null) => {},
  logout: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(pb.authStore.model ?? null);

  useEffect(() => {
    const unsubscribe = pb.authStore.onChange(() => {
      setUser(pb.authStore.record ?? null);
    });
    return () => unsubscribe();
  }, []);

  const logout = async () => {
    try {
      pb.authStore.clear();
      setUser(null);
    } catch (err) {
      console.error("logout error", err);
    }
  };

  return (
    <AuthContext.Provider value={{ user, setUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
