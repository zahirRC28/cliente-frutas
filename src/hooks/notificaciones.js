import conectar from "../helpers/fetch";
import { userAuth } from "./userAuth";

const urlBase = import.meta.env.VITE_BACKEND_URL;

export const useNotificaciones = () => {
    const { token, getRole, user } = userAuth();
    const rol = getRole();
    const id = user.id;

    const obtenerNotificaciones = async () => {
        let info;
        if(rol === 'Administrador'){
            info = await conectar(`${urlBase}notificacion`, 'GET', {}, token);
        }else if(rol === 'Productor'){
            info = await conectar(`${urlBase}notificacion/por-receptor/${id}`, 'GET', {}, token);
        }

        const { notifications } = info;

        return notifications;
    }

    const marcarComoLeida = async (id) => {
        await conectar(
            `${urlBase}notificacion/${id}/leida`,
            "PUT",
            {},
            token
        );
    };

  return {
    obtenerNotificaciones,
    marcarComoLeida
  }
}
