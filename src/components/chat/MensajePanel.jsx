import { useEffect, useRef } from 'react';

export const MensajesPanel = ({ mensajes, user }) => {
  const panelRef = useRef(null);

  const formatHora = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  useEffect(() => {
    if (panelRef.current) {
      panelRef.current.scrollTop = panelRef.current.scrollHeight;
    }
  }, [mensajes]);

  return (
    <div className="mensajes-panel" ref={panelRef}>
      {mensajes.map((m) => {
        const esPropio = m.id_emisor === user.uid;

        return (
          <div
            key={m.id_mensaje}
            className={`msg ${esPropio ? 'propio' : 'otro'}`}
          >
            <div>{m.contenido}</div>

            <div className="msg-meta">
              <span className="msg-hora">{formatHora(m.enviado)}</span>

              {esPropio && (
                <span className={`msg-check ${m.leido ? 'leido' : ''}`}>
                  {m.leido ? '✔✔' : '✔'}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};


