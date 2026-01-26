import { useState, useEffect } from "react";
import { NavLink } from "react-router-dom"
import { userAuth } from "../../hooks/userAuth";
import "../../styles/sidebar.css";
import { User, Leaf, MessageCircle, File, LogOut, LeafyGreen, LayoutDashboard, AlertTriangle } from 'lucide-react'
import logo from "../../assets/logo_bueno.png"

export const Sidebar = ({ }) => {
  const { logoutUser, user } = userAuth();

  const datosUser = user || {};
  const rol = datosUser.rol;

  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const rutas = {
    Administrador: "admin",
    Manager: "manager",
    Asesor: "asesor",
    Productor: "productor"
  }

  const rutaBase = rutas[rol];

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "auto";
  }, [mobileOpen]);

  return (
    <>
      {mobileOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setMobileOpen(false)}
        />
      )}
      {!mobileOpen && (
        <button className="mobile-menu-btn" onClick={() => setMobileOpen(true)}>
          ☰
        </button>
      )}

      <aside className={`sidebar ${collapsed ? "collapsed" : ""} ${mobileOpen ? "open" : ""}`}>

        <div className="sidebar-header">
          <button className="menu-btn" onClick={() => { if (window.innerWidth > 768) { setCollapsed(!collapsed); } }}>
            {collapsed && <img className="LogoPrincipal" src={logo}></img>} 
            {!collapsed && <img className="LogoPrincipal" src={logo}></img>}
          </button>
        </div>

        <nav className="sidebar-nav">

          {rutaBase && (
            <NavLink to={`/${rutaBase}`} end className="nav-item" onClick={() => setMobileOpen(false)}>
              <LayoutDashboard /><span>Dashboard</span>
            </NavLink>
          )}

          {/* ENLACE USUARIOS / PRODUCTORES:
              - Administrador -> /admin/users con etiqueta "Usuarios"
              - Manager / Asesor -> /<rutaBase>/productores con etiqueta "Productores"
          */}
          {((rol === 'Administrador') || (rol === 'Manager') || (rol === 'Asesor')) && rutaBase && (
            <NavLink
              to={rol === 'Administrador' ? `/${rutaBase}/users` : `/${rutaBase}/productores`}
              className="nav-item"
              onClick={() => setMobileOpen(false)}
            >
              <User />
              <span>{rol === 'Administrador' ? "Usuarios" : "Productores"}</span>
            </NavLink>
          )}

          {/* ENLACE CULTIVOS */}
          {(rol === 'Administrador' || rol === 'Productor' || rol === 'Manager' || rol === 'Asesor') && rutaBase && (
            <NavLink to={`/${rutaBase}/cultivos`} className="nav-item" onClick={() => setMobileOpen(false)}>
              <Leaf /><span>Cultivos</span>
            </NavLink>
          )}

          {/* ENLACE MENSAJES */}
          {(rol === 'Administrador' || rol === 'Productor' || rol === 'Manager' || rol === 'Asesor') && rutaBase && (
            <NavLink to={`/${rutaBase}/mensajes`} className="nav-item" onClick={() => setMobileOpen(false)}>
              <MessageCircle /><span>Mensajes</span>
            </NavLink>
          )}

          {/* ENLACE REPORTES */}
          {(rol === 'Administrador' || rol === 'Productor' || rol === 'Manager' || rol === 'Asesor') && rutaBase && (
            <NavLink to={`/${rutaBase}/reportes`} className="nav-item" onClick={() => setMobileOpen(false)}>
              <File /><span>Reportes</span>
            </NavLink>
          )}

          {/* ENLACE INCIDENCIAS */}
          {/* Todos los roles ven incidencias */}
          {(rol === 'Administrador' || rol === 'Productor' || rol === 'Manager' || rol === 'Asesor') && rutaBase && (
            <NavLink to={`/${rutaBase}/incidencias`} className="nav-item" onClick={() => setMobileOpen(false)}>
              <AlertTriangle /><span>Incidencias</span>
            </NavLink>
          )}
        </nav>

        <div className="sidebar-footer">
          {!collapsed && (
            <div className="user-info">
              <p className="user-name">{datosUser?.nombre}</p>
              <p className="user-role">{datosUser?.rol}</p>
            </div>
          )}
          <button className="logout" onClick={logoutUser}>
            <LogOut className='Logout' />
            {!collapsed && <span className="logout-text" onClick={() => setMobileOpen(false)}>Cerrar Sesión</span>}
          </button>
        </div>
      </aside>
    </>
  );
};