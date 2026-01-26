import '../../styles/manager-dashboard.css';
import { useEffect, useState } from "react";
import { ManagerDashboardCharts } from "./ManagerDashboardCharts";
import { useIncidencias } from "../../hooks/incidencias";
import { useNotificaciones } from "../../hooks/notificaciones";
import { cultivos } from "../../hooks/cultivos";
import { useProductores } from "../../hooks/useProductores";
import { userAuth } from "../../hooks/userAuth";
import { reportes } from "../../hooks/reportes";
import { Card } from "../ui/Card";
import { Sprout, FileText, ChartNoAxesCombined, AlertTriangle, Bell, MapPin, Droplet, TrendingUp, User, Calendar, FileText as FileTextIcon } from "lucide-react";
import { Notificaciones } from "../ui/Notificaciones";
import { tiempoRelativo } from '../../helpers/convertirTiempo';


export const ManagerDashboard = () => {
  const { todosLosCultivos } = cultivos();
  const { todosLosReportes } = reportes();
  const { obtenerIncidenciasPendientes } = useIncidencias();
  const { obtenerNotificaciones } = useNotificaciones();
  const { getRole, user, token } = userAuth();
  const { productores } = useProductores(getRole(), user?.uid, token);

  const [cultivosData, setCultivosData] = useState([]);
  const [reportesData, setReportesData] = useState([]);
  const [incidencias, setIncidencias] = useState([]);
  const [notificaciones, setNotificaciones] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const [cultivos, reportes, incs, notis] = await Promise.all([
        todosLosCultivos(),
        todosLosReportes(),
        obtenerIncidenciasPendientes(),
        obtenerNotificaciones()
      ]);
      //console.log(notis);
      //console.log(cultivos);
      setCultivosData(cultivos || []);
      setReportesData(reportes || []);
      setIncidencias(incs || []);
      setNotificaciones(notis || []);
      setLoading(false);
    };
    fetchData();
  }, []);


  // Mostrar todos los cultivos de los productores del manager (sin filtrar por estado)
  const productoresIds = productores.map(p => p.id || p.uid || p.id_productor);
  const cultivosActivos = cultivosData
    .filter(c => productoresIds.includes(c.id_productor))
    .slice(0, 4);

  // Últimos reportes (semana)
  const ultimosReportes = reportesData.slice(-5).reverse();

  // Incidencias pendientes (solo 4)
  const incidenciasPendientes = incidencias.slice(0, 4);

  // Notificaciones (solo 5)
  const notificacionesMostradas = notificaciones.slice(0, 5);

  // Utilidad para badge de estado de cultivo
  const badgeEstado = (estado) => {
    if (!estado) return null;
    const est = estado.toLowerCase();
    if (est === 'óptimo' || est === 'optimo') return <span className="badge" style={{background:'#e6fbe8',color:'#16a34a'}}>Óptimo</span>;
    if (est === 'bueno') return <span className="badge" style={{background:'#e0e7ff',color:'#2563eb'}}>Bueno</span>;
    if (est === 'atención' || est === 'atencion') return <span className="badge" style={{background:'#fef9c3',color:'#facc15'}}>Atención</span>;
    return <span className="badge">{estado}</span>;
  };

  // Utilidad para badge de prioridad de incidencia
  const badgePrioridad = (prioridad) => {
    if (!prioridad) return null;
    const p = prioridad.toLowerCase();
    if (p === 'alta') return <span className="estado alta">alta</span>;
    if (p === 'media') return <span className="estado media">media</span>;
    if (p === 'baja') return <span className="estado baja">baja</span>;
    return <span className="estado">{prioridad}</span>;
  };

  // Utilidad para badge de tipo de reporte
  const badgeTipoReporte = (tipo) => {
    if (!tipo) return null;
    const t = tipo.toLowerCase();
    if (t === 'seguimiento') return <span className="badge" style={{background:'#e6fbe8',color:'#16a34a'}}>Seguimiento</span>;
    if (t === 'inspección' || t === 'inspeccion') return <span className="badge" style={{background:'#e0e7ff',color:'#2563eb'}}>Inspección</span>;
    if (t === 'mantenimiento') return <span className="badge" style={{background:'#fef9c3',color:'#facc15'}}>Mantenimiento</span>;
    if (t === 'evaluación' || t === 'evaluacion') return <span className="badge" style={{background:'#ccfbf1',color:'#0d9488'}}>Evaluación</span>;
    if (t === 'tratamiento') return <span className="badge" style={{background:'#ede9fe',color:'#8b5cf6'}}>Tratamiento</span>;
    return <span className="badge">{tipo}</span>;
  };

  // Utilidad para icono de notificación
  const iconoNoti = (tipo) => {
    if (!tipo) return <span style={{color:'#2563eb'}}><Bell size={18}/></span>;
    const t = tipo.toLowerCase();
    if (t === 'info') return <span style={{color:'#2563eb'}}><Bell size={18}/></span>;
    if (t === 'alerta') return <span style={{color:'#facc15'}}><AlertTriangle size={18}/></span>;
    if (t === 'éxito' || t === 'exito' || t === 'success') return <span style={{color:'#16a34a'}}><Bell size={18}/></span>;
    return <span style={{color:'#2563eb'}}><Bell size={18}/></span>;
  };

  return (
    <div className="manager-dashboard-root">
      <div className="manager-dashboard-header">
        <h1>Buenos días, Manager</h1>
      </div>
      <div className="manager-dashboard-grid manager-dashboard-grid-v2">
        {/* Columna Central Única: Incidencias, Cultivos por Tipo, Cultivos Activos */}
        <div className="manager-col-center" style={{flex:1}}>
          <div className="panel panel-incidencias panel-incidencias-large">
            <h2><AlertTriangle size={20} style={{color:'#facc15'}}/> Incidencias Pendientes <span className="badge">{incidenciasPendientes.length} activas</span></h2>
            <ul className="incidencias-list">
              {incidenciasPendientes.map((inc, idx) => (
                <li key={inc.id_incidencia || idx} className={`incidencia-card prioridad-${inc.prioridad}`}> 
                  <div className="inc-main">
                    <strong>{inc.titulo}</strong> {badgePrioridad(inc.prioridad)}
                  </div>
                  <div className="inc-meta">
                    <span><MapPin size={15}/> {inc.nombre_cultivo || inc.id_cultivo}</span>
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

          </div>
          <div className="panel panel-cultivos">
            <h2><Sprout size={20} style={{color:'#16a34a'}}/> Cultivos Activos <span className="badge">{cultivosActivos.length} cultivos</span></h2>
            <ul className="cultivos-list">
              {cultivosActivos.map((c, idx) => (
                <li key={c.id_cultivo || idx} className={`cultivo-card estado-${c.estado}`}>
                  <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                    <div>
                      <strong>{c.nombre}</strong> {badgeEstado(c.estado_cultivo || c.estado)}
                      <div className="cultivo-meta">{c.parcela || c.region} · {c.hectareas ? `${c.hectareas} ha` : ''}</div>
                    </div>
                  </div>
                  <div style={{display:'flex',alignItems:'center',gap:16,marginTop:6}}>
                    <span><Droplet size={16}/> {c.sistema_riego}</span>
                    <span><TrendingUp size={16}/> Ciclo: {c.ciclo || 0}%</span>
                  </div>
                  <div className="cultivo-progress">
                    <div className={`cultivo-progress-bar ${badgeEstado(c.estado_cultivo || c.estado)?.props?.children?.toLowerCase() || ''}`}
                      style={{width: `${c.ciclo || 0}%`}}></div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
        {/* Columna Derecha: Notificaciones (componente) arriba, Reportes debajo */}
        <div className="manager-col-right">
          <Notificaciones />
          <div className="panel panel-reportes">
            <h2><FileTextIcon size={20} style={{color:'#2563eb'}}/> Últimos Reportes <span style={{fontWeight:400,marginLeft:8,fontSize:'0.98em'}}>Esta semana</span></h2>
            <ul className="reportes-list">
              {ultimosReportes.map((r, idx) => (
                <li key={r.id_reporte || idx} className="reporte-card">
                  <div style={{display:'flex',alignItems:'center',gap:8}}>
                    <strong>{r.titulo}</strong> {badgeTipoReporte(r.tipo)}
                  </div>
                  <div className="reporte-meta"><User size={15}/> {r.nombre_productor} <Calendar size={15}/> {r.fecha_reporte}</div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
