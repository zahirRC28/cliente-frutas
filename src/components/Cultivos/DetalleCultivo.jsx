import { useState, useEffect, useMemo, cache } from "react";
import { X, TrendingUp, Loader, AlertTriangle, Image } from "lucide-react"; // Añadido icono 'Image'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";
import conectar from "../../helpers/fetch";
import "./DetallesCultivo.css";
import { getCache, setCache } from "../../helpers/cache";

const urlBase = import.meta.env.VITE_BACKEND_URL;

export default function DetalleCultivo({ cultivo, onCerrar, token }) {
  const [datosGrafico, setDatosGrafico] = useState([]);
  const [alertasMeteo, setAlertasMeteo] = useState([]);
  const [alertasPlagas, setAlertasPlagas] = useState([]);
  
  const [multimedia, setMultimedia] = useState([]);
  const [loadingMultimedia, setLoadingMultimedia] = useState(true);

  const [loadingGrafico, setLoadingGrafico] = useState(true);
  const [loadingMeteo, setLoadingMeteo] = useState(true);
  const [loadingPlagas, setLoadingPlagas] = useState(true);
  const [metricaActiva, setMetricaActiva] = useState("temperatura");
  const [infoSuelo, setInfoSuelo] = useState({})

  useEffect(() => {
    if (!cultivo?.id_cultivo) return;
    const cacheKey = `detalle-${cultivo.id_cultivo}`;
    const cached = getCache(cacheKey);
    if (cached) {
      setDatosGrafico(cached.datosGrafico);
      setAlertasMeteo(cached.alertasMeteo);
      setAlertasPlagas(cached.alertasPlagas);
      setLoadingGrafico(false);
      setLoadingMeteo(false);
      setLoadingPlagas(false);
      setLoadingMultimedia(false)
      setMultimedia(cached.multimedia || []);
      return;
    }
    const cargarDatos = async () => {
      try {
        setLoadingGrafico(true);
        setLoadingMeteo(true);
        setLoadingPlagas(true);
        setLoadingMultimedia(true); 

        const body = {
          parcela_id: cultivo.id_cultivo,
          id: cultivo.id_cultivo,
          cultivo: "patata",
          lat: cultivo.centro[0],
          lon: cultivo.centro[1],
          inicio: "2025-01-01",
          fin: "2025-01-15",
          fruta: "manzana"
        };
      
         const urlPlagas = `https://aanearana-deteccion-plagas.hf.space/plagas?lat=${body.lat}&lon=${body.lon}&fruta=${body.fruta}`;
         

        // 2. AÑADIMOS LA LLAMADA A TU RUTA DE MULTIMEDIA
        const urlMultimedia = `${urlBase}multimedia/cultivo/${cultivo.id_cultivo}`;

        const [resGrafico, resMeteo, resPlagas, resMultimedia, aux] = await Promise.all([
          conectar(`${urlBase}apis/historico`, "POST", body, token),
          conectar(`${urlBase}apis/alerta-meteo`, "POST", body, token),
          conectar(`${urlPlagas}`, "GET", {}, token),
          conectar(urlMultimedia, "GET", {}, token), // Obtenemos las imágenes
          conectar(`${urlBase}apis/info-suelo`, "POST", body, token)
          
        ])

     
        
        
        if(aux?.ok)setInfoSuelo(aux.data);
        if (resGrafico?.ok) setDatosGrafico(resGrafico.data || []);
        if (resMeteo?.ok) setAlertasMeteo(resMeteo.data || []);
        if (resPlagas?.ok) setAlertasPlagas(resPlagas.alertas || []);

        if (resMultimedia?.ok) setMultimedia(resMultimedia.archivos || []);


        setCache(cacheKey, {
          datosGrafico: resGrafico?.data || [],
          alertasMeteo: resMeteo?.data || [],
          alertasPlagas: resPlagas?.alertas || [], 
          multimedia: resMultimedia?.archivos || [],
          infoSuelo: aux?.data || {}

        });

      } catch (err) {
        if (err.name !== "AbortError") console.error("Error cargando analíticas:", err);
      } finally {
        setLoadingGrafico(false);
        setLoadingMeteo(false);
        setLoadingPlagas(false);
        setLoadingMultimedia(false); 
      }
    };
    
    cargarDatos();
  }, [cultivo, token]);

  const lineaGrafico = useMemo(() => {
    const metricas = {
      temperatura: { key: "temperatura", name: "Temp. (°C)", color: "#f59e0b" },
      humedad_suelo: { key: "humedad_suelo", name: "Hum. Suelo (%)", color: "#3b82f6" },
      evapotranspiracion: { key: "evapotranspiracion", name: "Evapotranspiración (mm)", color: "#10b981" },
      precipitacion: { key: "precipitacion", name: "Precipitación (mm)", color: "#8b5cf6" },
    };

    const { key, name, color } = metricas[metricaActiva] || metricas.temperatura;
    
    return (
      <Line
        type="monotone"
        dataKey={key}
        name={name}
        stroke={color}
        strokeWidth={3}
        dot={{ r: 4 }}
        activeDot={{ r: 6 }}
        animationDuration={500}
      />
    );
  }, [metricaActiva]);

  return (
    <div className="cultivos-detalle-panel">
      <div className="cultivos-flex-row">
        <div>
          <h3 className="cultivos-form-title">{cultivo.nombre}</h3>
          <span className="cultivos-zona-info">
            {cultivo.zona_cultivo || "Zona no especificada"}
          </span>
        </div>
        <button onClick={onCerrar} className="btn-close">
          <X size={20} />
        </button>
      </div>

      <p className="cultivos-label">
        <strong>Tipo:</strong> {cultivo.tipo_cultivo} |{" "}
        <strong>Riego:</strong> {cultivo.sistema_riego}
      </p>

      <hr className="cultivos-divider" />

      <div className="dashboard-grid">
        {/* --- Gráfico Histórico --- */}
        <div className="card-base card-grafico">
          <div className="chart-header">
            <h4 className="card-title"><TrendingUp size={16} /> Histórico de Condiciones</h4>
            <div className="chart-controls">
              {["temperatura", "humedad_suelo", "evapotranspiracion", "precipitacion"].map((m) => (
                <button
                  key={m}
                  className={`chart-btn ${metricaActiva === m ? `active ${m.split("_")[0]}` : ""}`}
                  onClick={() => setMetricaActiva(m)}
                >
                  {m === "temperatura" && "Temperatura"}
                  {m === "humedad_suelo" && "Hum. Suelo"}
                  {m === "evapotranspiracion" && "Evapotransp."}
                  {m === "precipitacion" && "Precipitación"}
                </button>
              ))}
            </div>
          </div>

          <div className="chart-container">
            {loadingGrafico ? (
              <Loader className="animate-spin" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={datosGrafico}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="fecha" />
                  <YAxis domain={["auto", "auto"]} />
                  <Tooltip />
                  <Legend />
                  {lineaGrafico}
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* --- Plagas --- */}
        <div className="card-base card-plagas">
          <h4 className="card-title danger"><AlertTriangle size={16} /> Alertas Plagas</h4>
          {loadingPlagas ? <Loader /> : alertasPlagas.length ? (
            <div className="plagas-list">
              {alertasPlagas.map((p, i) => {
                const nivel = (p.risk_level || "").toLowerCase();
                const color = nivel === "alto" ? "#ef4444" : nivel === "medio" ? "#f59e0b" : "#10b981";

                return (
                  <div key={i} className="plaga-item" style={{ borderLeft: `5px solid ${color}` }}>
                    <div className="plaga-header">
                      <div className="plaga-name-wrapper"><strong>{p.pest}</strong></div>
                      <span className="plaga-risk-badge" style={{ background: color }}>
                        {p.risk_percent}% ({p.risk_level})
                      </span>
                    </div>
                    <p className="plaga-status">{p.status}</p>
                    <div className="plaga-gdd">GDD 7 días: {p.gdd_7_dias}</div>
                  </div>
                );
              })}
            </div>
          ) : <p className="plagas-empty">No hay alertas activas.</p>}
        </div>

        {/* --- Meteorología --- */}
        <div className="card-base card-meteo">
          <h4 className="card-title"><AlertTriangle size={16} /> Predicción Climática (7 días)</h4>
          {loadingMeteo ? <Loader /> : alertasMeteo.length ? (
            <div className="meteo-list">
              {alertasMeteo.map((d, i) => (
                <div key={i} className="meteo-item">
                  <strong>
                    {new Date(d.date).toLocaleDateString("es-ES", { weekday: "short", day: "numeric", month: "short"})}
                  </strong>
                  <p>{d.estado}</p>
                  <small>🌡️ {d.t_min}° / {d.t_max}° | 💧 {d.hr_min}% | 💨 {d.viento_max} km/h</small>
                </div>
              ))}
            </div>
          ) : <p className="plagas-empty">Sin alertas meteorológicas.</p>}
        </div>

        {/* --- 4. NUEVA SECCIÓN: GALERÍA MULTIMEDIA --- */}
        <div className="card-base card-multimedia" style={{ gridColumn: '1 / -1' }}>
          <h4 className="card-title"><Image size={16} /> Galería de la Parcela</h4>
          {loadingMultimedia ? (
            <Loader className="animate-spin" />
          ) : multimedia.length > 0 ? (
<div className="multimedia-grid">
  {multimedia.map((item) => (
    <div key={item.id_multimedia} className="multimedia-item">
      {/* Cambiamos 'item.tipo_archivo' por 'item.tipo' 
         Asegúrate de que 'url_archivo' es el nombre correcto de tu URL en la BD
      */}
      {item.tipo.includes("video") ? (
        <video controls src={item.url_archivo || item.url} className="multimedia-content" />
      ) : item.tipo.includes("image") ? (
        <img src={item.url_archivo || item.url} alt="Foto cultivo" className="multimedia-content" />
      ) : (
        <a href={item.url_archivo || item.url} target="_blank" rel="noreferrer" className="multimedia-link">
          📄 Ver archivo
        </a>
      )}
      <small className="multimedia-date">
        {/* Si la fecha también tiene otro nombre en la BD, cámbialo aquí */}
        {item.fecha_subida ? new Date(item.fecha_subida).toLocaleDateString("es-ES") : "Sin fecha"}
      </small>
    </div>
  ))}
</div>
          ) : (
            <p className="plagas-empty">Aún no se han subido imágenes para esta parcela.</p>
          )}
        </div>

      </div>
    </div>
  );
}