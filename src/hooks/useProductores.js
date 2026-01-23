// src/hooks/useProductores.js
import { useState, useEffect } from "react";
import conectar from "../helpers/fetch";

const urlBase = import.meta.env.VITE_BACKEND_URL;

export const useProductores = (rol, uid, token) => {
  const [productores, setProductores] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const obtenerProductores = async () => {
      // 1. Verificamos si el usuario tiene permiso para ver esta lista
      const rolActual = rol?.toLowerCase().trim() || '';
      const rolesValidos = ['manager', 'administrador', 'admin', 'asesor'];
      
      if (!rolesValidos.includes(rolActual) || !token) return;

      setLoading(true);
      try {
        // Pedimos al backend todos los usuarios con el rol "Productor"
        const res = await conectar(`${urlBase}user/porUserRol`, 'POST', { nombre: 'Productor' }, token);

        if (res?.ok && res.usuarios) {
          const esAdmin = ['administrador', 'admin'].includes(rolActual);

          if (esAdmin) {
            // El Admin ve TODOS los productores
            setProductores(res.usuarios);
          } else {
            // El Manager solo ve a los productores que tengan su ID como id_manager
            const vinculados = res.usuarios.filter(p => Number(p.id_manager) === Number(uid));
            setProductores(vinculados);
          }
        }
      } catch (error) {
        console.error("Error al obtener equipo de productores:", error);
        setProductores([]);
      } finally {
        setLoading(false);
      }
    };

    obtenerProductores();
  }, [rol, uid, token]);

  return { productores, loading };
};