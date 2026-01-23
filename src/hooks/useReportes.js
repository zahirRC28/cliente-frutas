import { useState } from 'react';
import conectar from '../helpers/fetch'; 
import { userAuth } from './userAuth';

const urlBase = (import.meta.env.VITE_BACKEND_URL || '').replace(/\/+$/, '') + '/';

export const useReportes = () => {
  const [cargando, setCargando] = useState(false);
  const [reportes, setReportes] = useState([]);
  const { token } = userAuth();

  const loadReportes = async () => {
    try {
      setCargando(true);
      const res = await conectar(`${urlBase}reporte/`, 'GET', {}, token);
      // backend devuelve { ok: true, count, reports }
      const reports = res.reports || [];
      setReportes(reports);
      return reports;
    } catch (err) {
      console.error('loadReportes error', err);
      return [];
    } finally {
      setCargando(false);
    }
  };

  const crearReporte = async (data) => {
    try {
      const res = await conectar(`${urlBase}reporte/crear`,'POST',data,token);
      console.log(res);
      //return res;
    } catch (err) {
      throw err;
    }
  };

  const editarReporte = async (id, data) => {
    try {
      const res = await conectar(`${urlBase}reporte/editar/${id}`, 'PUT', data, token);
      return res;
    } catch (err) {
      throw err;
    }
  };

  const eliminarReporte = async (id) => {
    try {
      // DELETE con body puede ser problemático según tu helper; nosotros no enviamos body.
      const res = await conectar(`${urlBase}reporte/eliminar/${id}`, 'DELETE', {}, token);
      return res;
    } catch (err) {
      throw err;
    }
  };

  return {
    cargando,
    reportes,
    loadReportes,
    crearReporte,
    editarReporte,
    eliminarReporte
  };
};