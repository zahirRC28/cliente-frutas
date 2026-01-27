// src/components/Cultivos/FormularioCultivo.jsx
import { useState } from "react";
import { Save, Paperclip, Loader2, Plus, Trash2, MapPin } from "lucide-react";
import { toast } from 'react-toastify';
import conectar from "../../helpers/fetch";

const urlBase = import.meta.env.VITE_BACKEND_URL;

export default function FormularioCultivo({ poligono, onGuardar, token, setPoligonoExterno }) {
  const [formulario, setFormulario] = useState({
    nombre: "", 
    zona_cultivo: "Zona Norte", 
    tipo_cultivo: "Fruta",      
    region: "Galicia", 
    pais: "ES", 
    sistema_riego: "Goteo" 
  });

  const [tempCoord, setTempCoord] = useState({ lat: "", lng: "" });
  const [archivo, setArchivo] = useState(null);
  const [guardando, setGuardando] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormulario({ ...formulario, [name]: name === 'pais' ? value.toUpperCase().slice(0, 2) : value });
  };

  const handleCoordChange = (e) => {
    setTempCoord({ ...tempCoord, [e.target.name]: e.target.value });
  };

  const agregarCoordenada = () => {
    const lat = parseFloat(tempCoord.lat);
    const lng = parseFloat(tempCoord.lng);

    if (isNaN(lat) || isNaN(lng)) return toast.warning("Valores numéricos inválidos");
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return toast.warning("Coordenadas fuera de rango");
    
    // Añadir al array existente o crear uno nuevo
    const nuevoPoligono = [...(poligono || []), [lat, lng]];
    
    // Actualizar el mapa
    if (setPoligonoExterno) setPoligonoExterno(nuevoPoligono);
    
    setTempCoord({ lat: "", lng: "" }); 
  };

  const eliminarCoordenada = (index) => {
    if(!poligono){
      setPoligonoExterno([]);
      return;
    } 
    const nuevoPoligono = poligono.filter((_, i) => i !== index);
    if (setPoligonoExterno) setPoligonoExterno(nuevoPoligono);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) return toast.error("El archivo supera 10MB");
      setArchivo(file);
    }
  };

  const guardarCultivo = async () => {
    if (!poligono || poligono.length < 3) return toast.warning("Dibuja una zona válida (mínimo 3 puntos)");
    if (formulario.nombre.length < 3) return toast.error("El nombre debe tener al menos 3 letras");

    setGuardando(true);
    try {
        // --- PREPARACIÓN DE GEOJSON ---
        const coordsParaBackend = poligono.map(p => {
            const lat = Array.isArray(p) ? p[0] : p.lat;
            const lng = Array.isArray(p) ? p[1] : p.lng;
            return [parseFloat(lng), parseFloat(lat)]; // [Lng, Lat]
        });

        // Cerrar polígono
        const primerPunto = coordsParaBackend[0];
        const ultimoPunto = coordsParaBackend[coordsParaBackend.length - 1];
        if (primerPunto[0] !== ultimoPunto[0] || primerPunto[1] !== ultimoPunto[1]) {
            coordsParaBackend.push(primerPunto);
        }

        const geometriaGeoJSON = {
            type: "Polygon",
            coordinates: [coordsParaBackend]
        };

        const resCultivo = await conectar(
            `${urlBase}cultivo/crear`, 'POST', 
            { ...formulario, poligono: geometriaGeoJSON }, token
        );
        
        if (resCultivo?.ok) {
            if (archivo) {
                const idCultivo = resCultivo.cultivo.id_cultivo; 
                const formData = new FormData();
                formData.append('archivo', archivo);
                await conectar(`${urlBase}multimedia/cultivo/${idCultivo}`, 'POST', formData, token);
            }
            toast.success("¡Cultivo guardado!");
            onGuardar(resCultivo.cultivo); 
            
            // Limpiar formulario
            setFormulario({ ...formulario, nombre: "" }); 
            setArchivo(null); 
            
            // --- CORRECCIÓN AQUÍ: Usar setPoligonoExterno en lugar de setCoordsManuales ---
            if (setPoligonoExterno) setPoligonoExterno([]); 

        } else {
            toast.error(resCultivo?.msg || "Error al guardar el cultivo");
        }
    } catch (error) { 
        console.error(error);
        toast.error("Error de conexión"); 
    } finally {
        setGuardando(false);
    }
  };

  return (
    <div className="cultivos-form-wrapper">
      <h3 className="cultivos-form-title">Registrar Parcela</h3>
      
      <label className="cultivos-label">Nombre Parcela:</label>
      <input name="nombre" value={formulario.nombre} onChange={handleInputChange} className="cultivos-input" placeholder="Ej: Finca Norte" />
      
      {/* SECCIÓN MANUAL */}
      <div style={{ marginTop: '15px', padding: '10px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
        <div style={{display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '8px'}}>
            <MapPin size={16} color="#475569"/>
            <span style={{fontSize: '14px', fontWeight: '600', color: '#475569'}}>Coordenadas</span>
        </div>

        <div className="cultivos-flex-row" style={{ gap: '5px' }}>
            <input type="number" name="lat" placeholder="Latitud" value={tempCoord.lat} onChange={handleCoordChange} className="cultivos-input" style={{ marginBottom: 0 }} />
            <input type="number" name="lng" placeholder="Longitud" value={tempCoord.lng} onChange={handleCoordChange} className="cultivos-input" style={{ marginBottom: 0 }} />
            <button onClick={agregarCoordenada} className="cultivos-btn-icon" style={{background: '#3b82f6', color:'white', border:'none', borderRadius:'4px', padding:'0 10px', cursor:'pointer'}}>
                <Plus size={18} />
            </button>
        </div>

        {/* Lista de coordenadas */}
        {poligono && poligono.length > 0 && (
            <ul style={{ listStyle: 'none', padding: 0, marginTop: '10px', maxHeight: '100px', overflowY: 'auto' }}>
                {poligono.map((coord, idx) => {
                    const lat = Array.isArray(coord) ? coord[0] : coord.lat;
                    const lng = Array.isArray(coord) ? coord[1] : coord.lng;
                    return (
                        <li key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', padding: '4px', borderBottom: '1px solid #eee' }}>
                            <span>P.{idx + 1}: {parseFloat(lat).toFixed(4)}, {parseFloat(lng).toFixed(4)}</span>
                            <Trash2 size={14} color="#ef4444" style={{ cursor: 'pointer' }} onClick={() => eliminarCoordenada(idx)} />
                        </li>
                    )
                })}
            </ul>
        )}
      </div>

      <label className="cultivos-label" style={{marginTop: '10px'}}>Tipo y Riego:</label>
      <div className="cultivos-flex-row">
        <select name="tipo_cultivo" value={formulario.tipo_cultivo} onChange={handleInputChange} className="cultivos-input">
            <option value="Fruta">Fruta</option>
            <option value="Hortaliza">Hortaliza</option>
            <option value="Cereal">Cereal</option>
        </select>
        <select name="sistema_riego" value={formulario.sistema_riego} onChange={handleInputChange} className="cultivos-input">
            <option value="Goteo">Goteo</option>
            <option value="Aspersión">Aspersión</option>
            <option value="Manual">Manual</option>
        </select>
      </div>
      
      <label className="cultivos-label">Imagen (Opcional):</label>
      <input type="file" onChange={handleFileChange} className="cultivos-input" />

      <button 
        className="cultivos-btn-save"
        onClick={guardarCultivo} 
        disabled={!poligono || poligono.length < 3 || guardando}
        style={{ marginTop: '15px', background: (poligono && poligono.length >= 3) ? '#22c55e' : '#cbd5e1', cursor: (poligono && poligono.length >= 3) ? 'pointer' : 'not-allowed', display: 'flex', justifyContent: 'center', gap: '5px', padding: '10px', width: '100%', border: 'none', borderRadius: '6px', color: 'white' }}
      >
        {guardando ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />} 
        {guardando ? "Guardando..." : "Guardar Parcela"}
      </button>
    </div>
  );
}