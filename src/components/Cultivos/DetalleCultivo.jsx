import { useState, useEffect, useMemo } from "react";
import { X, TrendingUp, Loader, AlertTriangle, Image, View } from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";

// Iconos para el visor 360
import sky from "../../assets/sky.png";
import soil from "../../assets/soil.png";
import crop from "../../assets/crop.png";

import Panorama from "../Panorama"; 
import { apiPointToPosition } from "../../helpers/coords";
import conectar from "../../helpers/fetch";
import "./DetallesCultivo.css";
import { getCache, setCache } from "../../helpers/cache";

const urlBase = import.meta.env.VITE_BACKEND_URL;

export default function DetalleCultivo({ cultivo, onCerrar, token }) {
  const [datosGrafico, setDatosGrafico] = useState([]);
  const [alertasMeteo, setAlertasMeteo] = useState([]);
  const [alertasPlagas, setAlertasPlagas] = useState([]);
  const [multimedia, setMultimedia] = useState([]);
  const [infoSuelo, setInfoSuelo] = useState({});

  const [loadingMultimedia, setLoadingMultimedia] = useState(true);
  const [loadingGrafico, setLoadingGrafico] = useState(true);
  const [loadingMeteo, setLoadingMeteo] = useState(true);
  const [loadingPlagas, setLoadingPlagas] = useState(true);

  const [metricaActiva, setMetricaActiva] = useState("temperatura");
  const [mostrar360, setMostrar360] = useState(false);
  const [plantaDetectada, setPlantaDetectada] = useState(null);
  const [identificando, setIdentificando] = useState(false);


  console.log (metricaActiva,"metricas Activas")
  console.log (datosGrafico,"datos Grafico")
  console.log(alertasMeteo,"alertas Meteo")

  useEffect(() => {
    // Cada vez que cambia el ID del cultivo, reseteamos la identificación
    setPlantaDetectada(null);
    setIdentificando(false);
  }, [cultivo?.id_cultivo]);

  // --- CARGA DE DATOS INICIAL ---
  useEffect(() => {
    if (!cultivo?.id_cultivo) return;
    const cacheKey = `detalle-${cultivo.id_cultivo}`;
    const cached = getCache(cacheKey);

    if (cached) {
      setLoadingPlagas(false);
      setDatosGrafico(cached.datosGrafico);
      setAlertasMeteo(cached.alertasMeteo);
      setAlertasPlagas(cached.alertasPlagas);
      setMultimedia(cached.multimedia || []);
      setInfoSuelo(cached.infoSuelo || {});
      setLoadingGrafico(false);
      setLoadingMeteo(false);
      setLoadingMultimedia(false);
      return;
    }

    const cargarDatos = async () => {
      try {
        setLoadingPlagas(true);
        setLoadingGrafico(true);
        setLoadingMeteo(true);

        setLoadingMultimedia(true); 
        const body = {
          parcela_id: cultivo.id_cultivo,
          id: cultivo.id_cultivo,
          lat: cultivo.centro[0],
          lon: cultivo.centro[1],
          inicio: "2025-01-01",
          fin: "2025-01-30",
          fruta: "manzana",
          cultivo: cultivo.nombre
        };
      
        const urlPlagas = `https://aanearana-deteccion-plagas.hf.space/plagas?lat=${body.lat}&lon=${body.lon}&fruta=${body.fruta}`;
        const urlMultimedia = `${urlBase}multimedia/cultivo/${cultivo.id_cultivo}`;

        const [resGrafico, resMeteo, resPlagas, resMultimedia, aux] = await Promise.all([
          conectar(`${urlBase}apis/historico`, "POST", body, token),
          conectar(`${urlBase}apis/alerta-meteo`, "POST", body, token),
          conectar(urlPlagas, "GET", {}, token),
          conectar(urlMultimedia, "GET", {}, token),
          conectar(`${urlBase}apis/info-suelo`, "POST", body, token)
        ]);
        if (resPlagas?.ok) setAlertasPlagas(resPlagas.alertas || []);
        if(aux?.ok) setInfoSuelo(aux.data);
        if (resGrafico?.ok) setDatosGrafico(resGrafico.data || []);
        if (resMeteo?.ok) setAlertasMeteo(resMeteo.data || []);
        
        if (resMultimedia?.ok) setMultimedia(resMultimedia.archivos || []);

        setCache(cacheKey, {
          alertasPlagas: resPlagas?.alertas || [], 
          datosGrafico: resGrafico?.data || [],
          alertasMeteo: resMeteo?.data || [],
          multimedia: resMultimedia?.archivos || [],
          infoSuelo: aux?.data || {}
        });

      } catch (err) {
        console.error("Error cargando analíticas:", err);
      } finally {
        setLoadingPlagas(false);
        setLoadingGrafico(false);
        setLoadingMeteo(false);
        setLoadingMultimedia(false);
      }
    };
    
    cargarDatos();
  }, [cultivo, token]);
  
  // --- URL DE LA IMAGEN PANORÁMICA ---
  const cloudinaryUrl = useMemo(() => {
    if (cultivo.url_archivo) return cultivo.url_archivo;
    if (cultivo.url) return cultivo.url;
    const imgEnGaleria = multimedia.find(item => 
      item.tipo?.toLowerCase().includes("image") || 
      item.tipo_archivo?.toLowerCase().includes("image")
    );
    return imgEnGaleria ? (imgEnGaleria.url_archivo || imgEnGaleria.url) : null;
  }, [cultivo, multimedia]);


  // --- AUTO-IDENTIFICACIÓN AL ABRIR EL 360 ---
  useEffect(() => {
    if (mostrar360 && cloudinaryUrl && !plantaDetectada && !identificando) {
      identificarAutomaticamente();
    }
  }, [mostrar360, cloudinaryUrl]);

  const identificarAutomaticamente = async () => {
    setIdentificando(true);
    try {
      // 1. Convertimos la URL de Cloudinary en un archivo (Blob)
      const responseImg = await fetch(cloudinaryUrl, { mode: 'cors' });
      const blob = await responseImg.blob();
      const file = new File([blob], "panorama_auto.jpg", { type: blob.type });

      // 2. Preparamos el FormData
      const formData = new FormData();
      formData.append("image", file);

      // 3. Enviamos a tu Backend (Proxy)
      const response = await fetch(`${urlBase}apis/identificar-planta`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` },
        body: formData,
      });

      const data = await response.json();
      
      if (data.ok) {
        // Ajusta aquí si tu backend devuelve { data: {...} } o directamente {...}
        setPlantaDetectada(data.resultado || data.data || data); 
      }
    } catch (error) {
      console.error("Error al identificar planta automáticamente:", error);
    } finally {
      setIdentificando(false);
    }
  };

  

  // --- MARCADORES DINÁMICOS PARA 360 ---
  const marcadores360 = useMemo(() => {
    const dimensionesIA = { width: 5888, height: 2944 };
    //esto tiene que conectar con el tio 
    const puntosIA = {
      cielo: { x: 2780, y: 400 },
      cultivo: { x: 5504, y: 1702 },
      suelo: { x: 1979, y: 2027 }
    };
    

    console.log("esto es identificando", identificando)
    console.log('estos son los puntos ia',puntosIA)
    

    return [
      // 🌤️ METEO
      {
        label: "Predicción Climática (7 días)",
        position: apiPointToPosition(puntosIA.cielo, dimensionesIA),
        icon: sky,
        type: "meteo_list",
        data: alertasMeteo
      },

      // 🌱 IA / CULTIVO (Automático)
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

      // 🌍 SUELO
      {
        label: "Info Suelo (NDVI)",
        position: apiPointToPosition(puntosIA.suelo, dimensionesIA),
        icon: soil,
        type: "chart",
        data: infoSuelo?.productividad_ndvi
          ? Object.entries(infoSuelo.productividad_ndvi).map(([año, val]) => ({
              time: año,
              value: val
            }))
          : [],
        extraInfo: {
          pH: infoSuelo?.suelo?.ph_superficie || "N/D",
          "M. Orgánica": `${infoSuelo?.suelo?.materia_organica_gkg || 0} g/kg`
        }
      }
    ];
  }, [alertasMeteo, infoSuelo, plantaDetectada, identificando]);


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
  

  return (
    <div className="cultivos-detalle-panel">
      <div className="cultivos-flex-row">
        <div>
          <h3 className="cultivos-form-title">{cultivo.nombre}</h3>
          <button onClick={() => setMostrar360(true)} className="btn-abrir-360" style={{marginTop: '10px'}}>
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
              {["temperatura", "humedad_suelo", "evapotranspiracion", "precipitacion"].map((m) => (
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
            {loadingGrafico ? <Loader className="animate-spin" /> : (
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

        {/* Galería */}
        <div className="card-base card-multimedia" style={{ gridColumn: '1 / -1' }}>
          <h4 className="card-title"><Image size={16} /> Galería Multimedia</h4>
          <div className="multimedia-grid">
            {multimedia.map((item) => (
              <div key={item.id_multimedia} className="multimedia-item">
                <img src={item.url_archivo || item.url} className="multimedia-content" alt="Vista" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* VISOR 360 MODAL */}
      {mostrar360 && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 9999, background: '#000' }}>
          <div style={{ position: 'absolute', top: 20, left: 20, zIndex: 10, display: 'flex', gap: '15px' }}>
            <button 
              onClick={() => setMostrar360(false)} 
              style={{ padding: '12px 20px', background: 'white', borderRadius: '8px', cursor: 'pointer', border: 'none', fontWeight: 'bold' }}
            >
              Cerrar Vista 360
            </button>
            
            {/* Indicador de estado de la IA */}
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