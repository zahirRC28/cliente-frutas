
import { useState } from "react";
import { Canvas, useLoader } from "@react-three/fiber";
import { Html, OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { animated, useSpring } from "@react-spring/web";
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

// --- SUBCOMPONENTE: El Punto Interactivo ---
const Marker = ({ position, icon, label, data, extraInfo, type, onClick }) => {
  const [hovered, setHovered] = useState(false);
  const texture = useLoader(THREE.TextureLoader, icon);

  const spring = useSpring({
    opacity: hovered ? 1 : 0,
    transform: hovered ? "scale(1)" : "scale(0.9)",
  });

  return (
    <mesh
      position={position}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      onClick={onClick} // 2. Añadimos el evento de clic al mesh
      style={{ cursor: onClick ? 'pointer' : 'auto' }} // Opcional: mejora UX
    >
      <sprite scale={[0.8, 0.8, 0.8]}>
        <spriteMaterial map={texture} transparent />
      </sprite>

      {hovered && (
        <Html distanceFactor={10}>
          <animated.div style={{
            ...spring,
            background: "white",
            padding: "12px",
            borderRadius: "8px",
            width: "280px",
            boxShadow: "0 4px 15px rgba(0,0,0,0.25)"
          }}>
            <h4 style={{ marginBottom: 8 }}>{label}</h4>

            {/* 🟢 LISTA DE ALERTAS METEO */}
            {type === "meteo_list" && Array.isArray(data) && (
        <div style={{
          fontSize: "12px",
          maxHeight: "600px",
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: "8px"
        }}>
    {data.map((d, i) => (
      <div key={i} style={{
        padding: "8px",
        borderRadius: "8px",
        background: d.estado.includes("VIENTO")
          ? "#fff7ed"
          : "#ecfeff",
        borderLeft: d.estado.includes("VIENTO")
          ? "4px solid #f97316"
          : "4px solid #22c55e"
      }}>
        <strong>
          {new Date(d.date).toLocaleDateString("es-ES", {
            weekday: "short",
            day: "numeric",
            month: "short"
          })}
        </strong>

        <div style={{ margin: "4px 0" }}>
          {d.estado}
        </div>

        <div style={{ color: "#555" }}>
          🌡 {d.temp_min}° / {d.temp_max}° · 💧 {d.hr_min}%–{d.hr_max}%
        </div>

        {d.viento_kmh > 20 && (
          <div style={{ color: "#ea580c" }}>
            💨 Viento: {d.viento_kmh} km/h
          </div>
        )}

        {d.lluvia_mm > 0 && (
          <div style={{ color: "#2563eb" }}>
            🌧 Lluvia: {d.lluvia_mm} mm
          </div>
        )}
      </div>
    ))}
  </div>
              )}


            {/* 🔵 GRÁFICAS (NDVI, etc) */}
            {type !== "meteo_list" && Array.isArray(data) && data.length > 0 && (
              <LineChart width={240} height={110} data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" hide />
                <YAxis fontSize={10} width={30} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#22c55e"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            )}
          </animated.div>
        </Html>
      )}
    </mesh>
  );
};


// --- COMPONENTE PRINCIPAL: La Esfera ---
export default function Panorama({ imageUrl, markers }) {
  const texture = useLoader(THREE.TextureLoader, imageUrl);
  
  return (
    <Canvas camera={{ position: [0, 0, 0.1] }} style={{ width: '100%', height: '100%', borderRadius: '12px' }}>
      {/* Invertimos la escala en X (-1) para ver la imagen por dentro */}
      <mesh scale={[-1, 1, 1]}>
        <sphereGeometry args={[10, 64, 64]} />
        <meshBasicMaterial map={texture} side={THREE.BackSide} />
      </mesh>
      
      {/* Controles para mover la cámara */}
      <OrbitControls enableZoom={true} enablePan={false} rotateSpeed={0.5} />
      
      {/* Dibujamos todos los marcadores */}
      {markers.map((m, i) => <Marker key={i} {...m} />)}
    </Canvas>
  );
}