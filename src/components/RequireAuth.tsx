// src/components/RequireAuth.tsx
import { ReactNode } from "react";
import { Navigate } from "react-router-dom";

interface RequireAuthProps {
  children: ReactNode;
}

const RequireAuth = ({ children }: RequireAuthProps) => {
  const token = localStorage.getItem("token");
  
  if (!token) {
    // Redirect to login if no token found
    return <Navigate to="/auth" replace />;
  }

  // Token exists, render the protected content
  return <>{children}</>;
};

export default RequireAuth;