import { Navigate, Outlet } from "react-router";
import { useAuth } from "../../context/AuthContext";

export default function AdminRoute() {
  const { user, isBootstrapping } = useAuth();

  if (isBootstrapping) {
    return null;
  }

  if (user?.roleId !== 1) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

