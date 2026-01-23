// src/components/Cultivos/DetalleCultivo.jsx
import { useState, useEffect } from "react";
import { X, TrendingUp, Droplets, Loader, Activity } from "lucide-react";
import conectar from "../../helpers/fetch";

// 1. IMPORTAMOS RECHARTS
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';

const urlBase = import.meta.env.VITE_BACKEND_URL;

export default function DetalleCultivo({ cultivo, onCerrar, token }) {
  const [datosGrafico, setDatosGrafico] = useState([]);
  const [datosSensores, setDatosSensores] = useState([]);
  const [loadingDatos, setLoadingDatos] = useState(true);

  useEffect(() => {
    const obtenerDatosAnaliticos = async () => {
      setLoadingDatos(true);
      try {
        const [resGrafico, resSensores] = await Promise.all([
          conectar(`${urlBase}analitica/historico/${cultivo.id_cultivo}`, 'GET', {}, token),
          conectar(`${urlBase}sensores/estado/${cultivo.id_cultivo}`, 'GET', {}, token)
        ]);

        // Si la API trae datos, los usamos. Si no, cargamos datos de ejemplo para probar.
        if (resGrafico?.ok && resGrafico.datos.length > 0) {
          setDatosGrafico(resGrafico.datos);
        } else {
          // DATOS SIMULADOS POR DEFECTO
          setDatosGrafico([
            { mes: 'Ene', humedad: 65, temperatura: 12 },
            { mes: 'Feb', humedad: 59, temperatura: 15 },
            { mes: 'Mar', humedad: 80, temperatura: 20 },
            { mes: 'Abr', humedad: 81, temperatura: 22 },
            { mes: 'May', humedad: 56, temperatura: 28 },
            { mes: 'Jun', humedad: 45, temperatura: 32 },
          ]);
        }

        if (resSensores?.ok && resSensores.datos.length > 0) {
          setDatosSensores(resSensores.datos);
        } else {
          // SENSORES SIMULADOS POR DEFECTO
          setDatosSensores([
            { id: 1, nombre: "Humedad Suelo", valor: "45%", estado: "Óptimo", color: "green" },
            { id: 2, nombre: "Nivel de Agua", valor: "85%", estado: "Óptimo", color: "green" },
            { id: 3, nombre: "pH del Suelo", valor: "7.2", estado: "Revisar", color: "orange" },
          ]);
        }

      } catch (error) {
        console.error("Error cargando analíticas:", error);
      } finally {
        setLoadingDatos(false);
      }
    };

    if (cultivo?.id_cultivo) {
      obtenerDatosAnaliticos();
    }
  }, [cultivo.id_cultivo, token]);

  /* useEffect(() => {
    
    setLoadingDatos(true);
    const timer = setTimeout(() => {
      
      setDatosGrafico([
        { mes: 'Ene', humedad: 65, temperatura: 12 },
        { mes: 'Feb', humedad: 59, temperatura: 15 },
        { mes: 'Mar', humedad: 80, temperatura: 20 },
        { mes: 'Abr', humedad: 81, temperatura: 22 },
        { mes: 'May', humedad: 56, temperatura: 28 },
        { mes: 'Jun', humedad: 45, temperatura: 32 },
      ]);

      setDatosSensores([
        { id: 1, nombre: "Humedad Suelo", valor: "45%", estado: "Óptimo", color: "green" },
        { id: 2, nombre: "Nivel de Agua", valor: "85%", estado: "Óptimo", color: "green" },
        { id: 3, nombre: "pH del Suelo", valor: "7.2", estado: "Revisar", color: "orange" },
      ]);

      setLoadingDatos(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [cultivo.id_cultivo,token]); */
  return (
    <div className="cultivos-detalle-panel" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      
      {/* CABECERA */}
      <div className="cultivos-flex-row" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 className="cultivos-form-title" style={{ margin: 0 }}>{cultivo.nombre}</h3>
          <span style={{ fontSize: '13px', color: '#64748b' }}>{cultivo.zona_cultivo || "Zona no especificada"}</span>
        </div>
        <button onClick={onCerrar} className="btn-close" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
          <X size={20} color="#64748b" />
        </button>
      </div>
      
      <p className="cultivos-label" style={{ marginTop: '10px' }}>
        <strong>Tipo:</strong> {cultivo.tipo_cultivo} | <strong>Riego:</strong> {cultivo.sistema_riego}
      </p>
      
      <hr style={{ margin: '15px 0', borderColor: '#e2e8f0' }} />

      {/* CONTENIDO (Cargando o Gráficos) */}
      {loadingDatos ? (
        <div className="cultivos-loader-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
          <Loader className="animate-spin" size={30} color="#3b82f6" />
          <p style={{ marginTop: '10px', color: '#64748b' }}>Cargando analíticas...</p>
        </div>
      ) : (
        <div className="dashboard-grid" style={{ display: 'flex', flexDirection: 'column', gap: '20px', overflowY: 'auto' }}>
          
          {/* 2. GRÁFICO REAL DE RECHARTS */}
          <div className="card-grafico" style={{ background: '#f8fafc', padding: '15px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '15px', color: '#334155' }}>
              <TrendingUp size={16} color="#0ea5e9" /> Histórico de Condiciones
            </h4>
            
            
            <div style={{ width: '100%', height: 250 }}>
             { <ResponsiveContainer width="100%" height="100%">
                <LineChart data={datosGrafico} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="mes" fontSize={12} stroke="#64748b" />
                  <YAxis fontSize={12} stroke="#64748b" />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="humedad" name="Humedad (%)" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="temperatura" name="Temperatura (°C)" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>}
             {/*  <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}></ResponsiveContainer> */}
            </div>
          </div>

          {/* 3. TABLA DE SENSORES DINÁMICA */}
          <div className="card-tabla" style={{ background: '#f8fafc', padding: '15px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', color: '#334155' }}>
              <Activity size={16} color="#10b981" /> Estado de Sensores
            </h4>
            <table className="tabla-sensores" style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', fontSize: '14px' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #cbd5e1', color: '#64748b' }}>
                  <th style={{ padding: '8px' }}>Sensor</th>
                  <th style={{ padding: '8px' }}>Valor</th>
                  <th style={{ padding: '8px' }}>Estado</th>
                </tr>
              </thead>
              <tbody>
                {datosSensores.map((sensor) => (
                  <tr key={sensor.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Droplets size={14} color="#3b82f6" /> {sensor.nombre}
                    </td>
                    <td style={{ padding: '8px', fontWeight: 'bold' }}>{sensor.valor}</td>
                    <td style={{ padding: '8px', color: sensor.color === 'green' ? '#16a34a' : '#ea580c' }}>
                      {sensor.estado}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      )}
    </div>
  );
}