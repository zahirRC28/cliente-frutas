import {
  CloudRainWind,
  CloudSnow,
  Bug,
  Bell,
  Loader
} from "lucide-react";
import { useEffect, useState } from "react";
import { tiempoRelativo } from "../../helpers/convertirTiempo";
import { useNotificaciones } from "../../hooks/notificaciones";
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
  const { obtenerNotificaciones, marcarComoLeida } = useNotificaciones();

  const [notificaciones, setNotificaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const handleNotisLeidas = async (id) => {
    const noti = notificaciones.find(n => n.id_notificacion === id);
    if (!noti || noti.leido) return;

    setNotificaciones(prev =>
      prev.map(n =>
        n.id_notificacion === id ? { ...n, leido: true } : n
      )
    );

    try {
      await marcarComoLeida(id);
    } catch (err) {
      console.error("Error al marcar como leída", err);

      setNotificaciones(prev =>
        prev.map(n =>
          n.id_notificacion === id ? { ...n, leido: false } : n
        )
      );
    }
  };

  const cargarDatos = async () => {
    setLoading(true);
    setError(false);

    try {
      const datos = await obtenerNotificaciones();
      setNotificaciones(datos || []);
    } catch (err) {
      console.error("Error cargando notificaciones:", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const contador = notificaciones.filter(n => !n.leido).length;

  if (loading) {
    return (
      <aside className="notifications-panel loader">
        <Loader className="animate-spin" size={30} />
        <p>Cargando notificaciones...</p>
      </aside>
    );
  }

  if (error) {
    return (
      <aside className="notifications-panel error">
        <p>No se pudieron cargar las notificaciones</p>
      </aside>
    );
  }

  return (
    <aside className="notifications-panel">
      <header className="notifications-header">
        <h3>Notificaciones</h3>
        {contador > 0 && (
          <span className="new-badge">
            {contador} nueva{contador !== 1 ? "s" : ""}
          </span>
        )}
      </header>

      <ul className="notifications-list">
        {notificaciones.length === 0 && (
          <li className="notification-empty">
            No tienes notificaciones
          </li>
        )}

        {notificaciones.map((notification) => (
          <li
            key={notification.id_notificacion}
            className={`notification-item ${
              !notification.leido ? "unread" : ""
            }`}
            onClick={() =>
              !notification.leido &&
              handleNotisLeidas(notification.id_notificacion)
            }
          >
            <div className="icon">
              {getIcon(notification.tipo)}
            </div>

            <div className="content">
              <strong>{notification.titulo}</strong>
              <p>{notification.mensaje}</p>
              <span className="time">
                {tiempoRelativo(notification.creado)}
              </span>
            </div>

            {!notification.leido && <span className="dot" />}
          </li>
        ))}
      </ul>
    </aside>
  );
};
