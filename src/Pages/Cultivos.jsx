import { useState, useEffect, useMemo } from "react";
import { Map as MapIcon, Save, Loader, Users } from "lucide-react";
import { userAuth } from "../hooks/userAuth"; 
import MapDraw from "../components/map/Map"; 
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import conectar from "../helpers/fetch";
import Cookies from 'js-cookie'; 
import * as turf from "@turf/turf";
import "./Cultivos.css";

// 1. COMPONENTE DE DETALLES
import DetalleCultivo from "../components/Cultivos/DetalleCultivo"; 

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
  const uid = Number(user.uid || user.id); 
  const rol = user.rol ? user.rol.toLowerCase().trim() : '';
  
  const esAdmin = rol === 'administrador' || rol === 'admin';
  const esManager = rol === 'manager';
  const puedeCrear = ['productor', 'admin'].includes(rol);

  // --- ESTADOS ---
  const [cultivos, setCultivos] = useState([]);
  const [productores, setProductores] = useState([]); 
  const [loading, setLoading] = useState(false);
  const [poligonoGeoJSON, setPoligonoGeoJSON] = useState(null); 
  
  //  2. GRAFICOS
  const [cultivoSeleccionado, setCultivoSeleccionado] = useState(null); 
  
  const [usuarioAFiltrar, setUsuarioAFiltrar] = useState(uid);

  const [formulario, setFormulario] = useState({
    nombre: "", zona_cultivo: "Zona Norte", tipo_cultivo: "Fruta",      
    region: "Galicia", pais: "ES", sistema_riego: "Goteo" 
  });

  // --- 1. CARGAR PRODUCTORES (PARA MANAGER Y ADMIN) ---
  useEffect(() => {
    const obtenerProductores = async () => {
      if (!['manager', 'administrador', 'asesor'].includes(rol) || !token) return;
      try {
        const res = await conectar(`${urlBase}user/porUserRol`, 'POST', { nombre: 'Productor' }, token);
        if (res?.ok && res.usuarios) {
          if (esAdmin) setProductores(res.usuarios);
          else if (esManager) setProductores(res.usuarios.filter(p => Number(p.id_manager) === uid));
        }
      } catch (error) { console.error("Error al obtener equipo:", error); }
    };
    obtenerProductores();
  }, [rol, uid, token]);

  // --- 2. CARGAR CULTIVOS ---
  useEffect(() => {
    const cargarCultivos = async () => {
      if (!usuarioAFiltrar || !token) return;
      setLoading(true);
      try {
        const data = await conectar(`${urlBase}cultivo/productor/${usuarioAFiltrar}`, 'GET', {}, token);
        if (data?.ok) setCultivos(data.cultivos || []);
        else setCultivos([]);
      } catch (error) { setCultivos([]); } 
      finally { setLoading(false); }
    };
    cargarCultivos();
  }, [usuarioAFiltrar, token]);

  // --- LÓGICA DEL MAPA  ---
  const zonasParaMapa = useMemo(() => {
    if (!cultivos.length) return [];
    return cultivos.map((c) => {
        try {
            let geometry = c.poligono || (c.poligono_geojson ? (typeof c.poligono_geojson === 'string' ? JSON.parse(c.poligono_geojson) : c.poligono_geojson) : null);
            if (!geometry || !geometry.coordinates) return null;
            const coordsLeaflet = geometry.coordinates[0].map(point => [point[1], point[0]]); 
            return {
                id: c.id_cultivo,
                nombre: c.nombre,
                coords: coordsLeaflet, 
                color: c.tipo_cultivo === 'Fruta' ? '#e74c3c' : '#2ecc71',
                geojsonOriginal: geometry
            };
        } catch (err) { return null; }
    }).filter(Boolean);
  }, [cultivos]);

  const handleZoneCreated = (latLngs) => {
    const coordsGeoJSON = latLngs.map(p => [p.lng, p.lat]);
    coordsGeoJSON.push(coordsGeoJSON[0]); 
    const nuevoPoligono = turf.polygon([coordsGeoJSON]);
    try {
        let solapado = false;
        for (const c of cultivos) {
            let geometry = c.poligono || (c.poligono_geojson ? (typeof c.poligono_geojson === 'string' ? JSON.parse(c.poligono_geojson) : c.poligono_geojson) : null);
            if (!geometry) continue;
            const poliExistente = turf.polygon(geometry.coordinates);
            if (turf.intersect(turf.featureCollection([nuevoPoligono, poliExistente]))) {
                solapado = true; break;
            }
        }
        if (solapado) {
            setPoligonoGeoJSON(null);
            toast.error("La zona se solapa con una existente.");
        } else {
            setPoligonoGeoJSON({ type: "Polygon", coordinates: [coordsGeoJSON] });
            toast.success("Zona válida seleccionada.");
        }
    } catch (err) { toast.error("Error al procesar el área dibujada"); }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormulario({ ...formulario, [name]: name === 'pais' ? value.toUpperCase().slice(0, 2) : value });
  };

  const guardarCultivo = async () => {
    if (!poligonoGeoJSON) return toast.warning("Dibuja una zona primero");
    if (formulario.nombre.length < 3) return toast.error("El nombre debe tener al menos 3 letras");

    try {
        const respuesta = await conectar(`${urlBase}cultivo/crear`, 'POST', { ...formulario, poligono: poligonoGeoJSON }, token);
        if (respuesta?.ok) {
            toast.success("¡Cultivo guardado!");
            setCultivos([respuesta.cultivo, ...cultivos]); 
            setPoligonoGeoJSON(null);
            setFormulario({ ...formulario, nombre: "" }); 
        } else toast.error(respuesta?.msg || "Error al guardar");
    } catch (error) { toast.error("Error de conexión"); }
  };

  //  3. CAMBIOS DE GRAFICOS
  const onCultivoClick = (id_cultivo) => {
    const cultivo = cultivos.find(c => c.id_cultivo === id_cultivo);
    setCultivoSeleccionado(cultivo);
  };

  return (
    <div className="cultivos-container">
      <ToastContainer position="bottom-center" limit={1} />

      <div className="cultivos-left-section">
        <div className="cultivos-header">
            <h2 className="cultivos-title">
                <MapIcon color="#2c3e50" /> 
                {esAdmin ? "Panel de Administración" : esManager ? "Gestión de Productores" : "Mis Cultivos"}
            </h2>

            {(esAdmin || esManager) && (
              <div className="cultivos-filter-container">
                <Users size={18} color="#666" />
                <select 
                  className="cultivos-select"
                  value={usuarioAFiltrar} 
                  onChange={(e) => setUsuarioAFiltrar(Number(e.target.value))}
                >
                  <option value={uid}>{esAdmin ? "Mis Cultivos (Admin)" : "Mis Cultivos (Manager)"}</option>
                  {productores.map(p => (
                    <option key={p.id_usuario} value={p.id_usuario}>
                      {p.nombre_completo || p.nombre}
                    </option>
                  ))}
                </select>
              </div>
            )}
        </div>

        <div className="cultivos-map-wrapper">
            {loading ? (
                <div className="cultivos-loader-container">
                    <Loader className="animate-spin" size={40} />
                </div>
            ) : (
                <MapDraw 
                    zonasVisibles={zonasParaMapa} 
                    onZoneCreated={handleZoneCreated} 
                    onZoneClicked={onCultivoClick} // <-- Enviamos el clic al mapa
                    readOnly={!puedeCrear} 
                />
            )}
        </div>
      </div>

      <div className="cultivos-right-section">
        {/*  CAMBIO ENTRE FORMU Y TABLA */}
        {cultivoSeleccionado ? (
            <DetalleCultivo 
               cultivo={cultivoSeleccionado} 
               onCerrar={() => setCultivoSeleccionado(null)} 
               token={token}
            />
        ) : puedeCrear ? (
            <>
              <h3 className="cultivos-form-title">Registrar Parcela</h3>
              
              <label className="cultivos-label">Nombre Parcela:</label>
              <input name="nombre" value={formulario.nombre} placeholder="Ej: Finca Olivos" onChange={handleInputChange} className="cultivos-input" />
              
              <label className="cultivos-label">Zona:</label>
              <input name="zona_cultivo" value={formulario.zona_cultivo} onChange={handleInputChange} className="cultivos-input" />
              
              <label className="cultivos-label">Tipo de Cultivo:</label>
              <select name="tipo_cultivo" value={formulario.tipo_cultivo} onChange={handleInputChange} className="cultivos-input">
                <option value="Fruta">Fruta</option>
                <option value="Hortaliza">Hortaliza</option>
                <option value="Cereal">Cereal</option>
              </select>

              <div className="cultivos-flex-row">
                <div style={{ flex: 2 }}>
                    <label className="cultivos-label">Región:</label>
                    <input name="region" value={formulario.region} onChange={handleInputChange} className="cultivos-input" />
                </div>
                <div style={{ flex: 1 }}>
                    <label className="cultivos-label">País:</label>
                    <input name="pais" value={formulario.pais} maxLength={2} onChange={handleInputChange} className="cultivos-input" />
                </div>
              </div>

              <label className="cultivos-label">Sistema de Riego:</label>
              <select name="sistema_riego" value={formulario.sistema_riego} onChange={handleInputChange} className="cultivos-input">
                <option value="Goteo">Goteo</option>
                <option value="Aspersión">Aspersión</option>
                <option value="Gravedad">Gravedad</option>
                <option value="Manual">Manual</option>
              </select>

              <button 
                className="cultivos-btn-save"
                onClick={guardarCultivo} 
                disabled={!poligonoGeoJSON}
                style={{ 
                    background: poligonoGeoJSON ? '#22c55e' : '#cbd5e1', 
                    cursor: poligonoGeoJSON ? 'pointer' : 'not-allowed' 
                }}
              >
                <Save size={18} /> Guardar Parcela
              </button>
            </>
        ) : null}
      </div>
    </div>
  );
};