import { Outlet } from "react-router-dom";
import "../styles/LayoutGeneral.css";
import { Sidebar } from "../components/sidebar/Sidebar";


export const LayoutGeneral = () => {
  return (
    <div className="general-layout">
      <Sidebar />
      <main className="general-content">
        <Outlet />
      </main>
    </div>
  )
}
