import { CloudRainWind, CloudSnow, Bug, Bell } from "lucide-react";
import { useEffect, useState } from "react";
import { tiempoRelativo } from "../../helpers/convertirTiempo"
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
    const [notificaciones, setNotificaciones] = useState([]);
    const { obtenerNotificaciones, marcarComoLeida } = useNotificaciones();

    const handleNotisLeidas = async (id) => {
        const noti = notificaciones.find(n => n.id_notificacion === id);
        if (!noti || noti.leido) return;

        setNotificaciones(prev =>
            prev.map(n =>
                n.id_notificacion === id
                    ? { ...n, leido: true }
                    : n
            )
        );

        try {
            await marcarComoLeida(id);
        } catch (error) {
            console.error("Error al marcar como leída", error);

            setNotificaciones(prev =>
                prev.map(n =>
                    n.id_notificacion === id
                        ? { ...n, leido: false }
                        : n
                )
            );
        }
    };

    const cargarDatos = async () => {
        const datos = await obtenerNotificaciones();
        setNotificaciones(datos);
    }

    useEffect(() => {
        cargarDatos();
    }, []);

    const contador = notificaciones.filter((n) => !n.leido).length;

    return (
        <aside className="notifications-panel">
            <header className="notifications-header">
                <h3>Notificaciones</h3>
                {contador > 0 && (
                    <span className="new-badge">{contador} {`nueva${contador !== 1 ? "s" : ""}`}</span>
                )}
            </header>
            <ul className="notifications-list">
                {notificaciones.map((notification) => (
                    <li
                        key={notification.id_notificacion}
                        className={`notification-item ${
                            !notification.leido ? "unread" : ""
                        }`}
                        onClick={() => !notification.leido && handleNotisLeidas(notification.id_notificacion)}
                    >
                        <div className="icon">{getIcon(notification.tipo)}</div>
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