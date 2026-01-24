import { useState, useEffect, useMemo } from "react";
import { X, TrendingUp, Loader, AlertTriangle } from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";
import conectar from "../../helpers/fetch";
import "./DetallesCultivo.css";

const urlBase = import.meta.env.VITE_BACKEND_URL;

export default function DetalleCultivo({ cultivo, onCerrar, token }) {
  const [datosGrafico, setDatosGrafico] = useState([]);
  const [alertasMeteo, setAlertasMeteo] = useState([]);
  const [alertasPlagas, setAlertasPlagas] = useState([]);
  const [loadingGrafico, setLoadingGrafico] = useState(true);
  const [loadingMeteo, setLoadingMeteo] = useState(true);
  const [loadingPlagas, setLoadingPlagas] = useState(true);
  const [metricaActiva, setMetricaActiva] = useState("temperatura");

  useEffect(() => {
    if (!cultivo?.id_cultivo) return;

    const cargarDatos = async () => {
      try {
        setLoadingGrafico(true);
        setLoadingMeteo(true);
        setLoadingPlagas(true);

        const body = {
          parcela_id: cultivo.id_cultivo,
          id: cultivo.id_cultivo,
          cultivo: "patata",
          lat: cultivo.centro[0],
          lon: cultivo.centro[1],
          inicio: "2025-01-01",
          fin: "2025-01-15",
        };

        const fruta = "manzana";//luego se tiene que añadir la api de detectar las imagenes 360 y sacar la fruta o planta
        const urlPlagas = `${urlBase}apis/alerta-plagas?lat=${body.lat}&lon=${body.lon}&fruta=${fruta}`;

        const [resGrafico, resMeteo, resPlagas] = await Promise.all([
          conectar(`${urlBase}apis/historico`, "POST", body, token),
          conectar(`${urlBase}apis/alerta-meteo`, "POST", body, token),
          conectar(urlPlagas, "GET", {}, token),
        ]);

        if (resGrafico?.ok) setDatosGrafico(resGrafico.data || []);
        if (resMeteo?.ok) setAlertasMeteo(resMeteo.data || []);
        if (resPlagas?.ok) setAlertasPlagas(resPlagas.alertas || []);
      } catch (err) {
        if (err.name !== "AbortError") console.error("Error cargando analíticas:", err);
      } finally {
        setLoadingGrafico(false);
        setLoadingMeteo(false);
        setLoadingPlagas(false);
      }
    };
    
    cargarDatos();
  }, [cultivo, token]);

  const lineaGrafico = useMemo(() => {
    const metricas = {
      temperatura: { key: "temperatura", name: "Temp. (°C)", color: "#f59e0b" },
      humedad_suelo: { key: "humedad_suelo", name: "Hum. Suelo (%)", color: "#3b82f6" },
      precipitacion: { key: "precipitacion", name: "Lluvia (mm)", color: "#10b981" },
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
        <div className="card-base card-grafico">
          <div className="chart-header">
            <h4 className="card-title"><TrendingUp size={16} /> Histórico de Condiciones</h4>
            <div className="chart-controls">
              {["temperatura", "humedad_suelo", "precipitacion"].map((m) => (
                <button
                  key={m}
                  className={`chart-btn ${metricaActiva === m ? `active ${m.split("_")[0]}` : ""}`}
                  onClick={() => setMetricaActiva(m)}
                >
                  {m === "temperatura" ? "Temperatura" : m === "humedad_suelo" ? "Humedad" : "Lluvia"}
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
                      <div className="plaga-name-wrapper">
                        <strong>{p.pest}</strong>
                      </div>
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

        <div className="card-base card-meteo">
          <h4 className="card-title"><AlertTriangle size={16} /> Predicción Climática (7 días)</h4>
          {loadingMeteo ? <Loader /> : alertasMeteo.length ? (
            <div className="meteo-list">
              {alertasMeteo.map((d, i) => (
                <div key={i} className="meteo-item">
                  <strong>
                    {new Date(d.date).toLocaleDateString("es-ES", {
                      weekday: "short",
                      day: "numeric",
                      month: "short",
                    })}
                  </strong>
                  <p>{d.estado}</p>
                  <small>
                    🌡️ {d.t_min}° / {d.t_max}° | 💧 {d.hr_min}% | 💨 {d.viento_max} km/h
                  </small>
                </div>
              ))}
            </div>
          ) : <p className="plagas-empty">Sin alertas meteorológicas.</p>}
        </div>
      </div>
    </div>
  );
}