// /src/utils/coords.js

// 1. Convierte grados a radianes (necesario para Three.js)
const degToRad = (deg) => (deg * Math.PI) / 180;

// 2. Convierte píxeles (X, Y) a ángulos de la esfera (Yaw, Pitch)
export const pixelToYawPitch = (x, y, width, height) => {
  const yaw = (x / width) * 360 - 180;
  const pitch = 90 - (y / height) * 180;
  return { yaw, pitch };
};

// 3. Convierte los ángulos a coordenadas 3D (X, Y, Z)
export const yawPitchToCartesian = (yaw, pitch, radius = 6) => {
  const yawRad = degToRad(yaw);
  const pitchRad = degToRad(pitch);
  return [
    radius * Math.sin(yawRad) * Math.cos(pitchRad),
    radius * Math.sin(pitchRad),
    -radius * Math.cos(yawRad) * Math.cos(pitchRad),
  ];
};

// 4. FUNCIÓN PRINCIPAL que usaremos en los componentes
export const apiPointToPosition = (point, dimensiones, radius = 6) => {
  const { yaw, pitch } = pixelToYawPitch(point.x, point.y, dimensiones.width, dimensiones.height);
  return yawPitchToCartesian(yaw, pitch, radius);
};
