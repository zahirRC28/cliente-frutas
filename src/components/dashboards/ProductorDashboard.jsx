import '../../styles/manager-dashboard.css';
import { useEffect, useState } from "react";
import { ManagerDashboardCharts } from "./ManagerDashboardCharts";
import { useIncidencias } from "../../hooks/incidencias";
import { useNotificaciones } from "../../hooks/useNotificaciones";
import { cultivos } from "../../hooks/cultivos";
import { reportes } from "../../hooks/reportes";
import { Notificaciones } from "../ui/Notificaciones";
import { useNavigate } from 'react-router-dom';
import { FileText as FileTextIcon, AlertTriangle, Sprout, PlusCircle, User, Calendar } from "lucide-react";
import { tiempoRelativo } from '../../helpers/convertirTiempo';
import { userAuth } from '../../hooks/userAuth';


export const ProductorDashboard = () => {
  const { cultivosProductor } = cultivos();
  const { todosLosReportes } = reportes();
  const { user } = userAuth();
  const { obtenerIncidenciasPendientes } = useIncidencias();
  const navigate = useNavigate();

  const [cultivosData, setCultivosData] = useState([]);
  const [reportesData, setReportesData] = useState([]);
  const [incidencias, setIncidencias] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const [cultivos, reportes, incs] = await Promise.all([
        cultivosProductor(),
        todosLosReportes(),
        obtenerIncidenciasPendientes()
      ]);
      console.log(cultivos);
      setCultivosData(cultivos || []);
      setReportesData(reportes || []);
      setIncidencias(incs || []);
      setLoading(false);
    };
    fetchData();
  }, []);

  // Incidencias recientes (solo 4)
  const incidenciasRecientes = incidencias.slice(0, 4);
  // Últimos reportes (solo 5)
  const ultimosReportes = reportesData.slice(-5).reverse();

  return (
    <div className="manager-dashboard-root">
      <div className="manager-dashboard-header">
        <h1>Hola, {user.nombre}</h1>
      </div>
      <div className="manager-dashboard-grid manager-dashboard-grid-v2">
        {/* Columna Central: Incidencias, Reportes, Botón, Gráfico */}
        <div className="manager-col-center" style={{flex:1}}>
          <div className="panel panel-incidencias panel-incidencias-large">
            <h2><AlertTriangle size={20} style={{color:'#facc15'}}/> Incidencias Recientes <span className="badge">{incidenciasRecientes.length}</span></h2>
            <ul className="incidencias-list">
              {incidenciasRecientes.map((inc, idx) => (
                <li key={inc.id_incidencia || idx} className={`incidencia-card prioridad-${inc.prioridad}`}> 
                  <div className="inc-main">
                    <strong>{inc.titulo}</strong> <span className={`estado ${inc.prioridad?.toLowerCase()}`}>{inc.prioridad}</span>
                  </div>
                  <div className="inc-meta">
                    <span><User size={15}/> {inc.nombre_productor}</span>
                    <span><Calendar size={15}/> {inc.fecha_creacion ? tiempoRelativo(inc.fecha_creacion) : ''}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <div className="panel panel-reportes panel-incidencias-large" style={{maxWidth:'100%', width:'100%'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
              <h2><FileTextIcon size={20} style={{color:'#2563eb'}}/> Reportes</h2>
              <button
                style={{display:'flex',alignItems:'center',gap:6,background:'#1E7D4D',color:'#fff',border:'none',borderRadius:8,padding:'6px 14px',fontWeight:500,cursor:'pointer',fontSize:'1em'}}
                onClick={()=>navigate('/productor/reportes')}
              >
                <PlusCircle size={18}/> Nuevo Reporte
              </button>
            </div>
            <ul className="reportes-list">
              {ultimosReportes.map((r, idx) => (
                <li key={r.id_reporte || idx} className="reporte-card">
                  <div style={{display:'flex',alignItems:'center',gap:8}}>
                    <strong>{r.titulo}</strong>
                  </div>
                  <div className="reporte-meta"><User size={15}/> {r.nombre_productor} <Calendar size={15}/> {tiempoRelativo(r.fecha_reporte)}</div>
                </li>
              ))}
            </ul>
          </div>
          <div className="panel panel-grafico panel-grafico-large">
            <h2><Sprout size={20} style={{color:'#16a34a'}}/> Cultivos por Tipo</h2>
            <div style={{width:'100%', minHeight:180}}>
              <ManagerDashboardCharts cultivos={cultivosData} />
            </div>

          </div>
        </div>
        {/* Columna Derecha: Notificaciones (componente) */}
        <div className="manager-col-right">
          <Notificaciones />
        </div>
      </div>
    </div>
  );
};