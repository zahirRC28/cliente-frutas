import { useState, useEffect, useMemo, useCallback } from "react";
import { X, TrendingUp, Loader, AlertTriangle, Image, View, Calendar, History } from "lucide-react";
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
import { usepdfs } from "../../hooks/usepdfs";

const urlBase = import.meta.env.VITE_BACKEND_URL;

// --- Configuración de las 7 Variables ---
const configMetricas = {
  temperatura: { 
    label: "Temperatura", color: "#f59e0b", unit: "°C", key15: "temperatura", keyHist: "temp" 
  },
  humedad_suelo: { 
    label: "Hum. Suelo", color: "#3b82f6", unit: "%", key15: "humedad_suelo", keyHist: "hum_suelo" 
  },
  evapotranspiracion: { 
    label: "Evapotranspiración", color: "#10b981", unit: "mm", key15: "evapotranspiracion", keyHist: "evapo" 
  },
  precipitacion: { 
    label: "Precipitación", color: "#8b5cf6", unit: "mm", key15: "precipitacion", keyHist: "precip" 
  },
  humedad_relativa: { 
    label: "Hum. Relativa", color: "#0ea5e9", unit: "%", key15: "humedad_relativa", keyHist: "hum_rel" 
  },
  viento_vel: { 
    label: "Vel. Viento", color: "#64748b", unit: "km/h", key15: "velocidad_viento", keyHist: "viento_vel" 
  },
  viento_dir: { 
    label: "Dir. Viento", color: "#94a3b8", unit: "°", key15: "direccion_viento", keyHist: "viento_dir" 
  }
};

export default function DetalleCultivo({ cultivo, onCerrar, token }) {
  // --- Estados ---
  const [datosGrafico, setDatosGrafico] = useState([]);
  const [alertasMeteo, setAlertasMeteo] = useState([]);
  const [alertasPlagas, setAlertasPlagas] = useState([]);
  const [multimedia, setMultimedia] = useState([]);
  const [infoSuelo, setInfoSuelo] = useState({});

  const [historico, setHistorico] = useState([]);

  // Estado para alternar entre 15 Días y Histórico
  const [modoHistorico, setModoHistorico] = useState(false);
  const { generarPdfCultivo } = usepdfs();

  const [loading, setLoading] = useState({
    grafico: true,
    meteo: true,
    plagas: true,
    multimedia: true,
    historico: true
  });

  const [metricaActiva, setMetricaActiva] = useState("temperatura");
  const [mostrar360, setMostrar360] = useState(false);
  const [plantaDetectada, setPlantaDetectada] = useState(null);
  const [identificando, setIdentificando] = useState(false);

  // --- Reset al cambiar de cultivo ---
  useEffect(() => {
    setPlantaDetectada(null);
    setIdentificando(false);
    setModoHistorico(false);
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
    setHistorico(cached.historico || []);
    setLoading({ grafico: false, meteo: false, plagas: false, multimedia: false, historico: false });
    return;
  }

  setLoading({ grafico: true, meteo: true, plagas: true, multimedia: true, historico: true });
  try {
    const body = {
      parcela_id: cultivo.id_cultivo,
      id: cultivo.id_cultivo,
      lat: cultivo.centro[0],
      lon: cultivo.centro[1],
      inicio: "2025-01-01",
      fin: "2025-01-15",
      fruta: "manzana",
      days:'15',
      cultivo: cultivo.nombre
    };
    const urlAnalisisClimatico = `${urlBase}apis/analisis-climatico?lat=${body.lat}&lon=${body.lon}&days=${body.days}`;
    const historicoUrl = `${urlBase}apis/historico?lat=${body.lat}&lon=${body.lon}`;
    const urlPlagas = `https://aanearana-deteccion-plagas.hf.space/plagas?lat=${body.lat}&lon=${body.lon}&fruta=${body.fruta}`;
    const urlMultimedia = `${urlBase}multimedia/cultivo/${cultivo.id_cultivo}`;

    const [resGrafico, resMeteo, resPlagas, resMultimedia, resSuelo, resHistorico] = await Promise.all([
      conectar(urlAnalisisClimatico, "GET", null, token),
      conectar(`${urlBase}apis/alerta-meteo`, "POST", body, token),
      conectar(urlPlagas, "GET", null, token),
      conectar(urlMultimedia, "GET", null, token),
      conectar(`${urlBase}apis/info-suelo`, "POST", body, token),
      conectar(historicoUrl, "GET", null, token)
    ]);

    // TRANSFORMAR LOS DATOS DE 15 DÍAS para que coincidan con tu configuración
    const datosTransformados = (resGrafico?.data || []).map(item => ({
      fecha: item.date, // Mantener fecha
      // Temperatura (temp_mean → temperatura)
      temperatura: item.temp_mean,
      
      // Humedad del suelo - la API no proporciona esto, podrías usar humidity_mean como aproximación
      // o dejarlo como 0 si no está disponible
      humedad_suelo: item.humidity_mean || 0,
      
      // Evapotranspiración (evapotranspiration → evapotranspiracion)
      evapotranspiracion: item.evapotranspiration,
      
      // Precipitación - la API da precip_prob (probabilidad), no mm
      // Si necesitas mm, podrías calcularlo o usar otro valor
      precipitacion: item.precip_prob || 0, // Esto es probabilidad, no mm
      
      // Humedad relativa (humidity_mean → humedad_relativa)
      humedad_relativa: item.humidity_mean,
      
      // Velocidad del viento (wind_speed → velocidad_viento)
      velocidad_viento: item.wind_speed,
      
      // Dirección del viento (wind_direction → direccion_viento)
      direccion_viento: item.wind_direction,
      
      // Datos originales por si los necesitas
      date: item.date,
      temp_mean: item.temp_mean,
      humidity_mean: item.humidity_mean,
      evapotranspiration: item.evapotranspiration,
      precip_prob: item.precip_prob,
      wind_speed: item.wind_speed,
      wind_direction: item.wind_direction
    }));

    setDatosGrafico(datosTransformados);
    setAlertasMeteo(resMeteo?.data || []);
    setAlertasPlagas(resPlagas?.alertas || []);
    setMultimedia(resMultimedia?.archivos || []);
    setInfoSuelo(resSuelo?.data || {});
    setHistorico(resHistorico?.data || resHistorico || []);

    console.log("Datos transformados:", datosTransformados);

    setCache(cacheKey, {
      alertasPlagas: resPlagas?.alertas || [],
      datosGrafico: datosTransformados, // Guardar datos transformados
      alertasMeteo: resMeteo?.data || [],
      multimedia: resMultimedia?.archivos || [],
      infoSuelo: resSuelo?.data || {},
      historico: resHistorico?.data || resHistorico || []
    });

  } catch (err) {
    console.error("Error cargando analíticas:", err);
  } finally {
    setLoading({ grafico: false, meteo: false, plagas: false, multimedia: false, historico: false });
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

  // --- CORRECCIÓN CLAVE: Preparación segura de datos para el gráfico ---
  const datosParaMostrar = useMemo(() => {
    if (modoHistorico) {
      // Intentamos extraer el array si viene dentro de un objeto
      if (Array.isArray(historico)) return historico;
      if (historico && Array.isArray(historico.data)) return historico.data;
      return []; // Fallback seguro para evitar error .slice
    } else {
      if (Array.isArray(datosGrafico)) return datosGrafico;
      if (datosGrafico && Array.isArray(datosGrafico.data)) return datosGrafico.data;
      return [];
    }
  }, [modoHistorico, historico, datosGrafico]);

  // --- Línea de gráfico ---
  const lineaGrafico = useMemo(() => {
    const config = configMetricas[metricaActiva] || configMetricas.temperatura;
    const dataKey = modoHistorico ? config.keyHist : config.key15;

    return (
      <Line 
        type="monotone" 
        dataKey={dataKey} 
        name={`${config.label} (${config.unit})`}
        stroke={config.color} 
        strokeWidth={3} 
        dot={modoHistorico ? { r: 1 } : { r: 4 }} 
        activeDot={{ r: 6 }} 
      />
    );
  }, [metricaActiva, modoHistorico]);

  // --- JSX ---
  return (
    <div className="cultivos-detalle-panel">
      <div className="cultivos-flex-row">
        <div>
          <h3 className="cultivos-form-title">{cultivo.nombre}</h3>
          <button onClick={() => setMostrar360(true)} className="btn-abrir-360" style={{ marginTop: '10px' }}>
            <View size={18} /> Explorar Parcela 360°
          </button>
          <button className="btn-abrir-360" onClick={()=>generarPdfCultivo(cultivo.id_cultivo)} style={{ marginTop: '10px' }}>
            Descarga pdf
          </button>
        </div>
        <button onClick={onCerrar} className="btn-close"><X size={20} /></button>
      </div>

      <hr className="cultivos-divider" />

      <div className="dashboard-grid">
        {/* Gráfico */}
        <div className="card-base card-grafico">
          <div className="chart-header" style={{flexDirection: 'column', alignItems: 'flex-start', gap: '10px'}}>
            
            <div style={{display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center'}}>
                <h4 className="card-title" style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                    {modoHistorico ? <History size={18} /> : <TrendingUp size={18} />}
                    {modoHistorico ? "HISTÓRICO 5 AÑOS" : "ÚLTIMOS 15 DÍAS"}
                </h4>
                
                <button 
                    onClick={() => setModoHistorico(!modoHistorico)}
                    className="btn-toggle-mode"
                    style={{
                        padding: '6px 12px', 
                        borderRadius: '6px', 
                        border: '1px solid #ddd', 
                        background: '#f8f9fa', 
                        cursor: 'pointer',
                        fontSize: '0.85rem',
                        fontWeight: '500',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                    }}
                >
                   {modoHistorico ? <Calendar size={14}/> : <History size={14}/>}
                   {modoHistorico ? "Ver 15 Días" : "Ver Histórico"}
                </button>
            </div>

            <div className="chart-controls" style={{flexWrap: 'wrap', gap: '6px'}}>
              {Object.keys(configMetricas).map(key => (
                <button
                  key={key}
                  className={`chart-btn ${metricaActiva === key ? "active" : ""}`}
                  style={{
                    borderColor: metricaActiva === key ? configMetricas[key].color : '#e5e7eb',
                    backgroundColor: metricaActiva === key ? configMetricas[key].color : 'transparent',
                    color: metricaActiva === key ? '#fff' : '#374151'
                  }}
                  onClick={() => setMetricaActiva(key)}
                >
                  {configMetricas[key].label}
                </button>
              ))}
            </div>
          </div>

          <div className="chart-container">
            {loading.grafico ? <Loader className="animate-spin" /> : (
              <ResponsiveContainer width="100%" height="100%">
                {/* AQUI SE USA LA VARIABLE SEGURA 'datosParaMostrar' */}
                <LineChart data={datosParaMostrar}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis 
                    dataKey={modoHistorico ? "date" : "fecha"} 
                    tickFormatter={(val) => {
                        // Formato simple para fechas largas si es necesario
                        if (modoHistorico && typeof val === 'string' && val.length > 7) return val.substring(0, 7);
                        return val;
                    }}
                  />
                  <YAxis domain={["auto", "auto"]} />
                  <Tooltip 
                    contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)" }}
                  />
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
  <div className="visor-360-overlay">
    <div className="visor-360-controls">
      <button 
        onClick={() => setMostrar360(false)} 
        className="btn-cerrar-360"
      >
        Cerrar Vista 360
      </button>

      {identificando && (
        <div className="analisis-badge">
          <Loader className="animate-spin" size={16}/> Analizando parcela...
        </div>
      )}
    </div>

    {cloudinaryUrl ? (
      <Panorama imageUrl={cloudinaryUrl} markers={marcadores360} />
    ) : (
      <div className="loading-container">
        <Loader className="animate-spin" size={40} />
        <p>Cargando entorno virtual...</p>
      </div>
    )}
  </div>
)}
    </div>
  );
}