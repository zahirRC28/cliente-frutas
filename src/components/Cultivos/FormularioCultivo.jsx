// src/components/Cultivos/FormularioCultivo.jsx
import { useState, useEffect } from "react";
import { Save, Loader2, Plus, Trash2, MapPin,XCircle } from "lucide-react";
import { toast } from 'react-toastify';
import conectar from "../../helpers/fetch";
// Asegúrate de que la ruta sea correcta
import "../../styles/FormularioCultivos.css"; 

const urlBase = import.meta.env.VITE_BACKEND_URL;

export default function FormularioCultivo({ poligono, onGuardar, token, setPoligonoExterno, edit ,onCancelar}) {
  
  const [formulario, setFormulario] = useState({
    nombre: edit?.nombre || "", 
    zona_cultivo: edit?.zona_cultivo || "Zona Norte", 
    tipo_cultivo: edit?.tipo_cultivo || "Fruta",      
    region: edit?.region || "", 
    pais: edit?.pais || "", 
    sistema_riego: edit?.sistema_riego || "Goteo" 
  });

  const [tempCoord, setTempCoord] = useState({ lat: "", lng: "" });
  const [archivo, setArchivo] = useState(null);
  const [guardando, setGuardando] = useState(false);
  

  useEffect(() => {
    if (edit) {
      setFormulario({
        nombre: edit.nombre || "",
        zona_cultivo: edit.zona_cultivo || "Zona Norte",
        tipo_cultivo: edit.tipo_cultivo || "Fruta",
        region: edit.region || "",
        pais: edit.pais || "",
        sistema_riego: edit.sistema_riego || "Goteo"
      });
      
      if (edit.coords && (!poligono || poligono.length === 0)) {
        setPoligonoExterno(edit.coords);
      }
    }
  }, [edit, setPoligonoExterno]);

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
    
    const nuevoPoligono = [...(poligono || []), [lat, lng]];
    if (setPoligonoExterno) setPoligonoExterno(nuevoPoligono);
    setTempCoord({ lat: "", lng: "" }); 
  };

  const eliminarCoordenada = (index) => {
    const nuevoPoligono = poligono.filter((_, i) => i !== index);
    if (setPoligonoExterno) setPoligonoExterno(nuevoPoligono);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.size <= 10 * 1024 * 1024) setArchivo(file);
    else if (file) toast.error("El archivo supera 10MB");
  };

  const esFormularioValido = 
    formulario.nombre.trim().length >= 3 && 
    formulario.region.trim().length > 0 &&
    formulario.pais.trim().length === 2 &&
    (poligono && poligono.length >= 3) &&
    (edit ? true : archivo !== null);

  const guardarCultivo = async () => {
    if (!poligono || poligono.length < 3) return toast.warning("Mínimo 3 puntos en el mapa");

    setGuardando(true);
    try {
      const coordsParaBackend = poligono.map(p => {
        const lat = Array.isArray(p) ? p[0] : p.lat;
        const lng = Array.isArray(p) ? p[1] : p.lng;
        return [parseFloat(lng), parseFloat(lat)];
      });

      if (coordsParaBackend[0][0] !== coordsParaBackend[coordsParaBackend.length-1][0]) {
        coordsParaBackend.push(coordsParaBackend[0]);
      }

      const geometriaGeoJSON = { type: "Polygon", coordinates: [coordsParaBackend] };
      const url = edit ? `${urlBase}cultivo/editar/${edit.id_cultivo}` : `${urlBase}cultivo/crear`;
      const metodo = edit ? 'PUT' : 'POST';

      const res = await conectar(url, metodo, { ...formulario, poligono: geometriaGeoJSON }, token);
      
      if (res?.ok) {
        const cultivoFinal = res.cultivo || res.updated;

        if (archivo) {
          const formData = new FormData();
          formData.append('archivo', archivo);
          await conectar(`${urlBase}multimedia/cultivo/${cultivoFinal.id_cultivo}`, 'POST', formData, token);
        }

        toast.success(edit ? "¡Cambios guardados!" : "¡Cultivo creado!");
        onGuardar(cultivoFinal); 

        if (!edit) {
          setFormulario({ nombre: "", zona_cultivo: "Zona Norte", tipo_cultivo: "Fruta", region: "", pais: "", sistema_riego: "Goteo" });
          setArchivo(null);
          if (setPoligonoExterno) setPoligonoExterno([]);
        }
      } else {
        toast.error(res?.msg || "Error en la operación");
      }
    } catch (error) {
      toast.error("Error de conexión"); 
    } finally {
      setGuardando(false);
    }
  };

  // Clase dinámica para el botón
    const claseBotonGuardar = `cultivos-btn-save ${esFormularioValido && !guardando ? 'btn-valid' : 'btn-disabled'}`;
  return (
    <div className="cultivos-form-wrapper">
      <h3 className="cultivos-form-title">{edit ? "Editar Parcela" : "Registrar Parcela"}</h3>
      
      <label className="cultivos-label">Nombre Parcela:</label>
      <input name="nombre" value={formulario.nombre} onChange={handleInputChange} className="cultivos-input" placeholder="Ej: Finca Los Olivos" />

      {/* Usamos una clase auxiliar para el gap */}
      <div className="cultivos-flex-row row-spaced">
        <div className="cultivos-col">
          <label className="cultivos-label">Región:</label>
          <input name="region" value={formulario.region} onChange={handleInputChange} className="cultivos-input" placeholder="Ej: Andalucía" />
        </div>
        <div className="cultivos-col">
          <label className="cultivos-label">País (ES):</label>
          <input name="pais" value={formulario.pais} onChange={handleInputChange} className="cultivos-input" maxLength={2} placeholder="ES" />
        </div>
      </div>

      {/* SECCIÓN COORDENADAS REFACTORIZADA */}
      <div className="cultivos-coords-panel">
        <div className="cultivos-coords-header">
          <MapPin size={14} className="icon-slate"/>
          <span className="coords-title">Puntos del Área ({poligono?.length || 0})</span>
        </div>

        <div className="cultivos-flex-row row-small-gap">
          <input type="number" name="lat" placeholder="Lat" value={tempCoord.lat} onChange={handleCoordChange} className="cultivos-input input-coord" />
          <input type="number" name="lng" placeholder="Lng" value={tempCoord.lng} onChange={handleCoordChange} className="cultivos-input input-coord" />
          <button onClick={agregarCoordenada} className="cultivos-btn-add">
            <Plus size={18} />
          </button>
        </div>

        {poligono?.length > 0 && (
          <ul className="cultivos-coords-list">
            {poligono.map((coord, idx) => (
              <li key={idx} className="cultivos-coords-item">
                <span>P{idx+1}: {parseFloat(Array.isArray(coord) ? coord[0] : coord.lat).toFixed(4)}, {parseFloat(Array.isArray(coord) ? coord[1] : coord.lng).toFixed(4)}</span>
                <Trash2 size={14} className="icon-trash" onClick={() => eliminarCoordenada(idx)} />
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="cultivos-flex-row row-spaced mt-10">
        <div className="cultivos-col">
          <label className="cultivos-label">Tipo:</label>
          <select name="tipo_cultivo" value={formulario.tipo_cultivo} onChange={handleInputChange} className="cultivos-input">
            <option value="Fruta">Fruta</option>
            <option value="Hortaliza">Hortaliza</option>
            <option value="Cereal">Cereal</option>
          </select>
        </div>
        <div className="cultivos-col">
          <label className="cultivos-label">Riego:</label>
          <select name="sistema_riego" value={formulario.sistema_riego} onChange={handleInputChange} className="cultivos-input">
            <option value="Goteo">Goteo</option>
            <option value="Aspersión">Aspersión</option>
            <option value="Manual">Manual</option>
          </select>
        </div>
      </div>

      <label className="cultivos-label">Imagen {edit && "(Opcional para actualizar)"}:</label>
      <input type="file" onChange={handleFileChange} className="cultivos-input" />

      {/* --- ZONA DE BOTONES MODIFICADA --- */}
      <div className="cultivos-action-buttons">
        {/* Botón Cancelar (Solo aparece si estamos editando) */}
        {edit && (
          <button 
            className="cultivos-btn-cancel"
            onClick={onCancelar}
            disabled={guardando}
          >
            <XCircle size={18} /> Cancelar
          </button>
        )}

        {/* Botón Guardar */}
        <button 
          className={claseBotonGuardar}
          onClick={guardarCultivo} 
          disabled={!esFormularioValido || guardando}
        >
          {guardando ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />} 
          {guardando ? "Procesando..." : edit ? "Actualizar" : "Guardar"}
        </button>
      </div>
    </div>
  );
}