import { useState, useEffect } from "react";
import conectar from "../helpers/fetch";
import Swal from 'sweetalert2';
import { userAuth } from "./userAuth";
import { useSocket } from "../contexts/SocketContext";

const urlBase = import.meta.env.VITE_BACKEND_URL;

export const useNotificaciones = () => {
    const { token, getRole, user } = userAuth();
    const rol = getRole();
    const id = user?.uid;
    const socket = useSocket();

    const [notificaciones, setNotificaciones] = useState([]);
    const [ultimaNotificacion, setUltimaNotificacion] = useState(null);
    const [loading, setLoading] = useState(true); // <- nuevo
    const [error, setError] = useState(false);    // <- nuevo

    // ==========================
    // Traer notificaciones iniciales
    // ==========================
    const obtenerNotificaciones = async () => {
        setLoading(true);
        setError(false);
        try {
            let info;
            if (rol === "Administrador") {
                info = await conectar(`${urlBase}notificacion`, "GET", {}, token);
            } else if (rol === "Productor" || rol === "Manager" || rol === "Asesor") {
                info = await conectar(`${urlBase}notificacion/por-receptor/${id}`, "GET", {}, token);
            }

            if (!info || typeof info !== "object") {
                setNotificaciones([]);
            } else {
                setNotificaciones(info.notifications || []);
            }
            //console.log("Notificaciones obtenidas:", info);
        } catch (err) {
            console.error("Error cargando notificaciones:", err);
            setError(true);
        } finally {
            setLoading(false);
        }
    };

    // ==========================
    // Marcar como leída
    // ==========================
    const marcarComoLeida = async (id_notificacion) => {
        setNotificaciones((prev) =>
            prev.map((n) =>
                n.id_notificacion === id_notificacion ? { ...n, leido: true } : n
            )
        );

        try {
            await conectar(`${urlBase}notificacion/${id_notificacion}/leida`, "PUT", {}, token);
        } catch (err) {
            console.error("Error al marcar como leída", err);
            setNotificaciones((prev) =>
                prev.map((n) =>
                    n.id_notificacion === id_notificacion ? { ...n, leido: false } : n
                )
            );
        }
    };
    // ==========================
    // Eliminar todas las notificaciones del usuario
    // ==========================
    const eliminarTodas = async () => {
        const result = await Swal.fire({
            title: '¿Seguro que quieres eliminar todas las notificaciones?',
            text: "No podrás deshacer esta acción.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar',
            focusCancel: true
        });
        if (!result.isConfirmed) return;

        try {
            await conectar(`${urlBase}notificacion/por-receptor/${id}`, "DELETE", {}, token);
            setNotificaciones([]);
            Swal.fire({
                title: 'Eliminadas',
                text: 'Todas las notificaciones han sido eliminadas.',
                icon: 'success',
                timer: 1400,
                showConfirmButton: false
            });
        } catch (err) {
            console.error("Error eliminando todas las notificaciones:", err);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudieron eliminar las notificaciones.'
            });
        }
    };

    // ==========================
    // Escuchar notificaciones en tiempo real
    // ==========================
    useEffect(() => {
        if (!socket) return;

        const handleNewNotification = (notif) => {
            setNotificaciones((prev) => [notif, ...prev]);
            setUltimaNotificacion(notif);

            // Limpiar la notificación emergente después de 4 segundos
            setTimeout(() => setUltimaNotificacion(null), 10000);
        };

        socket.on("new_notification", handleNewNotification);

        return () => socket.off("new_notification", handleNewNotification);
    }, [socket]);

    // ==========================
    // Cargar datos al inicio
    // ==========================
    useEffect(() => {
        obtenerNotificaciones();
    }, []);

    const contador = notificaciones.filter((n) => !n.leido).length;

    return {
        notificaciones,
        obtenerNotificaciones,
        marcarComoLeida,
        eliminarTodas,
        contador,
        ultimaNotificacion,
        loading, // <- nuevo
        error    // <- nuevo
    };
};
