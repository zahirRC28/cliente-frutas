import { Navigate } from "react-router-dom";
import { userAuth } from "../../hooks/userAuth";

export const PrimerLoginProtection = ({ children }) => {
  const { token, nuevoUser } = userAuth();
    console.log(nuevoUser);
  if (!token) return <Navigate to="/" replace />;
  if (!nuevoUser) return <Navigate to="/" replace />;

  return children;
}
