import conectar from "../helpers/fetch";
import { userAuth } from "./userAuth";

const urlBase = import.meta.env.VITE_BACKEND_URL;

export const useIncidencias = () => {
  const { token, getRole, user } = userAuth();
  const rol = getRole();
  const id = user?.uid || user?.id;

  // Obtiene incidencias pendientes para el Manager
  const obtenerIncidenciasPendientes = async () => {
    let info;
    if (rol === "Manager") {
      info = await conectar(`${urlBase}incidencia/listado`, "GET", {}, token);
    } else if (rol === "Productor") {
      info = await conectar(`${urlBase}incidencia/productor/${id}`, "GET", {}, token);
    } else {
      info = await conectar(`${urlBase}incidencia/listado`, "GET", {}, token);
    }
    // Filtra solo las incidencias abiertas o en proceso
    const pendientes = Array.isArray(info?.data)
      ? info.data.filter(inc => inc.estado !== "cerrada")
      : [];
    return pendientes;
  };

  return {
    obtenerIncidenciasPendientes
  };
};
