import "../../styles/Card.css";
export const Card = ({
    icono,
    titulo,
    subtitulo,
    onClick,
    variant = "default", // default | counter
}) => {
    return (
        <article className={`card-dashboard ${variant}`} onClick={onClick}>
            <div className="card-left">
                <div className="card-icon">{icono}</div>
                <div className="card-content">
                    <h3>{titulo}</h3>
                    {variant === "default" && <p>{subtitulo}</p>}
                </div>
            </div>
            {variant === "counter" && (
                <div className="card-counter">{subtitulo}</div>
            )}
        </article>
    );
};