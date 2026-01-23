export const tiempoRelativo = (fechaISO) => {
    const ahora = new Date();
    const fecha = new Date(fechaISO);
    const diferencia = Math.floor((ahora - fecha) / 1000);

    if (diferencia < 60) return "Hace unos segundos";

    const minutos = Math.floor(diferencia / 60);
    if (minutos < 60) return `Hace ${minutos} minuto${minutos !== 1 ? "s" : ""}`;

    const horas = Math.floor(minutos / 60);
    if (horas < 24) return `Hace ${horas} hora${horas !== 1 ? "s" : ""}`;

    const dias = Math.floor(horas / 24);
    return `Hace ${dias} día${dias !== 1 ? "s" : ""}`;
};