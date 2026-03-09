import { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // thêm dòng này

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    const email = localStorage.getItem("email");
    const fullName = localStorage.getItem("fullName");
    const role = localStorage.getItem("role");
    const userId = localStorage.getItem("userId");
    const candidateId = localStorage.getItem("candidateId");

    if (token) {
      setUser({
        id: userId,
        token,
        email,
        fullName,
        role: role !== null ? parseInt(role) : null,
      });
    }

    setLoading(false); // rất quan trọng
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};