import { CloudRainWind, CloudSnow, Bug, Bell } from "lucide-react";
import { useNotificaciones } from "../../hooks/useNotificaciones";
import "../../styles/Notificaciones.css";

const getIcon = (tipo) => {
  switch (tipo) {
    case "Diluvio":
      return <CloudRainWind stroke="var(--verde-oscuro)" />;
    case "Helada":
      return <CloudSnow stroke="var(--verde-oscuro)" />;
    case "Plaga":
      return <Bug stroke="var(--verde-oscuro)" />;
    default:
      return <Bell stroke="var(--verde-oscuro)" />;
  }
};

export const NotiToast = () => {
  const { ultimaNotificacion } = useNotificaciones();

  if (!ultimaNotificacion) return null;

  return (
    <div className="noti-toast">
      <div className="icon">{getIcon(ultimaNotificacion.tipo)}</div>
      <div className="content">
        <strong>{ultimaNotificacion.titulo}</strong>
        <p>{ultimaNotificacion.mensaje}</p>
      </div>
    </div>
  );
};