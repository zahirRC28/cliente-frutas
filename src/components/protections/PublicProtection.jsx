import { Navigate } from "react-router-dom";
import { userAuth } from "../../hooks/userAuth";

/**
 * Componente de protección de rutas públicas
 *
 * Evita que un usuario autenticado acceda a rutas públicas (ej. login, registro),
 * redirigiéndolo a su ruta correspondiente según su rol.
 *
 * @param {Object} props - Props del componente.
 * @param {JSX.Element} props.children - Componente(s) hijos que se van a renderizar si el usuario no está autenticado.
 *
 * @returns {JSX.Element} Componente hijo si no hay token, o redirección según rol.
 */

export const PublicProtection = ({ children }) => {
  const { token, getRole, nuevoUser } = userAuth();
  console.log(nuevoUser);
  
  if (token) {
    if (nuevoUser) {
      return <Navigate to="/primer-login" replace />;
    }
    const role = getRole();
    //console.log(role);
    const roleToRoute = {
      Administrador: "/admin",
      Manager: "/manager",
      Asesor: "/asesor",
      Productor: "/productor",
    };

    const target = roleToRoute[role] || "/";
    return <Navigate to={target} replace />;
  }

  return children;
}