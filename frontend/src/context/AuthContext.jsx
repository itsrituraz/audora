import { createContext, useContext, useState } from "react";
import api from "../api/axios";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  });

  function saveUser(userData) {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  }

  async function register({ username, email, password, role }) {
    const { data } = await api.post("/auth/register", { username, email, password, role });
    saveUser(data.user);
    return data;
  }

  async function login({ username, email, password }) {
    const { data } = await api.post("/auth/login", { username, email, password });
    saveUser(data.user);
    return data;
  }

  async function logout() {
    await api.post("/auth/logout");
    setUser(null);
    localStorage.removeItem("user");
  }

  return (
    <AuthContext.Provider value={{ user, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
