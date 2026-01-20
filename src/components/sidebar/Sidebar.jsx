import { useState, useEffect} from "react";
import { NavLink } from "react-router-dom"
import { userAuth } from "../../hooks/userAuth";
import "../../styles/sidebar.css";
import { User, Leaf, MessageCircle, File, LogOut, LeafyGreen, LayoutDashboard } from 'lucide-react'
// import dashboarndIcon from "../../assets/dashboard/dashboardIcon.svg";
// import configuracionIcon from "../../assets/dashboard/configuracionIcon.svg";
// import incidenciasIcon from "../../assets/dashboard/incidenciasIcon.svg";
// import mantenimientosIcon from "../../assets/dashboard/mantenimientoIcon.svg";
// import maquinasIcon from "../../assets/dashboard/maquinasIcon.svg";
// import menuIcon from "../../assets/reparar.svg";
// import usuariosIcon from "../../assets/dashboard/usuariosIcon.svg";
// import salirIcon from "../../assets/dashboard/salirIcon.svg";
//mport { Logo } from '../ui/Logo';

/**
 * Componente Sidebar
 *
 * Renderiza un menú lateral (sidebar) responsivo con navegación condicional
 * según el rol del usuario.
 * Permite colapsar/expandir el menú y mostrar información del usuario actual.
 *
 * @component
 * @returns {JSX.Element} Sidebar con navegación y funcionalidad de logout.
 *
 * @example
 * <Sidebar />
 */

export const Sidebar = ({}) => {
  const { logoutUser, user } = userAuth();
  //console.log(logoutUser);
  const datosUser = user;
  const rol = datosUser.rol;
  //console.log(datosUser.nombre);
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Map de rutas según el rol
  const rutas = {
    Administrador: "admin",
    Manager: "manager",
    Asesor: "asesor",
    Prodcutor: "productor"
  }
  // Evita scroll cuando el menú móvil está abierto
  
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
      {/*Si tiene el nombre de la clase "collapsed", se aplica el estilo para que cambie el sidebar*/}
      <aside className={`sidebar ${collapsed ? "collapsed" : ""} ${mobileOpen ? "open" : ""}`}>
        
        <div className="sidebar-header">
          <button className="menu-btn" onClick={() => { if (window.innerWidth > 768) { setCollapsed(!collapsed);}}}>
            {collapsed && <LeafyGreen className='LogoPrincipal' size={35}/>}
            {!collapsed && <LeafyGreen className='LogoPrincipal' size={40}/>}
          </button>
        </div>
        <nav className="sidebar-nav">
          <NavLink to="/" className="nav-item" onClick={() => setMobileOpen(false)}>
            <LayoutDashboard /><span>Dashboard</span>
          </NavLink>
          {(rol === 'Administrador' || rol === 'Productor') && (
            <NavLink to={`/${rutas[rol]}/users`} className="nav-item" onClick={() => setMobileOpen(false)}>
              <User/><span>{rol === 'Administrador'? "Usuarios" : "Productores" }</span>
            </NavLink>
          )}
          {(rol === 'Administrador' || rol === 'Productor'|| rol === 'Manager' || rol === 'Asesor') && (
            <NavLink to={`/${rutas[rol]}/cultivos`} className="nav-item" onClick={() => setMobileOpen(false)}>
              <Leaf/><span>Cultivos</span>
            </NavLink>
          )}
          {(rol === 'Administrador' || rol === 'Productor'|| rol === 'Manager' || rol === 'Asesor') && (
            <NavLink to={`/${rutas[rol]}/mensajes`} className="nav-item" onClick={() => setMobileOpen(false)}>
              <MessageCircle/><span>Mensajes</span>
            </NavLink>
          )}
          {(rol === 'Administrador' || rol === 'Productor'|| rol === 'Manager' || rol === 'Asesor') && (
            <NavLink to={`/${rutas[rol]}/reportes`} className="nav-item" onClick={() => setMobileOpen(false)}>
              <File/><span>Reportes</span>
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