import { useState, useEffect, useMemo } from "react";
import { Map as MapIcon, Save, Loader } from "lucide-react";
import { userAuth } from "../hooks/userAuth"; 
import MapDraw from "../components/map/Map"; 
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import conectar from "../helpers/fetch";
import Cookies from 'js-cookie'; 
import * as turf from "@turf/turf";

const urlBase = import.meta.env.VITE_BACKEND_URL;

export const Cultivos = () => {
  const auth = userAuth();
  let user = { rol: '', uid: 0 };
  if (auth) {
    if (typeof auth.getUser === 'function') user = auth.getUser() || {};
    else if (auth.user) user = auth.user;
    else if (auth.uid || auth.id) user = auth;
  }

  const token = Cookies.get('miToken') || localStorage.getItem('miToken') || user.token;
  const uid = user.uid || user.id; 
  const rol = user.rol ? user.rol.toLowerCase().trim() : '';
  const puedeCrear = ['administrador', 'productor', 'admin'].includes(rol);

  // --- ESTADOS ---
  const [cultivos, setCultivos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [poligonoGeoJSON, setPoligonoGeoJSON] = useState(null); 
  const [filtroTipo, setFiltroTipo] = useState("Todos");
  
  const [formulario, setFormulario] = useState({
    nombre: "",
    zona_cultivo: "Zona Norte",
    tipo_cultivo: "Fruta",      
    region: "Galicia",         
    pais: "ES",            
    sistema_riego: "Goteo" 
  });

  // --- CARGA DE DATOS ---
  useEffect(() => {
    const cargarDatos = async () => {
      if (!uid || !token) return;
      setLoading(true);
      try {
        let datosFinales = [];
        if (rol === 'productor') {
            const data = await conectar(`${urlBase}/cultivo/productor/${uid}`, 'GET', {}, token);
            if (data?.ok) datosFinales = data.cultivos;
        } else if (rol === 'manager') {
            const dataCultivos = await conectar(`${urlBase}/cultivo`, 'GET', {}, token);
            const todosCultivos = dataCultivos?.cultivos || [];
            const dataUsers = await conectar(`${urlBase}/user/porUserRol`, 'POST', { nombre: 'Productor' }, token);
            const todosProductores = dataUsers?.usuarios || [];
            const misProductoresIds = todosProductores.filter(u => u.id_manager === uid).map(u => u.id_usuario);
            datosFinales = todosCultivos.filter(c => misProductoresIds.includes(c.id_productor));
        } else {
            const data = await conectar(`${urlBase}/cultivo`, 'GET', {}, token);
            if (data?.ok) datosFinales = data.cultivos || [];
        }
        setCultivos(Array.isArray(datosFinales) ? datosFinales : []);
      } catch (error) {
        console.error("Error cargando cultivos:", error);
      } finally {
        setLoading(false);
      }
    };
    cargarDatos();
  }, [rol, uid, token]);

  // --- LÓGICA DEL MAPA (FILTRADO Y GEOJSON) ---
  const zonasParaMapa = useMemo(() => {
    if (!cultivos.length) return [];
    
    // Aplicar filtro de tipo del Código 1
    const filtrados = filtroTipo === "Todos" 
        ? cultivos 
        : cultivos.filter(c => c.tipo_cultivo === filtroTipo);

    return filtrados.map((c) => {
        try {
            let geometry = c.poligono || (c.poligono_geojson ? (typeof c.poligono_geojson === 'string' ? JSON.parse(c.poligono_geojson) : c.poligono_geojson) : null);
            if (!geometry || !geometry.coordinates) return null;
            
            const coordsLeaflet = geometry.coordinates[0].map(point => [point[1], point[0]]); 
            return {
                id: c.id_cultivo,
                nombre: c.nombre,
                tipo: c.tipo_cultivo,
                coords: coordsLeaflet, 
                color: c.tipo_cultivo === 'Fruta' ? '#e74c3c' : '#2ecc71',
                geojsonOriginal: geometry // Guardamos para validación de Turf
            };
        } catch (err) { return null; }
    }).filter(Boolean);
  }, [cultivos, filtroTipo]);

  const handleZoneCreated = (latLngs) => {
    // 1. Convertir a formato GeoJSON para Turf
    const coordsGeoJSON = latLngs.map(p => [p.lng, p.lat]);
    coordsGeoJSON.push(coordsGeoJSON[0]); // Cerrar el polígono
    const nuevoPoligono = turf.polygon([coordsGeoJSON]);

    try {
        // 2. Validar solapamiento con Turf (Lógica Código 1)
        let haySolapamiento = false;
        for (const cultivo of cultivos) {
            let geometry = cultivo.poligono || (cultivo.poligono_geojson ? (typeof cultivo.poligono_geojson === 'string' ? JSON.parse(cultivo.poligono_geojson) : cultivo.poligono_geojson) : null);
            if (!geometry) continue;

            const poligonoExistente = turf.polygon(geometry.coordinates);
            const interseccion = turf.intersect(turf.featureCollection([nuevoPoligono, poligonoExistente]));
            
            if (interseccion) {
                haySolapamiento = true;
                break;
            }
        }

        if (haySolapamiento) {
            setPoligonoGeoJSON(null);
            toast.error("La zona se solapa con una existente.", { toastId: "valida-solapamiento", position: "bottom-center" });
        } else {
            setPoligonoGeoJSON({ type: "Polygon", coordinates: [coordsGeoJSON] });
            toast.success("Zona válida seleccionada.", { toastId: "valida-ok", position: "bottom-center" });
        }
    } catch (err) {
        console.error("Error de geometría:", err);
        toast.error("Error al procesar el área dibujada");
    }
  };

  // --- FORMULARIO Y GUARDADO ---
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'pais') {
        setFormulario({ ...formulario, pais: value.toUpperCase().slice(0, 2) });
    } else {
        setFormulario({ ...formulario, [name]: value });
    }
  };

  const guardarCultivo = async () => {
    if (!poligonoGeoJSON) return toast.warning("Dibuja una zona válida en el mapa primero");
    if (formulario.nombre.length < 3) return toast.error("El nombre debe tener al menos 3 letras");

    const body = { ...formulario, poligono: poligonoGeoJSON };

    try {
        const respuesta = await conectar(`${urlBase}/cultivo/crear`, 'POST', body, token);
        if (respuesta?.ok) {
            toast.success("¡Cultivo guardado con éxito!");
            setCultivos([respuesta.cultivo, ...cultivos]); 
            setPoligonoGeoJSON(null);
            setFormulario({ ...formulario, nombre: "" }); 
        } else {
            toast.error(respuesta?.msg || "Error al guardar");
        }
    } catch (error) {
        toast.error("Error de conexión");
    }
  };

  const inputStyle = { padding: '10px', borderRadius: '5px', border: '1px solid #ccc', width: '100%', marginBottom: '10px' };

  return (
    <div style={{ padding: '20px', display: 'flex', gap: '20px', flexWrap: 'wrap', fontFamily: 'Arial, sans-serif' }}>
      <ToastContainer position="bottom-center" limit={1} />

      {/* SECCIÓN IZQUIERDA: MAPA Y FILTRO */}
      <div style={{ flex: 2, minWidth: '400px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', alignItems: 'center' }}>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: 0 }}>
                <MapIcon color="#2c3e50" /> Mapa de Cultivos
            </h2>
            <select value={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value)} style={{ padding: '8px', borderRadius: '5px' }}>
                <option value="Todos">Todos los tipos</option>
                <option value="Fruta">Frutas</option>
                <option value="Hortaliza">Hortalizas</option>
                <option value="Cereal">Cereal</option>
            </select>
        </div>

        <div style={{ background: 'white', padding: '10px', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
            {loading ? (
                <div style={{ height: '400px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <Loader className="animate-spin" size={40} />
                </div>
            ) : (
                <MapDraw 
                    zonasVisibles={zonasParaMapa} 
                    onZoneCreated={handleZoneCreated} 
                    readOnly={!puedeCrear} 
                />
            )}
        </div>
      </div>

      {/* SECCIÓN DERECHA: FORMULARIO (SOLO SI TIENE PERMISO) */}
      {puedeCrear && (
        <div style={{ flex: 1, minWidth: '300px', background: 'white', padding: '25px', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', height: 'fit-content' }}>
          <h3 style={{ borderBottom: '2px solid #22c55e', paddingBottom: '10px', marginTop: 0 }}>Nuevo Cultivo</h3>
          
          <label style={{ fontSize: '14px', fontWeight: 'bold' }}>Nombre Parcela:</label>
          <input name="nombre" value={formulario.nombre} placeholder="Ej: Finca Olivos" onChange={handleInputChange} style={inputStyle} />
          
          <label style={{ fontSize: '14px', fontWeight: 'bold' }}>Zona:</label>
          <input name="zona_cultivo" value={formulario.zona_cultivo} onChange={handleInputChange} style={inputStyle} />
          
          <label style={{ fontSize: '14px', fontWeight: 'bold' }}>Tipo de Cultivo:</label>
          <select name="tipo_cultivo" value={formulario.tipo_cultivo} onChange={handleInputChange} style={inputStyle}>
            <option value="Fruta">Fruta</option>
            <option value="Hortaliza">Hortaliza</option>
            <option value="Cereal">Cereal</option>
          </select>

          <div style={{ display: 'flex', gap: '10px' }}>
            <div style={{ flex: 2 }}>
                <label style={{ fontSize: '14px', fontWeight: 'bold' }}>Región:</label>
                <input name="region" value={formulario.region} onChange={handleInputChange} style={inputStyle} />
            </div>
            <div style={{ flex: 1 }}>
                <label style={{ fontSize: '14px', fontWeight: 'bold' }}>País:</label>
                <input name="pais" value={formulario.pais} maxLength={2} onChange={handleInputChange} style={inputStyle} />
            </div>
          </div>

          <label style={{ fontSize: '14px', fontWeight: 'bold' }}>Sistema de Riego:</label>
          <select name="sistema_riego" value={formulario.sistema_riego} onChange={handleInputChange} style={inputStyle}>
            <option value="Goteo">Goteo</option>
            <option value="Aspersión">Aspersión</option>
            <option value="Gravedad">Gravedad</option>
            <option value="Manual">Manual</option>
          </select>

          <button 
            onClick={guardarCultivo}
            disabled={!poligonoGeoJSON}
            style={{ 
                width: '100%', 
                padding: '14px', 
                background: poligonoGeoJSON ? '#22c55e' : '#cbd5e1', 
                color: 'white', 
                border: 'none', 
                borderRadius: '6px', 
                cursor: poligonoGeoJSON ? 'pointer' : 'not-allowed', 
                fontWeight: 'bold',
                marginTop: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
            }}
          >
            <Save size={18} /> Guardar Parcela
          </button>
        </div>
      )}
    </div>
  );
};