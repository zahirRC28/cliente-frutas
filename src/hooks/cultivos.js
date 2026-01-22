import conectar from "../helpers/fetch";
import { userAuth } from "./userAuth";

const urlBase = import.meta.env.VITE_BACKEND_URL;

export const cultivos = () => {
  const { token } = userAuth();


  const todosLosCultivos = async()  =>{
    const info = await conectar(`${urlBase}cultivo/`,'GET',{},token);
    //console.log(info, 'Cultivooos')
    const { cultivos } = info
    return cultivos;
  }


  return {
    todosLosCultivos
  }
}
