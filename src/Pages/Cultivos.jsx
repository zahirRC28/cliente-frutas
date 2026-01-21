import { useState, useMemo } from "react";
import { Map as MapIcon, Save } from "lucide-react";
import { userAuth } from "../hooks/userAuth";
import MapDraw from "../components/map/Map";
import * as turf from "@turf/turf";

// Importar Toastify
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Base de datos simulada
const MIS_CULTIVOS_DB = [
  {
    id_cultivo: 1,
    nombre: "Manzanos Norte",
    zona_cultivo: "Zona A",
    tipo_cultivo: "Fruta",
    region: "Galicia",
    pais: "España",
    sistema_riego: "Goteo",
    poligono_geojson: {
      "type": "Polygon",
      "coordinates": [[[-3.0, 42.0], [-3.0, 42.1], [-2.9, 42.1], [-3.0, 42.0]]]
    }
  },
  {
    id_cultivo: 2,
    nombre: "Huerta Patatas",
    zona_cultivo: "Zona B",
    tipo_cultivo: "Hortaliza",
    region: "Castilla",
    pais: "España",
    sistema_riego: "Aspersión",
    poligono_geojson: {
      "type": "Polygon",
      "coordinates": [[[-3.5, 40.0], [-3.5, 40.1], [-3.4, 40.1], [-3.5, 40.0]]]
    }
  }
];

export const Cultivos = () => {
  const auth = userAuth() || {};
  const getUser = auth.getUser || (() => ({ id: 0 }));
  const user = getUser();

  const [nuevaZonaCoords, setNuevaZonaCoords] = useState(null);
  const [filtroTipo, setFiltroTipo] = useState("Todos");
  
  const [formulario, setFormulario] = useState({
    nombre: "",
    zona_cultivo: "",
    tipo_cultivo: "Fruta",
    region: "",
    pais: "España",
    sistema_riego: "Goteo"
  });

  const inputStyle = { padding: '8px', borderRadius: '5px', border: '1px solid #ccc' };

  const zonasParaMapa = useMemo(() => {
    if (!MIS_CULTIVOS_DB) return [];
    const datosFiltrados = filtroTipo === "Todos" 
        ? MIS_CULTIVOS_DB 
        : MIS_CULTIVOS_DB.filter(c => c.tipo_cultivo === filtroTipo);

    return datosFiltrados.map(cultivo => {
        if (!cultivo.poligono_geojson?.coordinates?.[0]) return null;
        const puntosGeoJSON = cultivo.poligono_geojson.coordinates[0];
        const puntosLeaflet = puntosGeoJSON.map(p => [p[1], p[0]]);
        return {
            id: cultivo.id_cultivo,
            nombre: cultivo.nombre,
            tipo: cultivo.tipo_cultivo,
            color: cultivo.tipo_cultivo === 'Fruta' ? '#e74c3c' : '#2ecc71',
            coords: puntosLeaflet,
            geojsonOriginal: cultivo.poligono_geojson 
        };
    }).filter(z => z !== null);
  }, [filtroTipo]);

  const handleZoneCreated = (coords) => {
    setNuevaZonaCoords(null);
    
    const puntosGeoJSON = coords.map(p => [p.lng, p.lat]);
    puntosGeoJSON.push(puntosGeoJSON[0]); 

    try {
        const nuevoPoligono = turf.polygon([puntosGeoJSON]);
        let haySolapamiento = false;

        for (const cultivo of MIS_CULTIVOS_DB) {
            const poligonoExistente = turf.polygon(cultivo.poligono_geojson.coordinates);
            const interseccion = turf.intersect(
                turf.featureCollection([nuevoPoligono, poligonoExistente])
            );
            if (interseccion) {
                haySolapamiento = true;
                break;
            }
        }

        if (haySolapamiento) {
            // ToastId evita duplicados y position lo mueve abajo
            toast.error("La zona se solapa con una existente.", {
                toastId: "valida-solapamiento", 
                position: "bottom-center",
                autoClose: 2000,
                theme: "colored"
            });
        } else {
            setNuevaZonaCoords(coords);
            toast.success("Zona válida seleccionada.", {
                toastId: "valida-ok",
                position: "bottom-center",
                autoClose: 2000,
                theme: "light"
            });
        }
    } catch (err) {
        console.error("Error de geometría:", err);
    }
  };

  const handleInputChange = (e) => {
    setFormulario({ ...formulario, [e.target.name]: e.target.value });
  };
  
  const guardarCultivo = () => {
    if (!nuevaZonaCoords) return;
    toast.success("¡Cultivo guardado con éxito!", { position: "bottom-center" });
    console.log("Datos guardados:", { ...formulario, coords: nuevaZonaCoords });
  };

  return (
    <div style={{ padding: '20px', display: 'flex', gap: '20px', flexWrap: 'wrap', fontFamily: 'Arial, sans-serif' }}>
      
      {/* ToastContainer configurado en la parte inferior y limitado a 1 mensaje */}
      <ToastContainer position="bottom-center" limit={1} />

      <div style={{ flex: 2, minWidth: '350px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', alignItems: 'center' }}>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: 0 }}>
                <MapIcon color="#2c3e50" /> Parcelas Agrícolas
            </h2>
            <select value={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value)} style={{ padding: '5px' }}>
                <option value="Todos">Todos</option>
                <option value="Fruta">Frutas</option>
                <option value="Hortaliza">Hortalizas</option>
            </select>
        </div>

        <div style={{ background: 'white', padding: '10px', borderRadius: '10px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
            <MapDraw 
                onZoneCreated={handleZoneCreated} 
                zonasVisibles={zonasParaMapa} 
            />
        </div>
      </div>

      <div style={{ flex: 1, minWidth: '300px', background: 'white', padding: '25px', borderRadius: '10px', height: 'fit-content', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
        <h3>Nuevo Cultivo</h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <input name="nombre" placeholder="Nombre" onChange={handleInputChange} style={inputStyle} />
            <input name="zona_cultivo" placeholder="Zona" onChange={handleInputChange} style={inputStyle} />
            
            <select name="tipo_cultivo" onChange={handleInputChange} style={inputStyle}>
                <option value="Fruta">Fruta</option>
                <option value="Hortaliza">Hortaliza</option>
                <option value="Cereal">Cereal</option>
            </select>

            <input name="region" placeholder="Región" onChange={handleInputChange} style={inputStyle} />
            <input name="pais" placeholder="País" value={formulario.pais} onChange={handleInputChange} style={inputStyle} />
            <input name="sistema_riego" placeholder="Sistema de Riego" onChange={handleInputChange} style={inputStyle} />

            <button 
                onClick={guardarCultivo}
                disabled={!nuevaZonaCoords}
                style={{
                    marginTop: '10px',
                    padding: '14px',
                    backgroundColor: nuevaZonaCoords ? '#22c55e' : '#cbd5e1',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: nuevaZonaCoords ? 'pointer' : 'not-allowed',
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                }}
            >
                <Save size={20} /> Guardar Parcela
            </button>
        </div>
      </div>
    </div>
  );
};