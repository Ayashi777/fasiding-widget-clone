import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Spin } from "antd"; // импортируем Spin

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <Spin size="large" />;
  }

  return user ? <>{children}</> : <Navigate to="/login" />;
};

export default PrivateRoute;
