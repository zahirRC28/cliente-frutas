export const ConversacionesList = ({ conversaciones, onSelect, conversacionActiva }) => {
  return (
    <div className="conversaciones-list">
      {conversaciones.map((c, index) => (
        <div
          key={index}
          id={c.id_conversacion}
          className={`conversacion-item ${conversacionActiva?.id_conversacion === c.id_conversacion ? 'activo' : ''}`}
          onClick={() => onSelect(c)}
        >
          <strong>{c.nombre_completo}</strong>
          <p>{c.rol_otro_usuario}</p>
        </div>
      ))}
    </div>
  )
}
