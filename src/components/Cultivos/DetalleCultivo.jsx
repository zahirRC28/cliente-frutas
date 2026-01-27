import { useState, useEffect, useMemo, useCallback } from "react";
import { X, TrendingUp, Loader, AlertTriangle, Image, View } from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";

import sky from "../../assets/sky.png";
import soil from "../../assets/soil.png";
import crop from "../../assets/crop.png";

import Panorama from "../Panorama"; 
import { apiPointToPosition } from "../../helpers/coords";
import conectar from "../../helpers/fetch";
import { getCache, setCache } from "../../helpers/cache";
import "./DetallesCultivo.css";

const urlBase = import.meta.env.VITE_BACKEND_URL;

export default function DetalleCultivo({ cultivo, onCerrar, token }) {
  // --- Estados ---
  const [datosGrafico, setDatosGrafico] = useState([]);
  const [alertasMeteo, setAlertasMeteo] = useState([]);
  const [alertasPlagas, setAlertasPlagas] = useState([]);
  const [multimedia, setMultimedia] = useState([]);
  const [infoSuelo, setInfoSuelo] = useState({});

  const [loading, setLoading] = useState({
    grafico: true,
    meteo: true,
    plagas: true,
    multimedia: true,
  });

  const [metricaActiva, setMetricaActiva] = useState("temperatura");
  const [mostrar360, setMostrar360] = useState(false);
  const [plantaDetectada, setPlantaDetectada] = useState(null);
  const [identificando, setIdentificando] = useState(false);

  // --- Reset al cambiar de cultivo ---
  useEffect(() => {
    setPlantaDetectada(null);
    setIdentificando(false);
  }, [cultivo?.id_cultivo]);

  // --- Cargar datos del cultivo ---
  const cargarDatos = useCallback(async () => {
    if (!cultivo?.id_cultivo) return;

    const cacheKey = `detalle-${cultivo.id_cultivo}`;
    const cached = getCache(cacheKey);

    if (cached) {
      setDatosGrafico(cached.datosGrafico || []);
      setAlertasMeteo(cached.alertasMeteo || []);
      setAlertasPlagas(cached.alertasPlagas || []);
      setMultimedia(cached.multimedia || []);
      setInfoSuelo(cached.infoSuelo || {});
      setLoading({ grafico: false, meteo: false, plagas: false, multimedia: false });
      return;
    }

    setLoading({ grafico: true, meteo: true, plagas: true, multimedia: true });

    try {
      const body = {
        parcela_id: cultivo.id_cultivo,
        id: cultivo.id_cultivo,
        lat: cultivo.centro[0],
        lon: cultivo.centro[1],
        inicio: "2025-01-01",
        fin: "2025-01-02",
        fruta: "manzana",
        cultivo: cultivo.nombre
      };

      const urlPlagas = `https://aanearana-deteccion-plagas.hf.space/plagas?lat=${body.lat}&lon=${body.lon}&fruta=${body.fruta}`;
      const urlMultimedia = `${urlBase}multimedia/cultivo/${cultivo.id_cultivo}`;

      const [resGrafico, resMeteo, resPlagas, resMultimedia, resSuelo] = await Promise.all([
        conectar(`${urlBase}apis/historico`, "POST", body, token),
        conectar(`${urlBase}apis/alerta-meteo`, "POST", body, token),
        conectar(urlPlagas, "GET", {}, token),
        conectar(urlMultimedia, "GET", {}, token),
        conectar(`${urlBase}apis/info-suelo`, "POST", body, token)
      ]);

      setAlertasPlagas(resPlagas?.alertas || []);
      setDatosGrafico(resGrafico?.data || []);
      setAlertasMeteo(resMeteo?.data || []);
      setMultimedia(resMultimedia?.archivos || []);
      setInfoSuelo(resSuelo?.data || {});

      setCache(cacheKey, {
        alertasPlagas: resPlagas?.alertas || [],
        datosGrafico: resGrafico?.data || [],
        alertasMeteo: resMeteo?.data || [],
        multimedia: resMultimedia?.archivos || [],
        infoSuelo: resSuelo?.data || {}
      });

    } catch (err) {
      console.error("Error cargando analíticas:", err);
    } finally {
      setLoading({ grafico: false, meteo: false, plagas: false, multimedia: false });
    }
  }, [cultivo, token]);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  // --- URL de la imagen 360 ---
  const cloudinaryUrl = useMemo(() => {
    if (cultivo.url_archivo) return cultivo.url_archivo;
    if (cultivo.url) return cultivo.url;
    const imgEnGaleria = multimedia.find(item =>
      item.tipo?.toLowerCase().includes("image") ||
      item.tipo_archivo?.toLowerCase().includes("image")
    );
    return imgEnGaleria ? (imgEnGaleria.url_archivo || imgEnGaleria.url) : null;
  }, [cultivo, multimedia]);

  // --- Identificación automática ---
  useEffect(() => {
    if (mostrar360 && cloudinaryUrl && !plantaDetectada && !identificando) {
      identificarAutomaticamente();
    }
  }, [mostrar360, cloudinaryUrl]);

  const identificarAutomaticamente = async () => {
    setIdentificando(true);
    try {
      const responseImg = await fetch(cloudinaryUrl, { mode: 'cors' });
      const blob = await responseImg.blob();
      const file = new File([blob], "panorama_auto.jpg", { type: blob.type });

      const formData = new FormData();
      formData.append("image", file);

      const response = await fetch(`${urlBase}apis/identificar-planta`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` },
        body: formData,
      });

      const data = await response.json();
      if (data.ok) setPlantaDetectada(data.resultado || data.data || data);

    } catch (error) {
      console.error("Error al identificar planta automáticamente:", error);
    } finally {
      setIdentificando(false);
    }
  };

  // --- Marcadores 360 ---
  const marcadores360 = useMemo(() => {
    const dimensionesIA = { width: 5888, height: 2944 };
    const puntosIA = {
      cielo: { x: 1822, y: 491 },
      cultivo: { x: 2149, y: 1292 },
      suelo: { x: 3078, y: 1900 }
    };

    return [
      {
        label: "Predicción Climática (7 días)",
        position: apiPointToPosition(puntosIA.cielo, dimensionesIA),
        icon: sky,
        type: "meteo_list",
        data: alertasMeteo
      },
      {
        label: identificando
          ? "⏳ Analizando cultivo ..."
          : plantaDetectada
            ? `✅ Tipo de cultivo: ${plantaDetectada.nombre_comun || "Identificado"}` + (plantaDetectada.precision ? ` (precision: ${plantaDetectada.precision})` : "")
            : "⚠️ No se pudo identificar",
        position: apiPointToPosition(puntosIA.cultivo, dimensionesIA),
        icon: crop,
        confidence: plantaDetectada?.precision,
        extraInfo: plantaDetectada ? {
          "Científico": plantaDetectada.nombre_cientifico,
          "Otros": plantaDetectada.otros_nombres?.slice(0, 20) + "..."
        } : null
      },
      {
        label: "Info Suelo (NDVI)",
        position: apiPointToPosition(puntosIA.suelo, dimensionesIA),
        icon: soil,
        type: "chart",
        data: infoSuelo?.productividad_ndvi
          ? Object.entries(infoSuelo.productividad_ndvi).map(([año, val]) => ({ time: año, value: val }))
          : [],
        extraInfo: {
          pH: infoSuelo?.suelo?.ph_superficie || "N/D",
          "M. Orgánica": `${infoSuelo?.suelo?.materia_organica_gkg || 0} g/kg`
        }
      }
    ];
  }, [alertasMeteo, infoSuelo, plantaDetectada, identificando]);

  // --- Línea de gráfico ---
  const lineaGrafico = useMemo(() => {
    const metricas = {
      temperatura: { key: "temperatura", name: "Temp. (°C)", color: "#f59e0b" },
      humedad_suelo: { key: "humedad_suelo", name: "Hum. Suelo (%)", color: "#3b82f6" },
      evapotranspiracion: { key: "evapotranspiracion", name: "Evapotranspiración (mm)", color: "#10b981" },
      precipitacion: { key: "precipitacion", name: "Precipitación (mm)", color: "#8b5cf6" },
    };
    const { key, name, color } = metricas[metricaActiva] || metricas.temperatura;
    return <Line type="monotone" dataKey={key} name={name} stroke={color} strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />;
  }, [metricaActiva]);

  // --- JSX ---
  return (
    <div className="cultivos-detalle-panel">
      <div className="cultivos-flex-row">
        <div>
          <h3 className="cultivos-form-title">{cultivo.nombre}</h3>
          <button onClick={() => setMostrar360(true)} className="btn-abrir-360" style={{ marginTop: '10px' }}>
            <View size={18} /> Explorar Parcela 360°
          </button>
        </div>
        <button onClick={onCerrar} className="btn-close"><X size={20} /></button>
      </div>

      <hr className="cultivos-divider" />

      <div className="dashboard-grid">
        {/* Histórico */}
        <div className="card-base card-grafico">
          <div className="chart-header">
            <h4 className="card-title"><TrendingUp size={16} /> Histórico</h4>
            <div className="chart-controls">
              {["temperatura", "humedad_suelo", "evapotranspiracion", "precipitacion"].map(m => (
                <button
                  key={m}
                  className={`chart-btn ${metricaActiva === m ? `active ${m}` : ""}`}
                  onClick={() => setMetricaActiva(m)}
                >
                  {m.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>
          <div className="chart-container">
            {loading.grafico ? <Loader className="animate-spin" /> : (
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

        {/* Plagas */}
        <div className="card-base card-plagas">
          <h4 className="card-title danger"><AlertTriangle size={16} /> Alertas Plagas</h4>
          {loading.plagas ? <Loader /> : alertasPlagas.length ? (
            <div className="plagas-list">
              {alertasPlagas.map((p, i) => {
                const nivel = (p.risk_level || "").toLowerCase();
                const color = nivel === "alto" ? "#B91C1C" : nivel === "medio" ? "#F59E0B" : "#1E7D4D";
                return (
                  <div key={i} className="plaga-item" style={{ borderLeft: `5px solid ${color}` }}>
                    <div className="plaga-header">
                      <strong>{p.pest}</strong>
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

        {/* Galería */}
        <div className="card-base card-multimedia" style={{ gridColumn: '1 / -1' }}>
          <h4 className="card-title"><Image size={16} /> Galería Multimedia</h4>
          <div className="multimedia-grid">
            {multimedia.map(item => (
              <div key={item.id_multimedia} className="multimedia-item">
                <img src={item.url_archivo || item.url} className="multimedia-content" alt="Vista" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Visor 360 */}
      {mostrar360 && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 9999, background: '#000' }}>
          <div style={{ position: 'absolute', top: 20, left: 20, zIndex: 10, display: 'flex', gap: '15px' }}>
            <button 
              onClick={() => setMostrar360(false)} 
              style={{ padding: '12px 20px', background: 'white', borderRadius: '8px', cursor: 'pointer', border: 'none', fontWeight: 'bold' }}
            >
              Cerrar Vista 360
            </button>

            {identificando && (
              <div style={{ padding: '12px 20px', background: 'rgba(0,0,0,0.6)', color: 'white', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Loader className="animate-spin" size={16}/> Analizando parcela...
              </div>
            )}
          </div>

          {cloudinaryUrl ? (
            <Panorama imageUrl={cloudinaryUrl} markers={marcadores360} />
          ) : (
            <div style={{ color: 'white', textAlign: 'center', paddingTop: '20%' }}>
              <AlertTriangle size={48} style={{ margin: '0 auto 20px' }} color="#f59e0b" />
              <h3>Imagen 360 no disponible</h3>
            </div>
          )}
        </div>
      )}
    </div>
  );
}