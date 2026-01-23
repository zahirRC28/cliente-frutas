// src/components/Cultivos/FiltroProductores.jsx
import { Users } from "lucide-react";

export default function FiltroProductores({ productores, valorActual, onChange }) {
  // Si no hay productores cargados, podemos mostrar un estado de carga o vacío
  if (!productores || productores.length === 0) {
    return (
      <div className="cultivos-filtro-container" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b' }}>
        <Users size={16} />
        <span className="text-sm">Cargando productores...</span>
      </div>
    );
  }

  return (
    <div className="cultivos-filtro-container" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      <label 
        htmlFor="filtro-productor" 
        style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, color: '#334155' }}
      >
        <Users size={18} /> Filtrar por productor:
      </label>
      
      <select
        id="filtro-productor"
        value={valorActual || ""}
        // Convertimos el valor a Number porque los IDs suelen ser numéricos
        onChange={(e) => onChange(Number(e.target.value))} 
        className="cultivos-input"
        style={{ maxWidth: '300px', cursor: 'pointer' }}
      >
        <option value="" disabled>Seleccione un productor...</option>
        
        {productores.map((productor) => (
          <option 
            key={productor.id_usuario || productor.uid} 
            value={productor.id_usuario || productor.uid}
          >
            {productor.nombre} {productor.apellido || ''} - ({productor.email || `ID: ${productor.id_usuario || productor.uid}`})
          </option>
        ))}
      </select>
    </div>
  );
}