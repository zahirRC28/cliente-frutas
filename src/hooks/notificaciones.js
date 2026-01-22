import conectar from "../helpers/fetch";
import { userAuth } from "./userAuth";

const urlBase = import.meta.env.VITE_BACKEND_URL;

export const notificaciones = () => {
    const { token, getRole, user } = userAuth();
    const rol = getRole();
    const id = user.id;
    const todasNotifi = async()=>{
        let info;
        if(rol === 'Administrador'){
            info = await conectar(`${urlBase}`, 'GET', {}, token);
        }else if(rol === 'Productor'){
            info = await conectar(`${urlBase}/por-receptor/${id}`, 'GET', {}, token);
        }
        const { notifications } = info;
        return notifications;
    }
  return {
    todasNotifi
  }
}
