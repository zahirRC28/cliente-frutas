import '../../styles/manager-dashboard.css';
import { useEffect, useState } from "react";
import { ManagerDashboardCharts } from "./ManagerDashboardCharts";
import { useIncidencias } from "../../hooks/incidencias";
import { useNotificaciones } from "../../hooks/useNotificaciones";
import { cultivos } from "../../hooks/cultivos";
import { reportes } from "../../hooks/reportes";
import { Notificaciones } from "../ui/Notificaciones";
import { FileText as FileTextIcon, AlertTriangle, Sprout, User, Calendar } from "lucide-react";
import { tiempoRelativo } from '../../helpers/convertirTiempo';
import { userAuth } from '../../hooks/userAuth';

export const AsesorDashboard = () => {
  const { todosLosCultivos } = cultivos();
  const { todosLosReportes } = reportes();
  const { obtenerIncidenciasPendientes } = useIncidencias();
  const { user } = userAuth();
  // Notificaciones se muestran con el mismo componente

  const [cultivosData, setCultivosData] = useState([]);
  const [reportesData, setReportesData] = useState([]);
  const [incidencias, setIncidencias] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const [cultivos, reportes, incs] = await Promise.all([
        todosLosCultivos(),
        todosLosReportes(),
        obtenerIncidenciasPendientes()
      ]);
      setCultivosData(cultivos || []);
      setReportesData(reportes || []);
      setIncidencias(incs || []);
      setLoading(false);
    };
    fetchData();
  }, []);

  // Reportes por mes (últimos 12 meses)
  const now = new Date();
  const meses = Array.from({length: 12}, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    return d.toLocaleString('default', { month: 'short', year: '2-digit' });
  }).reverse();
  const reportesPorMes = Array(12).fill(0);
  reportesData.forEach(r => {
    if (!r.fecha_reporte) return;
    const d = new Date(r.fecha_reporte);
    const idx = 11 - (now.getFullYear() * 12 + now.getMonth() - (d.getFullYear() * 12 + d.getMonth()));
    if (idx >= 0 && idx < 12) reportesPorMes[idx]++;
  });

  // Incidencias (solo 4)
  const incidenciasPendientes = incidencias.slice(0, 4);

  return (
    <div className="manager-dashboard-root">
      <div className="manager-dashboard-header">
        <h1>Hola, {user.nombre}</h1>
      </div>
      <div className="manager-dashboard-grid manager-dashboard-grid-v2">
        {/* Columna Central Única: Incidencias, Cultivos por Tipo, Reportes por mes */}
        <div className="manager-col-center" style={{flex:1}}>
          <div className="panel panel-incidencias panel-incidencias-large">
            <h2><AlertTriangle size={20} style={{color:'#facc15'}}/> Incidencias Pendientes <span className="badge">{incidenciasPendientes.length} activas</span></h2>
            <ul className="incidencias-list">
              {incidenciasPendientes.map((inc, idx) => (
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
          <div className="panel panel-grafico panel-grafico-large">
            <h2><Sprout size={20} style={{color:'#16a34a'}}/> Cultivos por Tipo</h2>
            <ManagerDashboardCharts cultivos={cultivosData} />
            {/* Leyenda ejemplo (puedes adaptar a tus tipos reales) */}

          </div>
          {/* <div className="panel panel-reportes panel-reportes-mes" style={{maxWidth:'420px', alignSelf:'center', width:'100%'}}>
            <h2><FileTextIcon size={20} style={{color:'#2563eb'}}/> Reportes por Mes</h2>
            <div style={{width:'100%'}}>
              <div style={{display:'flex',alignItems:'flex-end',gap:8,minHeight:120, width:'100%'}}>
                {reportesPorMes.map((val, i) => (
                  <div key={meses[i]} style={{display:'flex',flexDirection:'column',alignItems:'center',width:28}}>
                    <div style={{height:val*12+8,background:'#2563eb',width:16,borderRadius:6,marginBottom:4,transition:'height .2s'}}></div>
                    <span style={{fontSize:11,color:'#6b7280'}}>{meses[i]}</span>
                  </div>
                ))}
              </div>
            </div>
          </div> */}
        </div>
        {/* Columna Derecha: Notificaciones (componente) */}
        <div className="manager-col-right">
          <Notificaciones />
        </div>
      </div>
    </div>
  );
};