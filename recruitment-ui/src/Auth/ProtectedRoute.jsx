import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "./AuthContext";

const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, loading } = useContext(AuthContext);

  // 🟡 Đang load user từ localStorage → chưa quyết định gì
  if (loading) {
    return null; // hoặc <div>Loading...</div>
  }

  // ❌ Chưa login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // ❌ Login nhưng chưa chọn role
  if (user.role === 0) {
    return <Navigate to="/select-role" replace />;
  }

  // ❌ Không đúng role
  if (requiredRole) {
    const allowed = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    if (!allowed.includes(user.role)) {
      return <Navigate to="/" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;