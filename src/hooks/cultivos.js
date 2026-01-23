import conectar from "../helpers/fetch";
import { userAuth } from "./userAuth";

const urlBase = import.meta.env.VITE_BACKEND_URL;

export const cultivos = () => {
  const { token, user } = userAuth();


  const todosLosCultivos = async()  =>{
    const info = await conectar(`${urlBase}cultivo/`,'GET',{},token);
    //console.log(info, 'Cultivooos')
    const { cultivos } = info
    return cultivos;
    
  }

  const cultivosProductor = async () => {
    //console.log(user);
    //console.log(token);
    const id = user.uid;
    const info = await conectar(`${urlBase}cultivo/productor/${id}`,'GET', {}, token);
    console.log('cultivos productor', info)
    const {cultivos} = info;
    return cultivos;
  }

  return {
    todosLosCultivos,
    cultivosProductor
  }
}
