import { userAuth } from '../../hooks/userAuth';
import { Navigate } from "react-router-dom";
import { useEffect } from 'react';

/**
 * Componente de rutas protegidas
 *
 * Restringe el acceso a rutas según si el usuario está autenticado y su rol.
 *
 * @param {Object} props - Props del componente.
 * @param {JSX.Element} props.children - Componente(s) hijos que se van a renderizar si se cumple la autorización.
 * @param {Array<string>} [props.roles] - Arreglo de roles permitidos para acceder a la ruta.
 *
 * @returns {JSX.Element} Componente hijo si cumple permisos, o redirección según rol o token.
 */

export const ProtectedRoutes = ({ children, roles }) => {
  const { getRole, token, logoutUser } = userAuth();

    const userRol = getRole();
    // Asegura que los hooks se llamen SIEMPRE antes de cualquier return
    useEffect(() => {
      if (token && !userRol) {
        logoutUser();
      }
    }, [token, userRol]);

    if(!token) return <Navigate to="/" replace />;
    if(!userRol) return <Navigate to="/" replace />;

    const roleToRoute = {
      Administrador: "/admin",
      Manager: "/manager",
      Asesor: "/asesor",
      Productor: "/productor",
    };
    
    if (token && roles && !roles.includes(userRol)) {
        const target = roleToRoute[userRol] || "/";
        return <Navigate to={target} replace />;
    }
  return children
}
