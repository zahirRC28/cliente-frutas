// src/components/Cultivos/FormularioCultivo.jsx
import { useState } from "react";
import { Save } from "lucide-react";
import { toast } from 'react-toastify';
import conectar from "../../helpers/fetch";

const urlBase = import.meta.env.VITE_BACKEND_URL;

export default function FormularioCultivo({ poligono, onGuardar, token }) {
  const [formulario, setFormulario] = useState({
    nombre: "", zona_cultivo: "Zona Norte", tipo_cultivo: "Fruta",      
    region: "Galicia", pais: "ES", sistema_riego: "Goteo" 
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormulario({ ...formulario, [name]: name === 'pais' ? value.toUpperCase().slice(0, 2) : value });
  };

  const guardarCultivo = async () => {
    if (!poligono) return toast.warning("Dibuja una zona primero");
    if (formulario.nombre.length < 3) return toast.error("El nombre debe tener al menos 3 letras");

    try {
        const respuesta = await conectar(`${urlBase}cultivo/crear`, 'POST', { ...formulario, poligono }, token);
        if (respuesta?.ok) {
            toast.success("¡Cultivo guardado!");
            onGuardar(respuesta.cultivo); // Actualiza la lista en el componente padre
            setFormulario({ ...formulario, nombre: "" }); 
        } else {
            toast.error(respuesta?.msg || "Error al guardar");
        }
    } catch (error) { toast.error("Error de conexión"); }
  };

  return (
    <div className="cultivos-form-wrapper">
      <h3 className="cultivos-form-title">Registrar Parcela</h3>
      
      <label className="cultivos-label">Nombre Parcela:</label>
      <input name="nombre" value={formulario.nombre} onChange={handleInputChange} className="cultivos-input" />
      
      {/* ... (Aquí van el resto de tus inputs que ya tenías) ... */}

      <button 
        className="cultivos-btn-save"
        onClick={guardarCultivo} 
        disabled={!poligono}
        style={{ 
            background: poligono ? '#22c55e' : '#cbd5e1', 
            cursor: poligono ? 'pointer' : 'not-allowed' 
        }}
      >
        <Save size={18} /> Guardar Parcela
      </button>
    </div>
  );
}