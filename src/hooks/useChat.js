import { useEffect, useState } from 'react';
import conectar from '../helpers/fetch';
import { useSocket } from '../contexts/SocketContext';

const urlBase = import.meta.env.VITE_BACKEND_URL;

export const useChat = (user, token) => {
    const socket = useSocket();

    const [conversaciones, setConversaciones] = useState([]);
    const [conversacionActiva, setConversacionActiva] = useState(null);
    const [mensajes, setMensajes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [typingUsers, setTypingUsers] = useState([]);

    // ==============================
    // Cargar conversaciones
    // ==============================
    const cargarConversaciones = async () => {
        if (!token) return;

        try {
        setLoading(true);
        const res = await conectar(`${urlBase}chat`, 'GET', {}, token);
        console.log('Conversaciones cargadas:', res);
        //console.log(res);
        if (res?.ok && Array.isArray(res.conversaciones)) {
            setConversaciones(res.conversaciones);
        } else {
            setConversaciones([]);
        }
        } catch (err) {
        console.error('Error cargando conversaciones:', err);
        setConversaciones([]);
        } finally {
        setLoading(false);
        }
    };

    // ==============================
    // Abrir conversación
    // ==============================
    const abrirConversacion = async (conversacion) => {
        if (!token || !conversacion) return;

        const idOtroUsuario =
            conversacion.usuario_menor === user.uid
            ? conversacion.usuario_mayor
            : conversacion.usuario_menor;

        try {
            setLoading(true);

            // Backend decide: crear o devolver
            const res = await conectar(
                `${urlBase}chat/conversacion/${idOtroUsuario}`,
                'POST',
                {},
                token
            );

            if (!res?.ok || !res.conversacion) {
                console.error('No se pudo obtener la conversación');
                return;
            }
            //console.log(res);
            const conv = res.conversacion;
            //console.log('Conversación abierta:', conv);
            // Buscar el nombre del otro usuario en las conversaciones cargadas
            const convConNombre = conversaciones.find(c => c.id_conversacion === conv.id_conversacion);

            setConversacionActiva({
                ...conv,
                nombre_completo: convConNombre?.nombre_completo || "Usuario"
            });

            const resMensajes = await conectar(
                `${urlBase}chat/${conv.id_conversacion}`,
                'GET',
                {},
                token
            );

            setMensajes(
                resMensajes?.ok && Array.isArray(resMensajes.mensajes)
                    ? resMensajes.mensajes
                    : []
            );

            socket?.emit('join_conversation', conv.id_conversacion);

        } catch (err) {
            console.error('Error abriendo conversación:', err);
            setMensajes([]);
        } finally {
            setLoading(false);
        }
    };



    // ==============================
    // Enviar mensaje
    // ==============================
    const enviarMensaje = (contenido) => {
        if (!contenido?.trim() || !conversacionActiva) return;
            console.log(user);
        const idReceptor =
            conversacionActiva.usuario_menor === user.uid
            ? conversacionActiva.usuario_mayor
            : conversacionActiva.usuario_menor;

        socket?.emit('send_message', {
            idConversacion: conversacionActiva.id_conversacion,
            contenido,
            idReceptor
        });
    };


    // ==============================
    // Escuchar mensajes en tiempo real
    // ==============================
    useEffect(() => {
        if (!socket) return;

        const handleNewMessage = (mensaje) => {
            //console.log('Nuevo mensaje recibido:', mensaje);
        if (conversacionActiva?.id_conversacion === mensaje.id_conversacion) {
            setMensajes((prev) => [...prev, mensaje]);
        }
        };
        const handleMessagesRead = ({ idConversacion, readerId }) => {
            if (conversacionActiva?.id_conversacion === idConversacion) {
            setMensajes((prev) =>
                prev.map((m) =>
                // Solo marcamos como leido los mensajes propios
                m.id_emisor === user.uid ? { ...m, leido: true } : m
                )
            );
            }
        };
        const handleTyping = ({ userId }) => {
            if (userId !== user.uid) {
                setTypingUsers((prev) => Array.from(new Set([...prev, userId])));
            }
        };

        const handleStopTyping = ({ userId }) => {
            setTypingUsers((prev) => prev.filter((id) => id !== userId));
        };
        console.log(user.uid);
        socket.on('new_message', handleNewMessage);
        socket.on('messages_read', handleMessagesRead);
        socket.on('typing', handleTyping);
        socket.on('stop_typing', handleStopTyping);

        return () => {
            socket.off('new_message', handleNewMessage);
            socket.on('messages_read', handleMessagesRead);
            socket.off('typing', handleTyping);
            socket.off('stop_typing', handleStopTyping);
        };
    }, [socket, conversacionActiva?.id_conversacion, user.uid]);
    const startTyping = () => {
        if (conversacionActiva) {
            socket.emit('typing', { idConversacion: conversacionActiva.id_conversacion });
        }
    };

    const stopTyping = () => {
        if (conversacionActiva) {
            socket.emit('stop_typing', { idConversacion: conversacionActiva.id_conversacion });
        }
    };

    const cerrarConversacion = () => {
        if (conversacionActiva?.id_conversacion) {
            socket?.emit('leave_conversation', conversacionActiva.id_conversacion);
        }
        setConversacionActiva(null);
        setMensajes([]);
        setTypingUsers([]);
    };

  return {
    conversaciones,
    mensajes,
    conversacionActiva,
    loading,
    cargarConversaciones,
    abrirConversacion,
    enviarMensaje,
    setConversacionActiva,
    startTyping,
    stopTyping,
    typingUsers,
    cerrarConversacion
  };
};

