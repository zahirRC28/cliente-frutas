import { useState } from "react";
import { Canvas, useLoader } from "@react-three/fiber";
import { Html, OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { animated, useSpring } from "@react-spring/web";
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

// --- SUBCOMPONENTE: El Punto Interactivo ---
const Marker = ({ position, icon, label, data, extraInfo, type }) => {
  // 1. Cambiamos 'hovered' por 'showInfo' para persistencia tras el clic
  const [showInfo, setShowInfo] = useState(false);
  const texture = useLoader(THREE.TextureLoader, icon);

  const spring = useSpring({
    opacity: showInfo ? 1 : 0,
    transform: showInfo ? "scale(1)" : "scale(0.8)",
    config: { tension: 300, friction: 20 }
  });

  return (
    <mesh
      position={position}
      // 2. El disparador ahora es exclusivamente el clic
      onClick={(e) => {
        e.stopPropagation(); // Evita que el clic "atraviese" el marcador hacia la esfera
        setShowInfo(!showInfo);
      }}
    >
      <sprite scale={[0.8, 0.8, 0.8]}>
        <spriteMaterial map={texture} transparent />
      </sprite>

      {showInfo && (
        <Html distanceFactor={10} zIndexRange={[10, 0]}>
          <animated.div 
            className="custom-360-tooltip" // Usamos la clase del CSS optimizado
            style={{
              ...spring,
              background: "white",
              padding: "15px",
              borderRadius: "12px",
              width: "280px",
              boxShadow: "0 10px 25px rgba(0,0,0,0.3)",
              position: "relative",
              pointerEvents: "auto" // Importante: permite hacer scroll en la lista de meteo
            }}
          >
            {/* Botón de cerrar interno opcional para mejor UX */}
            <button 
              onClick={() => setShowInfo(false)}
              style={{
                position: "absolute",
                top: "5px",
                right: "8px",
                border: "none",
                background: "transparent",
                cursor: "pointer",
                fontSize: "16px",
                color: "#94a3b8"
              }}
            >
              ×
            </button>

            <h4 style={{ marginBottom: "10px", paddingRight: "15px", fontSize: "14px", color: "#1e293b" }}>
              {label}
            </h4>

            {/* 🟢 LISTA DE ALERTAS METEO */}
            {type === "meteo_list" && Array.isArray(data) && (
              <div style={{
                fontSize: "12px",
                maxHeight: "300px", // Ajustado para no desbordar el Canvas
                overflowY: "auto",
                display: "flex",
                flexDirection: "column",
                gap: "8px",
                paddingRight: "5px"
              }}>
                {data.map((d, i) => (
                  <div key={i} style={{
                    padding: "10px",
                    borderRadius: "8px",
                    background: d.estado.includes("VIENTO") ? "#fff7ed" : "#ecfeff",
                    borderLeft: d.estado.includes("VIENTO") ? "4px solid #f97316" : "4px solid #22c55e",
                    boxShadow: "0 1px 2px rgba(0,0,0,0.05)"
                  }}>
                    <strong style={{ display: "block", marginBottom: "3px" }}>
                      {new Date(d.date).toLocaleDateString("es-ES", {
                        weekday: "short", day: "numeric", month: "short"
                      })}
                    </strong> 
                    <div style={{ marginBottom: "4px", fontWeight: "500" }}>{d.estado}</div>
                    <div style={{ color: "#475569", fontSize: "11px" }}>
                      🌡 {d.temp_min}°/{d.temp_max}° · 💧 {d.hr_min}%–{d.hr_max}%
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* 🔵 GRÁFICAS (NDVI, etc) */}
            {type !== "meteo_list" && Array.isArray(data) && data.length > 0 && (
              <div style={{ marginTop: "10px" }}>
                <LineChart width={250} height={120} data={data}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="time" hide />
                  <YAxis fontSize={10} width={25} axisLine={false} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#10b981"
                    strokeWidth={3}
                    dot={{ r: 3, fill: '#10b981' }}
                  />
                </LineChart>
                {extraInfo && (
                  <div style={{ marginTop: "8px", fontSize: "11px", color: "#64748b", borderTop: "1px solid #f1f5f9", paddingTop: "8px" }}>
                    {Object.entries(extraInfo).map(([k, v]) => (
                      <div key={k}><strong>{k}:</strong> {v}</div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </animated.div>
        </Html>
      )}
    </mesh>
  );
};

// --- COMPONENTE PRINCIPAL ---
export default function Panorama({ imageUrl, markers }) {
  const texture = useLoader(THREE.TextureLoader, imageUrl);
  
  return (
    <Canvas 
      camera={{ position: [0, 0, 0.1] }} 
      style={{ width: '100%', height: '100%', borderRadius: '12px', background: '#000' }}
    >
      <mesh scale={[-1, 1, 1]}>
        <sphereGeometry args={[10, 64, 64]} />
        <meshBasicMaterial map={texture} side={THREE.BackSide} />
      </mesh>
      
      <OrbitControls 
        enableZoom={true} 
        enablePan={false} 
        rotateSpeed={0.5}
        makeDefault // Asegura que los controles no interfieran con los clics de los marcadores
      />
      
      {markers.map((m, i) => (
        <Marker key={i} {...m} />
      ))}
    </Canvas>
  );
}