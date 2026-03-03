import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "./AuthContext";

const ProtectedRoute = ({ children, requiredRole }) => {
  const { user } = useContext(AuthContext);

  // ❌ Chưa login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // ❌ Login nhưng chưa chọn role
  if (user.role === 0) {
    return <Navigate to="/select-role" replace />;
  }

  // ❌ Có yêu cầu role cụ thể
  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;