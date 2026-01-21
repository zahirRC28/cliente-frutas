import { Users, Sprout, FileText } from "lucide-react"
import { Card } from "../components/ui/Card"
import { userAuth } from "../hooks/userAuth"
import { useEffect, useState } from "react";
import { DataTable } from "../components/DataTable";
import { reportes } from "../hooks/reportes";

export const DashBoard = () => {
  const { getRole, todosUser } = userAuth();
  const { todosLosReportes } = reportes();
  const [datosUser, setDatosUser] = useState([]);
  const [datoReporte, serDatosReporte] = useState([]);
  const [mostrarUsers, setMostrarUsers] = useState(null);
  const [mostrarCultivos, setMostrarCultivos] = useState(null);
  const [mostrarReportes, setMostrarReportes] = useState(null);

  const rol = getRole();
  //console.log(rol);

  const cargandoDatos = async()=>{
    try {
      if(rol === 'Administrador'){
        const users = await todosUser();
        const reportes = await todosLosReportes();
        //console.log(users);
        setDatosUser(users);
      }
    } catch (error) {
      console.error(error);
    }
    
  }
  useEffect(()=>{
    cargandoDatos();
  },[])
  const verUsers = () =>{
    setMostrarUsers(true);
    setMostrarCultivos(false);
    setMostrarReportes(false);
  }
  const verCultivos = () =>{
    setMostrarUsers(false);
    setMostrarCultivos(true);
    setMostrarReportes(false);
  }
  const verReportes = () =>{
    setMostrarUsers(false);
    setMostrarCultivos(false);
    setMostrarReportes(true);
  }

  const userColumns = [
    { key: "nombre_completo", label: "Nombre" },
    { key: "rol_nombre", label: "Rol" },
    { key: "correo", label: "Email" }
  ];
  return (
  <>
    { rol === 'Administrador' && (
      <>
        <section className="cards-container">
          <Card icono={<Users />} titulo="Usuarios" subtitulo={datosUser.length} variant="counter" onClick={verUsers}/>
          <Card icono={<Sprout />} titulo="Cultivos" subtitulo={18} variant="counter" onClick={verCultivos}/>
          <Card icono={<FileText />} titulo="Informes" subtitulo={57} variant="counter" onClick={verReportes}/>
        </section>
        {mostrarUsers &&(
          <DataTable
            title="Usuarios del sistema"
            columnas={userColumns}
            data={datosUser}
            //todos="/admin/users"
            limit={3}
          />
        )}
        

      </>
    )}
  </>
  )
}
