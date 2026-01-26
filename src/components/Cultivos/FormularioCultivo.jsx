// src/components/Cultivos/FormularioCultivo.jsx
import { useState } from "react";
import { Save, Paperclip, Loader2 } from "lucide-react";
import { toast } from 'react-toastify';
import conectar from "../../helpers/fetch";

const urlBase = import.meta.env.VITE_BACKEND_URL;

export default function FormularioCultivo({ poligono, onGuardar, token }) {
  const [formulario, setFormulario] = useState({
    nombre: "", 
    zona_cultivo: "Zona Norte", 
    tipo_cultivo: "Fruta",      
    region: "Galicia", 
    pais: "ES", 
    sistema_riego: "Goteo" 
  });

  const [archivo, setArchivo] = useState(null);
  const [guardando, setGuardando] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormulario({ ...formulario, [name]: name === 'pais' ? value.toUpperCase().slice(0, 2) : value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        return toast.error("El archivo supera el límite de 10MB");
      }
      setArchivo(file);
    }
  };

  const guardarCultivo = async () => {
    if (!poligono) return toast.warning("Dibuja una zona primero");
    if (formulario.nombre.length < 3) return toast.error("El nombre debe tener al menos 3 letras");

    setGuardando(true);
    try {
        const resCultivo = await conectar(`${urlBase}cultivo/crear`, 'POST', { ...formulario, poligono }, token);
        
        if (resCultivo?.ok) {
            if (archivo) {
                const idCultivo = resCultivo.cultivo.id_cultivo; 
                const formData = new FormData();
                formData.append('archivo', archivo);

                const resMultimedia = await conectar(`${urlBase}multimedia/cultivo/${idCultivo}`, 'POST', formData, token);

                if (resMultimedia?.error || !resMultimedia?.ok) {
                    toast.warning("Cultivo creado, pero hubo un error al subir la imagen.");
                } else {
                    toast.success("¡Cultivo e imagen guardados correctamente!");
                }
            } else {
                toast.success("¡Cultivo guardado!");
            }

            onGuardar(resCultivo.cultivo); 
            setFormulario({ ...formulario, nombre: "" }); 
            setArchivo(null); 
        } else {
            toast.error(resCultivo?.msg || "Error al guardar el cultivo");
        }
    } catch (error) { 
        toast.error("Error de conexión con el servidor"); 
    } finally {
        setGuardando(false);
    }
  };

  return (
    <div className="cultivos-form-wrapper">
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

      <label className="cultivos-label" style={{ marginTop: '10px' }}>Imagen o Video 360 (Opcional):</label>
      <div className="cultivos-input-file-container" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
        <input 
          type="file" 
          id="archivo"
          name="archivo" 
          accept=".jpg,.jpeg,.png,.webp,.pdf,.mp4,.mov,.avi,.mkv" 
          onChange={handleFileChange} 
          style={{ display: 'none' }}
        />
        <label htmlFor="archivo" className="cultivos-btn-upload" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', background: '#f1f5f9', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
          <Paperclip size={16} /> Seleccionar archivo
        </label>
        {archivo && <span style={{ fontSize: '12px', color: '#64748b' }}>{archivo.name}</span>}
      </div>

      <button 
        className="cultivos-btn-save"
        onClick={guardarCultivo} 
        disabled={!poligono || guardando}
        style={{ 
            background: (poligono && !guardando) ? '#22c55e' : '#cbd5e1', 
            cursor: (poligono && !guardando) ? 'pointer' : 'not-allowed',
            display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '5px'
        }}
      >
        {guardando ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />} 
        {guardando ? "Guardando..." : "Guardar Parcela"}
      </button>
    </div>
  );
}