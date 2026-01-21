import conectar from "../helpers/fetch";
import { userAuth } from "./userAuth";

const urlBase = import.meta.env.VITE_BACKEND_URL;

export const reportes = () => {
    const { token } = userAuth();
    const todosLosReportes = async()  =>{
        const info = await conectar(`${urlBase}productor/reporte/`,'GET',{},token);
        console.log(info);
    }

  return {
    todosLosReportes
  }
}
