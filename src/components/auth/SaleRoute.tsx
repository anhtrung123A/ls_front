import { Outlet } from "react-router";
import NotFound from "../../pages/OtherPage/NotFound";
import { useAuth } from "../../context/AuthContext";

export default function SaleRoute() {
  const { user, isBootstrapping } = useAuth();

  if (isBootstrapping) {
    return null;
  }

  if (user?.roleId !== 7) {
    return <NotFound />;
  }

  return <Outlet />;
}
