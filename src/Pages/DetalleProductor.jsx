import './detalleProductor.css'
import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { UserContext } from '../contexts/UserContext';
import fetch from '../helpers/fetch';
import { ArrowLeft, Sprout, FileText, AlertTriangle, User } from 'lucide-react';

export const DetalleProductor = () => {
    const { id } = useParams();
    const { token } = useContext(UserContext);
    const navigate = useNavigate();
    const [datos, setDatos] = useState(null);

    useEffect(() => {
        const cargarTodo = async () => {
            if (!id || !token) return;
            const url = `${import.meta.env.VITE_BACKEND_URL}`;

            try {
                const [resU, resC, resR, resI] = await Promise.all([
                    fetch(`${url}user/usuario/${id}`, 'GET', {}, token),
                    fetch(`${url}cultivo/productor/${id}`, 'GET', {}, token),
                    fetch(`${url}reporte/productor/${id}`, 'GET', {}, token),
                    fetch(`${url}incidencia/productor/${id}`, 'GET', {}, token)
                ]);

                setDatos({
                    perfil: resU.usuario,
                    cultivos: resC.cultivos || [],
                    reportes: resR.reportes || [],
                    incidencias: resI || []
                });
            } catch (e) {
                console.error("Error cargando detalles:", e);
            }
        };
        cargarTodo();
    }, [id, token]);

    if (!datos?.perfil) return null;

    return (
        <div className="reportes-page">
            <header className="detalle-header">
                <div className="titulo-perfil">
                    <h1> <User className="icon-main" size={32} /> Información del productor/a: {datos.perfil.nombre_completo}</h1>
                </div>
                <button className="btn btn-cancelar" onClick={() => navigate(-1)}>
                    <ArrowLeft size={18} /> <span>Volver</span>
                </button>
            </header>

            {/* DATOS PERSONALES */}
            <div className="reporte-card detalle-card">
                <div className="seccion-header-bloque">
                    <User size={20} className="icon-seccion" />
                    <h3>Datos personales</h3>
                </div>
                <div className="info-perfil">
                    <div className="dato-linea">
                        <strong>Nombre:</strong> <span>{datos.perfil.nombre_completo}</span>
                    </div>
                    <div className="dato-linea">
                        <strong>Email:</strong> <span>{datos.perfil.correo}</span>
                    </div>
                </div>
            </div>

            <div className="secciones-verticales">
                {/* CULTIVOS */}
                <Seccion
                    titulo="Cultivos"
                    Icono={Sprout}
                    items={datos.cultivos}
                    vacio="No se han encontrado cultivos registrados."
                    render={(c, index) => (
                        <div key={c.id_cultivo} className="item-detalle-lista">
                            <span className="nombre-destacado">{c.nombre}</span>
                            <p><strong>Tipo de cultivo:</strong> {c.tipo_cultivo}</p>
                            <p><strong>Región:</strong> {c.region}</p>
                            <p><strong>id:</strong> {c.id_cultivo}</p>
                            {/* Línea divisoria */}
                            {index < datos.cultivos.length - 1 && <hr className="separador-item" />}
                        </div>
                    )}
                />

                {/* REPORTES */}
                <Seccion
                    titulo="Reportes enviados"
                    Icono={FileText}
                    items={datos.reportes}
                    vacio="No hay reportes enviados actualmente."
                    render={(r, index) => (
                        <div key={r.id_reporte} className="item-detalle-lista">
                            <span className="nombre-destacado">{r.titulo}</span>
                            <p><strong>Fecha:</strong> {new Date(r.fecha_reporte).toLocaleDateString()}</p>
                            <p><strong>Descripción:</strong> {r.descripcion}</p>
                            {index < datos.reportes.length - 1 && <hr className="separador-item" />}
                        </div>
                    )}
                />

                {/* INCIDENCIAS */}
                <Seccion
                    titulo="Incidencias enviadas"
                    Icono={AlertTriangle}
                    items={datos.incidencias?.data || []}
                    vacio="No hay incidencias registradas."
                    render={(i, index) => (
                        <div key={i.id_incidencia} className="item-detalle-lista">
                            <span className="nombre-destacado">{i.titulo} (id: {i.id_incidencia})</span>
                            <p> {new Date(i.fecha_creacion).toLocaleDateString()}</p>
                            <p><strong>Descripción:</strong> {i.descripcion}</p>
                            <p><strong>Tipo:</strong> {i.tipo}</p>
                            <p><strong>Estado:</strong> {i.estado}</p>
                            {index < datos.incidencias.data.length - 1 && <hr className="separador-item" />}
                        </div>
                    )}
                />
            </div>
        </div>
    );
};

const Seccion = ({ titulo, Icono, items, render, vacio }) => (
    <div className="reporte-card detalle-card">
        <div className="seccion-header-bloque">
            <Icono size={20} className="icon-seccion" />
            <h3>{titulo}</h3>
        </div>
        <div className="seccion-contenido-bloque">
            {items && items.length > 0
                ? items.map((item, index) => render(item, index))
                : <p className="empty">{vacio}</p>}
        </div>
    </div>
);