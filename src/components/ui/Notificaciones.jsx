import { CloudHail, Droplet, Bug, Bell } from "lucide-react";
import { useEffect, useState } from "react";
import "../../styles/Notificaciones.css";
import { notificaciones } from "../../hooks/notificaciones";
const notisPrueba = [
    {
        id: 1,
        type: "rain",
        title: "Alerta de lluvia",
        message: "Se esperan precipitaciones moderadas en las próximas horas.",
        time: "Hace 10 min",
        unread: true,
    },
    {
        id: 2,
        type: "irrigation",
        title: "Riego programado",
        message: "El sistema de riego automático se activará a las 06:00.",
        time: "Hace 1 hora",
        unread: false,
    },
    {
        id: 3,
        type: "pest",
        title: "Detección de plagas",
        message: "Se han detectado indicios de pulgón en el sector B2.",
        time: "Hace 3 horas",
        unread: false,
    },
    {
        id: 4,
        type: "rain",
        title: "Clima inestable",
        message: "Posibles lluvias aisladas durante la tarde.",
        time: "Hace 5 horas",
        unread: true,
    },
    {
        id: 5,
        type: "irrigation",
        title: "Riego finalizado",
        message: "El riego del sector A1 ha finalizado correctamente.",
        time: "Hace 1 día",
        unread: false,
    },
    {
        id: 6,
        type: "pest",
        title: "Seguimiento fitosanitario",
        message: "Revisar sector C1 por posibles insectos.",
        time: "Hace 2 días",
        unread: false,
    }
];

const getIcon = (type) => {
    switch (type) {
        case "rain":
            return <CloudHail stroke="var(--verde-oscuro)" />;
        case "irrigation":
            return <Droplet stroke="var(--verde-oscuro)" />;
        case "pest":
            return <Bug stroke="var(--verde-oscuro)" />;
        default:
            return <Bell stroke="var(--verde-oscuro)" />;
    }
};
export const Notificaciones = () => {
    const [notificaciones, setNotificaciones] = useState(notisPrueba);
    const handleNotisLeidas = (id) => {
        setNotificaciones((prev) =>
            prev.map((n) => (n.id === id ? { ...n, unread: false } : n)),
        );
    };
    const contador = notificaciones.filter((n) => n.unread).length;

    /*const { todasNotifi } = notificaciones();
    const [ datosNotifi, setDatosNotifi ] = useState([]);

    const cargandoDatos = async()=>{
        const datos = await todasNotifi();
        console.log(datos);
        setDatosNotifi(datos);
    }

    useEffect(() => {
        cargandoDatos();
    }, []);*/

    return (
        <aside className="notifications-panel">
            <header className="notifications-header">
                <h3>Notificaciones</h3>
                {contador > 0 && (
                    <span className="new-badge">{contador} nuevas</span>
                )}
            </header>
            <ul className="notifications-list">
                {notificaciones.map((notification) => (
                    <li
                        key={notification.id}
                        className={`notification-item ${
                            notification.unread ? "unread" : ""
                        }`}
                        onClick={() => handleNotisLeidas(notification.id)}
                    >
                        <div className="icon">{getIcon(notification.type)}</div>
                        <div className="content">
                            <strong>{notification.title}</strong>
                            <p>{notification.message}</p>
                            <span className="time">{notification.time}</span>
                        </div>
                        {notification.unread && <span className="dot" />}
                    </li>
                ))}
            </ul>
        </aside>
    );
};