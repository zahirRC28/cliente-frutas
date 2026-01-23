import { Users, Sprout, FileText, ChartNoAxesCombined, Shovel, Loader } from "lucide-react"
import { Card } from "../components/ui/Card"
import { userAuth } from "../hooks/userAuth"
import { useEffect, useState } from "react";
import { DataTable } from "../components/DataTable";
import { reportes } from "../hooks/reportes";
import { cultivos } from "../hooks/cultivos";
import { AdminDashboardCharts } from "../components/dashboards/AdminDashboardCharts";
import { Notificaciones } from "../components/ui/Notificaciones";

export const DashBoard = () => {
  const { getRole, todosUser } = userAuth();
  const { todosLosReportes } = reportes();
  const { todosLosCultivos } = cultivos();
  const [datosUser, setDatosUser] = useState([]);
  const [datosCulti, setDatosCulti] = useState([]);
  const [datosReporte, setDatosReporte] = useState([]);
  const [mostrarUsers, setMostrarUsers] = useState(null);
  const [mostrarCultivos, setMostrarCultivos] = useState(null);
  const [mostrarReportes, setMostrarReportes] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [rolCargado, setRolCargado] = useState(false);
  const rol = getRole();
  useEffect(() => {
    if (rol) {
      setRolCargado(true);
    }
  }, [rol]);
    //console.log(rol);

  const cargandoDatos = async () => {
    setLoading(true);
    setError(false);

    try {
      if (rol === 'Administrador') {
        const [users, reportes, cultivos] = await Promise.all([
          todosUser(),
          todosLosReportes(),
          todosLosCultivos()
        ]);

        setDatosUser(users || []);
        setDatosCulti(cultivos || []);
        setDatosReporte(reportes || []);
      }
    } catch (error) {
      console.error(error);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (rolCargado) {
      cargandoDatos();
    }
  }, [rolCargado]);

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
  const ninguno = () =>{
    setMostrarUsers(false);
    setMostrarCultivos(false);
    setMostrarReportes(false);
  }
  const userColumns = [
    { key: "nombre_completo", label: "Nombre" },
    { key: "rol_nombre", label: "Rol" },
    { key: "correo", label: "Email" }
  ];
  const cultivColumns = [
    { key: "nombre", label: "Nombre Parcela" },
    { key: "created_at", label: "Fecha Creacion" },
    { key: "tipo_cultivo", label: "Tipo" },
    { key: "sistema_riego", label: "Sistema de Riego" },
    { key: "region", label: "Region" },
  ];
  const reportColumns = [
    { key: "titulo", label: "Titulo" },
    { key: "fecha_reporte", label: "Fecha Creacion" },
    { key: "nombre_productor", label: "Nombre Productor" }
  ];
  if (!rolCargado || loading) {
    return (
      <div className="dashboard-loader">
        <Loader className="animate-spin" size={50} />
        <p>Cargando panel...</p>
      </div>
    );
  }
  if (error) {
    return (
      <div className="dashboard-loader error">
        <p>Error al cargar el panel</p>
      </div>
    );
  }
  return (
    <div>
      {/* VISTA ADMINISTRADOR */}
      {rol === 'Administrador' && (
        <>
          <section className="cards-container">
            <Card icono={<Users />} titulo="Usuarios" subtitulo={datosUser.length} variant="counter" onClick={verUsers}/>
            <Card icono={<Sprout />} titulo="Cultivos" subtitulo={datosCulti.length} variant="counter" onClick={verCultivos}/>
            <Card icono={<FileText />} titulo="Reportes" subtitulo={datosReporte.length} variant="counter" onClick={verReportes}/>
            <Card icono={<ChartNoAxesCombined />} titulo="Graficos" variant="counter" onClick={ninguno}/>
          </section>
          <div className="contenedor-Info">
            {(!mostrarUsers && !mostrarCultivos && !mostrarReportes )&& (
              <AdminDashboardCharts
                reportes={datosReporte}
                cultivos={datosCulti}
                options={{
                  responsive: true,
                  maintainAspectRatio: false
                }}
              />
            )}
          {mostrarUsers && (
            <DataTable
              title="Usuarios del sistema"
              columnas={userColumns}
              data={datosUser}
              limit={4}
            />
          )}
          {mostrarCultivos && (
            <DataTable
              title="Usuarios del sistema"
              columnas={cultivColumns}
              data={datosCulti}
              limit={4}
            />
          )}
          {mostrarReportes && (
            <DataTable
              title="Usuarios del sistema"
              columnas={reportColumns}
              data={datosReporte}
              limit={4}
            />
          )}
          <Notificaciones/>
        </div>
        </>
      )}

      {/* VISTA MANAGER */}
      {rol === 'Manager' && (
        <div>
            <section className="cards-container">
                <Card icono={<Sprout />} titulo="Cultivos Activos" subtitulo={2} variant="counter"/>
                <Card icono={<Shovel />} titulo="Productores" subtitulo={2} variant="counter"/>
                <Card icono={<ChartNoAxesCombined />} titulo="Graficos" variant="counter"/>
            </section>
            <div className="contenedor-Info">
              {(!mostrarUsers && !mostrarCultivos && !mostrarReportes )&& (
                <AdminDashboardCharts
                  reportes={datosReporte}
                  cultivos={datosCulti}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false
                  }}
                />
              )}
            {mostrarUsers && (
              <DataTable
                title="Usuarios del sistema"
                columnas={userColumns}
                data={datosUser}
                limit={4}
              />
            )}
            {mostrarCultivos && (
              <DataTable
                title="Usuarios del sistema"
                columnas={cultivColumns}
                data={datosCulti}
                limit={4}
              />
            )}
            {mostrarReportes && (
              <DataTable
                title="Usuarios del sistema"
                columnas={reportColumns}
                data={datosReporte}
                limit={4}
              />
            )}
            <Notificaciones/>
          </div>
        </div>
      )}
      {/* VISTA PRODUCTOR (Simplificada) */}
      {rol === 'Productor' && (
        <div>
            <p>Bienvenido a tu panel de gestión.</p>
            <section className="cards-container">
                <Card icono={<Sprout />} titulo="Mis Cultivos Activos" subtitulo={2} variant="counter"/>
            </section>
        </div>
      )}
    </div>
  );
};