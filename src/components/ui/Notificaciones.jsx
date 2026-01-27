
import {
  CloudRainWind,
  CloudSnow,
  Bug,
  Bell,
  Loader
} from "lucide-react";
import { useNotificaciones } from "../../hooks/useNotificaciones";
import { tiempoRelativo } from "../../helpers/convertirTiempo";
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

export const Notificaciones = () => {
  const {
    notificaciones,
    marcarComoLeida,
    eliminarTodas,
    contador,
    loading,
    error
  } = useNotificaciones();
  console.log(notificaciones);
  if (loading) return <div>Cargando...</div>;
  if (error) return <div>Error al cargar notificaciones</div>;

  return (
    <aside className="notifications-panel">
      <header className="notifications-header">
        <h3>Notificaciones</h3>
        <div style={{ display: "flex", gap: "8px" }}>
          {contador > 0 && <span className="new-badge">{contador} nueva{contador !== 1 ? "s" : ""}</span>}
          {notificaciones.length > 0 && (
            <button onClick={eliminarTodas} className="clear-btn">Eliminar todas</button>
          )}
        </div>
      </header>

      <ul className="notifications-list">
        {notificaciones.length === 0 && <li>No tienes notificaciones</li>}
        {notificaciones.map(n => (
          <li
            key={n.id_notificacion}
            className={`notification-item ${!n.leido ? "unread" : ""}`}
            onClick={() => !n.leido && marcarComoLeida(n.id_notificacion)}
          >
            <div className="icon">{getIcon(n.tipo)}</div>
            <div className="content">
              <strong>{n.titulo}</strong>
              <p>{n.mensaje}</p>
              <span className="time">{tiempoRelativo(n.creado)}</span>
            </div>
            {!n.leido && <span className="dot" />}
          </li>
        ))}
      </ul>
    </aside>
  );
};
