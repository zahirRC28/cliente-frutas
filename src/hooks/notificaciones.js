import conectar from "../helpers/fetch";
import { userAuth } from "./userAuth";

const urlBase = import.meta.env.VITE_BACKEND_URL;

export const useNotificaciones = () => {
    const { token, getRole, user } = userAuth();
    const rol = getRole();
    const id = user.uid;


    const obtenerNotificaciones = async () => {
        let info;
        if(rol === 'Administrador'){
            info = await conectar(`${urlBase}notificacion`, 'GET', {}, token);
        }else if(rol === 'Productor' || rol === 'Manager'|| rol === 'Asesor'){
            info = await conectar(`${urlBase}notificacion/por-receptor/${id}`, 'GET', {}, token);
        }
        if (!info || typeof info !== 'object') return [];
        const { notifications } = info;;
        console.log(notifications)
        return notifications || [];
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
