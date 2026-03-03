import { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    const email = localStorage.getItem("email");
    const fullName = localStorage.getItem("fullName");
    const role = localStorage.getItem("role");
    const userId = localStorage.getItem("userId");

    if (token) {
      setUser({
        id: userId,
        token,
        email,
        fullName,
        role: role !== null ? parseInt(role) : null,
      });
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};