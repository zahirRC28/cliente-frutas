import './chatbotAgricola.css';
import React, { useState, useContext, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { UserContext } from '../contexts/UserContext';
import conectar from '../helpers/fetch';
import { Bot, ChevronDown } from 'lucide-react';

export const ChatbotAgricola = () => {
    const { token } = useContext(UserContext);
    
    // Estado para abrir/cerrar
    const [isOpen, setIsOpen] = useState(false);

    const [mensaje, setMensaje] = useState('');
    const [historial, setHistorial] = useState([]);
    const [cargando, setCargando] = useState(false);
    const scrollRef = useRef(null);

    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [historial]);

    const enviarConsulta = async (e) => {
        e.preventDefault();
        if (!mensaje.trim()) return;

        const textoUsuario = mensaje;
        setMensaje('');
        setHistorial(prev => [...prev, { role: 'user', text: textoUsuario }]);
        setCargando(true);

        try {
            const urlBack = 'http://localhost:3005/api/v1/apis/chatbot';
            const data = await conectar(urlBack, 'POST', { message: textoUsuario }, token);

            if (data && data.ok) {
                const respuestaFinal = data.respuesta || "El asistente procesó la consulta pero la respuesta llegó vacía.";
                setHistorial(prev => [...prev, { role: 'ai', text: respuestaFinal }]);
            } else {
                const mensajeError = data.msg || "El servicio no está disponible en este momento.";
                setHistorial(prev => [...prev, { role: 'ai', text: `${mensajeError}` }]);
            }
        } catch (error) {
            console.error("Fallo en la comunicación:", error);
            setHistorial(prev => [...prev, { role: 'ai', text: " Error de conexión." }]);
        } finally {
            setCargando(false);
        }
    };

    return (
        <>
            {/* BOTÓN FLOTANTE (Disparador) */}
            <button 
                className={`chatbot-launcher ${isOpen ? 'active' : ''}`} 
                onClick={() => setIsOpen(!isOpen)}
            >
                {isOpen ? <ChevronDown size={28} /> : <Bot size={28} />}
            </button>

            {/* CONTENEDOR DEL CHAT (Solo se ve si isOpen es true) */}
            {isOpen && (
                <div className="chatbot-container animate-slide-in">
                    <div className="chatbot-header">
                        <span>Tu Asistente Agrícola</span>
                        <button className="close-btn" onClick={() => setIsOpen(false)}>—</button>
                    </div>

                    <div className="chatbot-messages">
                        {historial.length === 0 && (
                            <p className="chat-welcome">¡Hola! Soy tu asistente agrícola. ¿En qué puedo ayudarte hoy?</p>
                        )}
                        {historial.map((m, i) => (
                            <div key={i} className={`message-row ${m.role === 'user' ? 'user-right' : 'ai-left'}`}>
                                <div className={`message-bubble ${m.role}`}>
                                    {m.role === 'ai' ? <ReactMarkdown>{m.text}</ReactMarkdown> : m.text}
                                </div>
                            </div>
                        ))}
                        {cargando && <div className="chatbot-loading">Escribiendo...</div>}
                        <div ref={scrollRef} />
                    </div>

                    <form onSubmit={enviarConsulta} className="chatbot-form">
                        <input
                            className="chatbot-input"
                            value={mensaje}
                            onChange={(e) => setMensaje(e.target.value)}
                            placeholder="Escribe tu consulta..."
                        />
                        <button type="submit" className="chatbot-button">Enviar</button>
                    </form>
                </div>
            )}
        </>
    );
};