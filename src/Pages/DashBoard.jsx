import { useState } from "react"; 
import { Users, Sprout, FileText, Map as MapIcon } from "lucide-react";
import { Card } from "../components/ui/Card";
import { userAuth } from "../hooks/userAuth";

import MapDraw from "../components/map/Map"; 

export const DashBoard = () => {
  const { getRole } = userAuth();
  const rol = getRole();
  
  const [nuevaZona, setNuevaZona] = useState(null);

  const handleZoneCreated = (coords) => {
    setNuevaZona(coords);
  };

  const guardarParcela = () => {
    console.log("Guardando en base de datos:", nuevaZona);
    alert("Parcela guardada con éxito (mira la consola)");
  };

  return (
    <>
      {/* --- VISTA DE ADMINISTRADOR --- */}
      {rol === 'Administrador' && (
        <section className="cards-container">
          <Card icono={<Users />} titulo="Usuarios" subtitulo={4} variant="counter"/>
          <Card icono={<Sprout />} titulo="Cultivos" subtitulo={18} variant="counter"/>
          <Card icono={<FileText />} titulo="Informes" subtitulo={57} variant="counter"/>
        </section>
      )}

      {/* --- VISTA DE PRODUCTOR --- */}
      {rol === 'Productor' && (
        <div style={{ padding: '20px' }}>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <MapIcon /> Gestión de Parcelas
          </h2>
          
          <div style={{ background: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
            <p style={{ marginBottom: '15px', color: '#666' }}>
              Utiliza las herramientas del mapa para delimitar tu nueva zona de cultivo.
            </p>

            <MapDraw onZoneCreated={handleZoneCreated} />

            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
              <button 
                onClick={guardarParcela}
                disabled={!nuevaZona} // Se deshabilita si no hay dibujo
                style={{
                  padding: '10px 20px',
                  backgroundColor: nuevaZona ? '#2ecc71' : '#ccc',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: nuevaZona ? 'pointer' : 'not-allowed',
                  fontWeight: 'bold',
                  fontSize: '16px'
                }}
              >
                Guardar Zona
              </button>
            </div>
          </div>

          {nuevaZona && (
            <div style={{ marginTop: '20px', padding: '10px', background: '#f8f9fa', borderRadius: '5px', fontSize: '12px' }}>
              <strong>Coordenadas detectadas:</strong> {nuevaZona.length} puntos.
            </div>
          )}
        </div>
      )}
    </>
  );
};