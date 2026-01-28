import conectar from "../helpers/fetch";
import { userAuth } from "./userAuth";
const urlBase = import.meta.env.VITE_BACKEND_URL;

export const usepdfs = () => {
    const { token } = userAuth();

  const descargarPdf = async (endpoint, nombreArchivo) => {
    const blob = await conectar(
      `${urlBase}${endpoint}`,
      'GET',
      {},
      token,
      'blob' // 👈 CLAVE
    );

    if (!blob || blob.error) return;

    const url = window.URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = nombreArchivo;
    document.body.appendChild(a);
    a.click();

    a.remove();
    window.URL.revokeObjectURL(url);
  };

  return {
    generarPdfCultivo: (id) =>
      descargarPdf(`pdf/cultivo/${id}`, `cultivo_${id}.pdf`),

    generarPdfIncidencia: (id) =>
      descargarPdf(`pdf/incidencia/${id}`, `incidencia_${id}.pdf`),

    generarPdfReporte: (id) =>
      descargarPdf(`pdf/reporte/${id}`, `reporte_${id}.pdf`)
  };
}
