// src/pages/Cultivos.jsx
import { useState, useEffect, useMemo, useRef } from "react";
import { Map as MapIcon, Loader, Users } from "lucide-react";
import { userAuth } from "../hooks/userAuth";
import MapDraw from "../components/map/Map";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import conectar from "../helpers/fetch";
import Cookies from 'js-cookie';
import * as turf from "@turf/turf";
import { DetectorPlantas } from "../components/Cultivos/DetectorPlantas";
import { DetectorPlagas } from "../components/Cultivos/DetectorPlagas";
// COMPONENTES HIJOS
import DetalleCultivo from "../components/Cultivos/DetalleCultivo";
import FormularioCultivo from "../components/Cultivos/FormularioCultivo"; // NUEVO COMPONENTE
import "../styles/Cultivos.css";
import "../styles/detectorPlagas.css";

const urlBase = import.meta.env.VITE_BACKEND_URL;

export const Cultivos = () => {
  const deleteLock = useRef(false);

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
  const esAsesor = rol === 'asesor';

  const puedeCrear = ['productor', 'admin'].includes(rol);
  const puedeVerTodos = esAdmin || esAsesor || esManager;

  // --- ESTADOS ---
  const [cultivos, setCultivos] = useState([]);
  const [productores, setProductores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [poligonoActual, setPoligonoActual] = useState([]);
  const [cultivoSeleccionado, setCultivoSeleccionado] = useState(null);
  const [usuarioAFiltrar, setUsuarioAFiltrar] = useState(uid);

  // --- CARGA DE DATOS ---
  useEffect(() => {
    const obtenerProductores = async () => {
      if (!['manager', 'administrador', 'asesor'].includes(rol) || !token) return;
      try {
        const res = await conectar(`${urlBase}user/porUserRol`, 'POST', { nombre: 'Productor' }, token);
        if (res?.ok && res.usuarios) {
          if (esAdmin || esAsesor) setProductores(res.usuarios);
          else if (esManager) setProductores(res.usuarios.filter(p => Number(p.id_manager) === uid));
        }
      } catch (error) { console.error("Error al obtener equipo:", error); }
    };
    obtenerProductores();
  }, [rol, uid, token]);

  useEffect(() => {
    const cargarCultivos = async () => {
      if (!usuarioAFiltrar || !token) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const data = await conectar(`${urlBase}cultivo/productor/${usuarioAFiltrar}`, 'GET', {}, token);
        setCultivos(data?.ok ? data.cultivos || [] : []);
      } catch {
        setCultivos([]);
      } finally {
        setLoading(false);
      }
    };
    cargarCultivos();
  }, [usuarioAFiltrar, token]);

  // --- MAPEO DE ZONAS ---
  const zonasParaMapa = useMemo(() => {
    if (!cultivos.length) return [];
    return cultivos.map((c) => {
      try {
        let geometry = c.poligono || (c.poligono_geojson ? (typeof c.poligono_geojson === 'string' ? JSON.parse(c.poligono_geojson) : c.poligono_geojson) : null);
        if (!geometry || !geometry.coordinates) return null;

        const coordsLeaflet = geometry.coordinates[0].map(point => [point[1], point[0]]);
        const poli = turf.polygon(geometry.coordinates);
        const centroide = turf.centroid(poli);
        const [lon, lat] = centroide.geometry.coordinates;

        return {
          id: c.id_cultivo,
          nombre: c.nombre,
          coords: coordsLeaflet,
          centro: [lat, lon],
          color: c.tipo_cultivo === 'Fruta' ? '#e74c3c' : '#2ecc71',
          ...c
        };
      } catch (err) { return null; }
    }).filter(Boolean);
  }, [cultivos]);


  // 1. Crear Zona
  const handleZoneCreated = (latLngs) => {
    const coordsGeoJSON = latLngs.map(p => [p.lng, p.lat]);
    coordsGeoJSON.push(coordsGeoJSON[0]);
    const nuevoPoligonoTurf = turf.polygon([coordsGeoJSON]);
    const coordsVisuales = latLngs.map(p => [p.lat, p.lng]);

    try {
      let solapado = false;
      for (const c of cultivos) {
        let geometry = c.poligono || (c.poligono_geojson ? (typeof c.poligono_geojson === 'string' ? JSON.parse(c.poligono_geojson) : c.poligono_geojson) : null);
        if (!geometry) continue;
        const poliExistente = turf.polygon(geometry.coordinates);
        if (turf.intersect(turf.featureCollection([nuevoPoligonoTurf, poliExistente]))) {
          solapado = true; break;
        }
      }

      if (solapado) {
        setPoligonoActual([]);
        toast.error("La zona se solapa con una existente.");
      } else {
        setPoligonoActual(coordsVisuales);
        toast.success("Zona dibujada correctamente.");
      }
    } catch (err) {
      toast.error("Error al procesar el área dibujada");
    }
  };

  const handleZoneDeleted = () => {
    if (deleteLock.current) return;

    deleteLock.current = true;
    setPoligonoActual([]);
    toast.info("Zona eliminada del mapa");

    setTimeout(() => {
      deleteLock.current = false;
    }, 300);
  };

  // 3. Input Manual
  const handleManualCoords = (nuevasCoords) => {
    setPoligonoActual(nuevasCoords);
  };

  const onCultivoClick = (id_cultivo) => {
    const zonaEnriquecida = zonasParaMapa.find(z => z.id === id_cultivo);
    if (zonaEnriquecida) setCultivoSeleccionado(zonaEnriquecida);
  };

  return (
    <>
      <div className="cultivos-container">
        <ToastContainer position="bottom-center" limit={1} />

        <div className="cultivos-left-section">
          <div className="cultivos-header">
            <h2 className="cultivos-title">
              <MapIcon color="#2c3e50" />
              {esAdmin ? "Panel de Administración" :
                esManager ? "Gestión de Productores" :
                  "Mis Cultivos"}
            </h2>

            {puedeVerTodos && (
              <div className="cultivos-filter-container">
                <Users size={18} color="#666" />
                <select
                  className="cultivos-select"
                  value={usuarioAFiltrar}
                  onChange={(e) => setUsuarioAFiltrar(Number(e.target.value))}
                >

                  <option value={uid}>
                    {esAdmin ? "Selección de productor" :
                      esManager ? "Selección de productor" :
                        esAsesor ? "Selección de productor" :
                          "Mis Cultivos"}
                  </option>

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
                onZoneClicked={onCultivoClick}
                onZoneDeleted={handleZoneDeleted}
                readOnly={!puedeCrear}
                poligonoActual={poligonoActual}
              />
            )}
          </div>
        </div>

        <div className="cultivos-right-section">
          {cultivoSeleccionado ? (
            <DetalleCultivo
              cultivo={cultivoSeleccionado}
              onCerrar={() => setCultivoSeleccionado(null)}
              token={token}
            />
          ) : puedeCrear ? (
            <FormularioCultivo
              poligono={poligonoActual}
              setPoligonoExterno={handleManualCoords}
              token={token}
              onGuardar={(nuevoCultivo) => {
                setCultivos([nuevoCultivo, ...cultivos]);
                setPoligonoActual([]);
              }}
            />
          ) : null}
        </div>
      </div>

      <div className="herramientas-diagnostico-container" style={{ gridColumn: "1 / -1", width: "100%" }}>
        <DetectorPlantas />
        <DetectorPlagas />

      </div>
    </>
  );
};