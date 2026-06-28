import { Outlet } from "react-router-dom";
import { Header } from "../components/Header";
import { Sidebar } from "../components/Sidebar";

export function AppLayout() {
  return (
    <div className="app">
      <Sidebar />
      <div className="main">
        <Header />
        <Outlet />
      </div>
    </div>
  );
}
