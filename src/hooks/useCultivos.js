// src/hooks/useCultivos.js
import { useState, useEffect } from "react";
import { toast } from 'react-toastify';
import conectar from "../helpers/fetch";

const urlBase = import.meta.env.VITE_BACKEND_URL;

export const useCultivos = (usuarioAFiltrar, token) => {
  const [cultivos, setCultivos] = useState([]);
  const [loading, setLoading] = useState(false);

  // Cargar cultivos cuando cambia el usuario seleccionado
  useEffect(() => {
    const cargarCultivos = async () => {
      if (!usuarioAFiltrar || !token) return;
      
      setLoading(true);
      try {
        const data = await conectar(`${urlBase}cultivo/productor/${usuarioAFiltrar}`, 'GET', {}, token);
        if (data?.ok) {
          setCultivos(data.cultivos || []);
        } else {
          setCultivos([]);
        }
      } catch (error) {
        console.error("Error cargando cultivos:", error);
        toast.error("Error al cargar los cultivos");
        setCultivos([]);
      } finally {
        setLoading(false);
      }
    };

    cargarCultivos();
  }, [usuarioAFiltrar, token]);

  // Función para añadir un nuevo cultivo al estado local tras guardarlo
  const agregarCultivo = (nuevoCultivo) => {
    setCultivos([nuevoCultivo, ...cultivos]);
  };

  return { cultivos, loading, agregarCultivo };
};