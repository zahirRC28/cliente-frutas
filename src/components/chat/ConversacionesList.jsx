export const ConversacionesList = ({
  conversaciones,
  onSelect,
  conversacionActiva,
}) => {
  const conversacionesFiltradas = conversaciones.filter(
    (c) => c.rol_otro_usuario !== "Administrador",
  );

  return (
    <div className="conversaciones-list">
      {conversacionesFiltradas.map((c) => (
        <div
          key={c.id_conversacion}
          className={`conversacion-item ${
            conversacionActiva?.id_conversacion === c.id_conversacion
              ? "activo"
              : ""
          }`}
          onClick={() => onSelect(c)}
        >
          <strong>{c.nombre_completo}</strong>
          <p>{c.rol_otro_usuario}</p>
        </div>
      ))}
    </div>
  );
};
