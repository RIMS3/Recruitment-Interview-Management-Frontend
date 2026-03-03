import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "./AuthContext";

const RoleGuard = ({ children }) => {
  const { user } = useContext(AuthContext);

  // Nếu đã login nhưng chưa chọn role
  if (user && user.role === 0) {
    return <Navigate to="/select-role" replace />;
  }

  return children;
};

export default RoleGuard;