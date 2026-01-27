import { useEffect } from 'react';
import { MessageCircle } from 'lucide-react';
import { useChat } from '../hooks/useChat';
import { userAuth } from '../hooks/userAuth';
import { ConversacionesList } from '../components/chat/ConversacionesList';
import { MensajesPanel } from '../components/chat/MensajePanel';
import { InputMensaje } from '../components/chat/InputMensaje';
import "../styles/Chat.css";

export const MensajesPage = () => {
    const { user, token } = userAuth();

    const {
        conversaciones,
        mensajes,
        conversacionActiva,
        cargarConversaciones,
        abrirConversacion,
        enviarMensaje,
        startTyping,
        stopTyping,
        typingUsers
    } = useChat(user, token);
    //console.log(conversacionActiva);
    useEffect(() => {
        cargarConversaciones();
    }, [token]);
  return (
    <div className="chat-layout">
      {/* Lista de conversaciones */}
      <div className="chat-sidebar">
        <h3 style={{display:'flex',alignItems:'center',gap:8}}><MessageCircle size={20} /> Conversaciones</h3>
        <ConversacionesList
          conversaciones={conversaciones}
          onSelect={abrirConversacion}
          conversacionActiva={conversacionActiva}
        />
      </div>

      {/* Panel de mensajes */}
      <div className="chat-main">
        {conversacionActiva ? (
          <>
            <div className="chat-header">
                <h4>{conversacionActiva.nombre_completo}</h4>
                    {typingUsers.length > 0 && (
                    <small>
                        {typingUsers.map((id) => 
                        id === conversacionActiva.usuario_menor || id === conversacionActiva.usuario_mayor
                        ? "Está escribiendo..."
                        : ""
                        ).filter(Boolean).join(', ')}
                    </small>
                    )}
            </div>
            <MensajesPanel mensajes={mensajes} user={user} />
            <InputMensaje onSend={enviarMensaje} startTyping={startTyping} stopTyping={stopTyping} />
          </>
        ) : (
          <div className="chat-empty">
            Selecciona una conversación para comenzar a chatear
          </div>
        )}
      </div>
    </div>
  )
}
