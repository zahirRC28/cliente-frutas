import "./incidencias.css";
import React, { useEffect, useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import Swal from 'sweetalert2';
import { userAuth } from '../hooks/userAuth';
import conectar from '../helpers/fetch';
import { cultivos } from '../hooks/cultivos';
import { usepdfs } from "../hooks/usepdfs";

const urlBase = (import.meta.env.VITE_BACKEND_URL || '').replace(/\/+$/, '') + '/';

export const Incidencias = () => {
  const { token, user } = userAuth();
  const { cultivosProductor } = cultivos();

  const [incidencias, setIncidencias] = useState([]);
  const [dataCultivos, setDataCultivos] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [vista, setVista] = useState('lista');
  const [filtroProductor, setFiltroProductor] = useState('');
  const { generarPdfIncidencia } = usepdfs();

  const [form, setForm] = useState({
    id: null, titulo: '', descripcion: '', tipo: '', id_cultivo: '',
    prioridad: 'media', estado: 'abierta', id_productor: null, nombre_productor: ''
  });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setCargando(true);
    try {
      const cults = await cultivosProductor();
      setDataCultivos(Array.isArray(cults) ? cults : []);
      const endpoint = user.rol === 'Productor' ? `incidencia/productor/${user.uid}` : `incidencia/listado`;
      const res = await conectar(`${urlBase}${endpoint}`, 'GET', {}, token);
      if (res.ok) setIncidencias(res.data);
    } catch (err) { console.error(err); } finally { setCargando(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    //1-  Lógica para ASESOR (Solo PATCH estado)
    if (user.rol === 'Asesor') {
      try {
        const res = await conectar(
          `${urlBase}incidencia/estado/${form.id}`,
          'PATCH',
          { estado: form.estado }, // Solo mandamos el estado
          token
        );

        if (res.ok) {
          Swal.fire('Éxito', "Estado actualizado", 'success');
          setVista('lista');
          fetchData();
        }
      } catch (err) {
        Swal.fire('Error', 'No se pudo actualizar', 'error');
      }
      return;
    }

    // 2- Lógica para MANAGER / ADMIN / PRODUCTOR (POST)
    const isEditing = !!form.id;

    // Bloqueo de seguridad: El Productor NO tiene ruta PUT en back
    if (isEditing && user.rol === 'Productor') {
      return Swal.fire('Info', 'No tienes permisos para modificar incidencias enviadas', 'info');
    }

    const url = isEditing ? `${urlBase}incidencia/editar/${form.id}` : `${urlBase}incidencia/crear`;
    const metodo = isEditing ? 'PUT' : 'POST';

    const payload = {
      titulo: form.titulo,
      descripcion: form.descripcion,
      tipo: form.tipo,
      id_cultivo: parseInt(form.id_cultivo),
      prioridad: form.prioridad,
      estado: form.estado,
      id_productor: form.id_productor || user.uid
    };

    try {
      const res = await conectar(url, metodo, payload, token);
      if (res.ok) {
        Swal.fire('Éxito', isEditing ? "Incidencia actualizada" : "Incidencia creada", 'success');
        setVista('lista');
        fetchData();
      }
    } catch (err) { Swal.fire('Error', 'Error en el servidor', 'error'); }
  };

  const prepararEdicion = (inc) => {
    setForm({
      id: inc.id_incidencia, titulo: inc.titulo, descripcion: inc.descripcion,
      tipo: inc.tipo, id_cultivo: inc.id_cultivo, prioridad: inc.prioridad,
      estado: inc.estado, id_productor: inc.id_productor,
      nombre_productor: inc.nombre_productor || 'N/A'
    });
    setVista('formulario');
  };

  const incidenciasFiltradas = incidencias.filter(inc =>
    (inc.nombre_productor || '').toLowerCase().includes(filtroProductor.toLowerCase())
  );

  // Reglas de habilitación de campos
  const readonlyParaTodos = (user.rol === 'Asesor' || (user.rol === 'Productor' && !!form.id));
  const puedeCambiarPrioridad = (user.rol === 'Manager' || user.rol === 'Administrador');
  const puedeCambiarEstado = (user.rol !== 'Productor'); // Manager, Admin, Asesor

  const handleEliminar = async (id) => {
    const resultado = await Swal.fire({
      title: '¿Estás seguro?',
      text: "Esta acción no se puede deshacer",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (resultado.isConfirmed) {
      try {
        // endpoint de back
        const res = await conectar(`${urlBase}incidencia/eliminar/${id}`, 'DELETE', {}, token);

        if (res.ok) {
          Swal.fire('Eliminado', 'La incidencia ha sido borrada.', 'success');
          fetchData(); // Recargamos la lista
        } else {
          Swal.fire('Error', res.msg || 'No se pudo eliminar', 'error');
        }
      } catch (err) {
        console.error(err);
        Swal.fire('Error', 'Error de conexión con el servidor', 'error');
      }
    }
  };

  return (
    <div className="incidencias-page">
      <header className="page-header mb20">
        <h1 style={{display:'flex',alignItems:'center',gap:8}}><AlertTriangle size={24} /> Gestión de Incidencias</h1>
      </header>

      <div className="tab-container">
        <button className={`tab ${vista === 'lista' ? 'active' : ''}`} onClick={() => setVista('lista')}>
          Lista de Incidencias
        </button>
        {user.rol === 'Productor' && (
          <button className={`tab ${vista === 'formulario' && !form.id ? 'active' : ''}`}
            onClick={() => { setForm({ id: null, titulo: '', descripcion: '', tipo: '', id_cultivo: '', prioridad: 'media', estado: 'abierta', id_productor: null }); setVista('formulario'); }}>
            + Crear Incidencia
          </button>
        )}
      </div>

      {vista === 'formulario' ? (
        <section className="form-section">
          <form onSubmit={handleSubmit} className="grid-form">
            {form.id && (
              <div className="info-metadata full-width mb20">
                <p><strong>Productor:</strong> {form.nombre_productor} (ID: {form.id_productor})</p>
                <p><strong>ID Cultivo:</strong> {form.id_cultivo}</p>
              </div>
            )}

            <div className="full-width">
              <input placeholder="Título" disabled={readonlyParaTodos} value={form.titulo} onChange={e => setForm({ ...form, titulo: e.target.value })} required />
            </div>

            <div>
              <input placeholder="Tipo" disabled={readonlyParaTodos} value={form.tipo} onChange={e => setForm({ ...form, tipo: e.target.value })} required />
            </div>

            <div>
              <select disabled={!!form.id || user.rol === 'Asesor'} value={form.id_cultivo} onChange={e => setForm({ ...form, id_cultivo: e.target.value })} required>
                <option value="">Selecciona un cultivo</option>
                {dataCultivos.map(c => <option key={c.id_cultivo} value={c.id_cultivo}>{c.nombre || c.id_cultivo}</option>)}
              </select>
            </div>

            <div className="full-width">
              <textarea placeholder="Descripción" disabled={readonlyParaTodos} value={form.descripcion} onChange={e => setForm({ ...form, descripcion: e.target.value })} required />
            </div>

            <div className="control-group">
              <label>Prioridad</label>
              <select disabled={!puedeCambiarPrioridad} value={form.prioridad} onChange={e => setForm({ ...form, prioridad: e.target.value })}>
                <option value="baja">Baja</option><option value="media">Media</option><option value="alta">Alta</option>
              </select>
            </div>

            <div className="control-group">
              <label>Estado</label>
              <select disabled={!puedeCambiarEstado} value={form.estado} onChange={e => setForm({ ...form, estado: e.target.value })}>
                <option value="abierta">Abierta</option><option value="en proceso">En proceso</option><option value="cerrada">Cerrada</option>
              </select>
            </div>

            <div className="form-actions full-width">
              {/* No mostrar el botón guardar si el Productor solo está viendo una incidencia existente */}
              {!(user.rol === 'Productor' && form.id) && (
                <button type="submit" className="btn-primary">Guardar Cambios</button>
              )}
              <button type="button" className="btn-secondary" onClick={() => setVista('lista')}>
                {(user.rol === 'Productor' && form.id) ? 'Volver' : 'Cancelar'}
              </button>
            </div>
          </form>
        </section>
      ) : (
        <>
          {user.rol !== 'Productor' && (
            <div className="filter-container">
              <input
                type="text"
                placeholder="Buscar por productor..."
                value={filtroProductor}
                onChange={(e) => setFiltroProductor(e.target.value)}
                className="search-input"
              />
            </div>
          )}

          <div className="incidencias-list">
            {incidenciasFiltradas.map(inc => (
              <article key={inc.id_incidencia} className={`incidencia-card priority-${inc.prioridad} ${inc.estado === 'cerrada' ? 'is-closed' : ''}`}>
                <div className="card-main">
                  <h4>{inc.titulo} {inc.estado === 'cerrada' && <span className="closed-tag">(CERRADA)</span>}</h4>
                  <p>{inc.descripcion}</p>
                  <div className="info-metadata mb20">
                    <p><strong>ID Cultivo:</strong> {inc.id_cultivo}</p>
                    <p><strong>ID Productor:</strong> {inc.id_productor}</p>
                    <p><strong>Productor:</strong> {inc.nombre_productor || 'N/A'}</p>
                  </div>
                  <div className="card-footer mb20">
                    <p className="mb10"><span className={`badge ${inc.prioridad}`}>Prioridad: {inc.prioridad}</span></p>
                    <p><span>Estado: <strong>{inc.estado.toUpperCase()}</strong></span></p>
                  </div>


                  <div className="card-actions">
                    { (user.rol !== 'Administrador')&& ( 
                      <button className="btn-primary" onClick={() => prepararEdicion(inc)}>
                        {user.rol === 'Productor' ? 'Ver Detalles' : 'Gestionar'}
                      </button>
                    )}
                    {/* mostrar eliminar solo a Manager y admin*/}
                    <button
                      className="btn-tres"
                      onClick={() => generarPdfIncidencia(inc.id_incidencia)}
                    >
                      Descargar PDF
                    </button>
                    {(user.rol === 'Manager') && (
                      <button
                        className="btn-delete"
                        onClick={() => handleEliminar(inc.id_incidencia)}
                      >
                        Eliminar
                      </button>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </>
      )}
    </div>
  );
};