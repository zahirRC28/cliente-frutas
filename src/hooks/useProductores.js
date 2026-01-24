import { useState, useEffect } from 'react';
import conectar from '../helpers/fetch';

const urlBase = import.meta.env.VITE_BACKEND_URL;

export const useProductores = (rol, uid, token) => {
  const [productores, setProductores] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const obtenerProductores = async () => {
      // Roles permitidos para ver la lista: Administrador, Manager, Asesor
      const rolesValidos = ['Administrador', 'Manager', 'Asesor'];
      if (!rolesValidos.includes(rol) || !token) {
        setProductores([]);
        return;
      }

      try {
        setLoading(true);
        const res = await conectar(`${urlBase}user/productores`, 'GET', {}, token);
        if (res?.ok && Array.isArray(res.productores)) {
          setProductores(res.productores);
        } else {
          setProductores([]);
        }
      } catch (err) {
        console.error('Error obteniendo productores:', err);
        setProductores([]);
      } finally {
        setLoading(false);
      }
    };

    obtenerProductores();
  }, [rol, uid, token]);

  return { productores, loading };
};