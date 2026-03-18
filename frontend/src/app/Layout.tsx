import { Outlet } from "react-router";
import { Navigation } from "./components/Navigation";

export function Layout() {
  return (
    <div className="min-h-screen">
      <Navigation />
      <Outlet />
    </div>
  );
}
