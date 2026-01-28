import React, { useEffect, useState } from 'react';
import { FileText } from 'lucide-react';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';
import conectar from '../helpers/fetch';
import { userAuth } from '../hooks/userAuth';
import "./reportes.css";
import { useReportes } from '../hooks/useReportes';
import { cultivos } from '../hooks/cultivos';
import { usepdfs } from '../hooks/usepdfs';
//hoola
const urlBase = (import.meta.env.VITE_BACKEND_URL || '').replace(/\/+$/, '') + '/';

export const Reportes = () => {
  const { token, user, userPoRole } = userAuth();
  const { crearReporte, editarReporte, eliminarReporte } = useReportes();
  const { cultivosProductor } = cultivos();
  const [cargando, setCargando] = useState(false);
  const [reportes, setReportes] = useState([]);
  const [productores, setProductores] = useState([]);
  const [selectedProductor, setSelectedProductor] = useState('todos');
  const [filtroTitulo, setFiltroTitulo] = useState('');
  const [dataCultivos, setDataCultivos] = useState([]);
  const { generarPdfReporte } = usepdfs();
  

  // Solo para Productor: controla si se ve la lista o el formulario de crear
  const [vista, setVista] = useState('lista'); // 'lista' | 'crear' | 'editar'

  // Estados para edición. No cambian la lógica de envío: handleEditar usa ev.target.*
  const [editId, setEditId] = useState(null);
  const [editInitial, setEditInitial] = useState({ titulo: '', descripcion: '', id_cultivo: '' });

  const loadReportes = async () => {
    try {
      setCargando(true);
      const res = await conectar(`${urlBase}reporte/`, 'GET', {}, token);
      const cults = await cultivosProductor();
      setDataCultivos(Array.isArray(cults) ? cults : []);
      const reports = res?.reports || [];
      setReportes(reports);
    } catch (err) {
      console.error('Error cargando reportes:', err);
      setReportes([]);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No fue posible cargar reportes. Revisa la consola.'
      });
    } finally {
      setCargando(false);
    }
  };

  const loadProductores = async () => {
    try {
      const lista = await userPoRole('Productor');
      if (!Array.isArray(lista)) {
        setProductores([]);
        return;
      }
      if (user?.rol === 'Manager') {
        setProductores(lista.filter(p => Number(p.id_manager) === Number(user.uid)));
      } else {
        setProductores(lista);
      }
    } catch (err) {
      console.error('Error cargando productores:', err);
      setProductores([]);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No fue posible cargar productores. Revisa la consola.'
      });
    }
  };

  useEffect(() => {
    loadReportes();
    if (user?.rol !== 'Productor') {
      loadProductores();
    }
  }, []);

  const handleCrear = async (ev) => {
    ev.preventDefault();
    const tituloform = ev.target.titulo.value?.trim();
    const descripcionform = ev.target.descripcion.value?.trim();
    const idCultivoform = ev.target.idcultivo.value;

    if (!tituloform || !descripcionform || !idCultivoform) {
      Swal.fire({
        icon: 'error',
        title: 'Faltan datos',
        text: 'Rellena título, descripción y selecciona un cultivo'
      });
      return;
    }

    const data = {
      titulo: tituloform,
      descripcion: descripcionform,
      id_cultivo: idCultivoform
    };

    try {
      await crearReporte(data);
      setVista('lista');
      await loadReportes();
      Swal.fire({
        title: 'Creado',
        text: 'Reporte creado correctamente.',
        icon: 'success',
        timer: 1400,
        showConfirmButton: false,
        draggable: true
      });
    } catch (err) {
      console.error('Error creando reporte:', err);
      const msg = err?.data?.msg || err?.message || 'Error al crear reporte';
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: msg
      });
    }
  };

  const handleEditar = async (ev) => {
    ev.preventDefault();

    if (!editId) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se ha seleccionado el reporte a editar'
      });
      return;
    }

    const tituloform = ev.target.titulo.value?.trim();
    const descripcionform = ev.target.descripcion.value?.trim();
    const idCultivoform = ev.target.idcultivo.value;

    if (!tituloform || !descripcionform || !idCultivoform) {
      Swal.fire({
        icon: 'error',
        title: 'Faltan datos',
        text: 'Rellena título, descripción y selecciona un cultivo'
      });
      return;
    }

    const payload = {
      titulo: tituloform,
      descripcion: descripcionform,
      id_cultivo: idCultivoform
    };

    try {
      // pasar primero el id, luego el payload 
      await editarReporte(editId, payload);

      setVista('lista'); // volver a la lista por defecto
      setEditId(null);
      setEditInitial({ titulo: '', descripcion: '', id_cultivo: '' });
      await loadReportes();

      Swal.fire({
        title: 'Actualizado',
        text: 'Reporte actualizado correctamente.',
        icon: 'success',
        timer: 1400,
        showConfirmButton: false,
        draggable: true
      });
    } catch (err) {
      console.error('Error editando reporte:', err);
      const msg = err?.data?.msg || err?.message || 'Error al editar reporte';
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: msg
      });
    }
  };

  const handleEliminar = async (id_reporte) => {
    try {
      const result = await Swal.fire({
        title: '¿Seguro que quieres eliminar este reporte?',
        text: "No podrás deshacer esta acción.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar',
        focusCancel: true
      });

      if (!result.isConfirmed) return;

      if (typeof eliminarReporte === 'function') {
        try {
          const resHook = await eliminarReporte(id_reporte);
          // asumir que el hook devuelve { ok: true } o lanza error
          if (resHook && resHook.ok === true) {
            await loadReportes();
            Swal.fire({
              title: 'Eliminado',
              text: resHook.msg || 'Reporte eliminado correctamente.',
              icon: 'success',
              timer: 1400,
              showConfirmButton: false,
              draggable: true
            });
            return;
          }
          // si el hook devolvió estructura diferente, seguir con fallback
        } catch (errHook) {
          console.warn('eliminarReporte hook falló, fallback a conectar:', errHook);
        }
      }

      // Fallback: llamada directa a la API
      const res = await conectar(`${urlBase}reporte/eliminar/${id_reporte}`, 'DELETE', {}, token);
      if (res?.ok) {
        await loadReportes();
        Swal.fire({
          title: 'Eliminado',
          text: res.msg || 'Reporte eliminado correctamente.',
          icon: 'success',
          timer: 1400,
          showConfirmButton: false,
          draggable: true
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'No se pudo eliminar',
          text: res?.msg || JSON.stringify(res)
        });
      }
    } catch (err) {
      console.error('Error al eliminar reporte:', err);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err?.message || 'Error al eliminar reporte'
      });
    }
  };

  const filtrarReportes = () => {
    let lista = [...reportes];
    if (!lista) return [];

    if (user?.rol === 'Productor') {
      lista = lista.filter(r => Number(r.id_productor) === Number(user.uid));
    } else {
      if (selectedProductor !== 'todos') {
        lista = lista.filter(r => String(r.id_productor) === String(selectedProductor));
      }
    }
    if (filtroTitulo.trim()) {
      lista = lista.filter(r => (r.titulo || '').toLowerCase().includes(filtroTitulo.toLowerCase()));
    }
    return lista;
  };

  const listaFinal = filtrarReportes();

  // El tabbar ahora usará la misma estructura y clases que Incidencias

  const prepararEdicion = (r) => {
    setEditId(r.id_reporte);
    setEditInitial({
      titulo: r.titulo || '',
      descripcion: r.descripcion || '',
      id_cultivo: r.id_cultivo || r.id_cultivo || ''
    });
    setVista('editar');
  };

  return (
    <div className="reportes-page">
      <h1 style={{display:'flex',alignItems:'center',gap:8}}><FileText size={24} /> Reportes</h1>

      <div className="user-info">
        <strong>Usuario:</strong> {user?.nombre || '—'} ({user?.rol || '—'})
      </div>

      {/* Nuevo tabbar estilo incidencias */}
      {user?.rol === 'Productor' ? (
        <div className="tab-container">
          <button
            className={`tab${vista === 'lista' ? ' active' : ''}`}
            onClick={() => setVista('lista')}
          >
            Lista de Reportes
          </button>
          <button
            className={`tab${vista === 'crear' ? ' active' : ''}`}
            onClick={() => setVista('crear')}
          >
            + Nuevo Reporte
          </button>
        </div>
      ) : (
        <>
          <div className="tab-container" style={{ marginBottom: 12 }}>
            <div className="tab active" style={{ cursor: 'default' }}>Lista de Reportes</div>
          </div>
          <div className="filtros">
            {user?.rol !== 'Productor' && (
              <div className="filtro-productor">
                <label>Filtrar por productor</label>
                <select value={selectedProductor} onChange={e => setSelectedProductor(e.target.value)}>
                  <option value="todos">Todos</option>
                  {productores.map(p => (
                    <option key={p.id_usuario} value={p.id_usuario}>{p.nombre_completo}</option>
                  ))}
                </select>
              </div>
            )}

            <div className="filtro-titulo" style={{ marginTop: user?.rol !== 'Productor' ? 0 : undefined }}>
              <label>Buscar por título</label>
              <input value={filtroTitulo} onChange={e => setFiltroTitulo(e.target.value)} placeholder="Título..." />
            </div>
          </div>
        </>
      )}

      {/* Vista crear */}
      {user?.rol === 'Productor' && vista === 'crear' && (
        <section className="crear-section">
          <form onSubmit={handleCrear} className="form-crear">
            <div>
              <input name="titulo" placeholder="Título" />
            </div>
            <div>
              <textarea name="descripcion" placeholder="Descripción" />
            </div>
            <div>
                <select name="idcultivo" id="idcultivo" defaultValue="">
                <option value="" disabled>Selecciona un cultivo</option>
                {dataCultivos.map(c => (
                  <option key={c.id_cultivo || c.id} value={c.id_cultivo || c.id}>
                    {c.nombre || c.nombre_cultivo || c.titulo || `Cultivo ${c.id_cultivo || c.id}`}
                  </option>
                ))}
              </select>
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <button type="submit" className="btn btn-guardar">Crear</button>
              <button type="button" className="btn btn-cancelar" onClick={() => setVista('lista')}>Cancelar</button>
            </div>
          </form>
        </section>
      )}

      {user?.rol === 'Productor' && vista === 'editar' && (
        <section className="crear-section">
          <h3>Editar reporte</h3>
          <form onSubmit={handleEditar} className="form-crear">
            <div>
              <input name="titulo" defaultValue={editInitial.titulo} placeholder="Título" />
            </div>
            <div>
              <textarea name="descripcion" defaultValue={editInitial.descripcion} placeholder="Descripción" />
            </div>
            <div>
              <label htmlFor="idcultivo_edit">Cultivo</label>
              <select name="idcultivo" id="idcultivo_edit" defaultValue={editInitial.id_cultivo || ''}>
                <option value="" disabled>Selecciona un cultivo</option>
                {dataCultivos.map(c => (
                  <option key={c.id_cultivo || c.id} value={c.id_cultivo || c.id}>
                    {c.nombre || c.nombre_cultivo || c.titulo || `Cultivo ${c.id_cultivo || c.id}`}
                  </option>
                ))}
              </select>
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <button type="submit" className="btn btn-guardar">Guardar cambios</button>
              <button
                type="button"
                className="btn btn-cancelar"
                onClick={() => {
                  setVista('lista');
                  setEditId(null);
                  setEditInitial({ titulo: '', descripcion: '', id_cultivo: '' });
                }}
              >
                Cancelar
              </button>
            </div>
          </form>
        </section>
      )}

      {/* Vista lista */}
      {(user?.rol !== 'Productor' || vista === 'lista') && (
        <>
          <div>
            {cargando ? <p className="empty">Cargando...</p> : <p className="empty">Mostrando {listaFinal.length} reportes</p>}
            <div className="lista-reportes">
              {listaFinal.length === 0 && !cargando && <div className="empty">No hay reportes que coincidan.</div>}
              {listaFinal.map(r => (
                <article key={r.id_reporte} className="reporte-card" role="article" aria-labelledby={`titulo-${r.id_reporte}`}>
                  <div className="contenido">
                    <strong className='mb10' id={`titulo-${r.id_reporte}`}>{r.titulo}</strong>
                    <div className="meta">
                      <span className="badge-productor mb10">{r.nombre_productor || r.id_productor}</span>
                      <span>{r.nombre_cultivo || '—'}</span>
                      <span>{r.fecha_reporte ? new Date(r.fecha_reporte).toLocaleString() : ''}</span>
                    </div>
                    <p>{r.descripcion}</p>
                  </div>

                  <div className="acciones">
                    {(user?.rol === 'Productor' && Number(user.uid) === Number(r.id_productor)) && (
                      <>
                        <button className="btn btn-guardar" onClick={() => prepararEdicion(r)}>Editar</button>
                        <button className="btn btn-borrar" onClick={() => handleEliminar(r.id_reporte)}>Borrar</button>
                      </>
                    )}
                    {(user?.rol === 'Asesor' || user?.rol === 'Productor'|| user?.rol === 'Manager'|| user?.rol === 'Administrador')&& (
                      <>
                        <button className="btn btn-info"onClick={()=> generarPdfReporte(r.id_reporte)} >Descargar PDF</button>
                      </>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </>
      )}
      
    </div>
  );
};