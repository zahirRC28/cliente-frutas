import conectar from "../helpers/fetch";

const urlBase = import.meta.env.VITE_BACKEND_URL;

export const cultivos = () => {
    const TodosLosCultivos = async()  =>{
        const info = await conectar(`${urlBase}`);
    }


  return (
    <div>cultivos</div>
  )
}
