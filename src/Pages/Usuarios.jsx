import React, { useEffect, useMemo, useState } from 'react';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';
import { userAuth } from '../hooks/userAuth';
import './reportes.css';

const UsuariosPage = () => {
  const { user, todosUser, crearUsuario, actualizarUser, eliminarUser, todosRoles } = userAuth();

  const [usuarios, setUsuarios] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);

  // Buscador y filtro por rol
  const [query, setQuery] = useState('');
  const [filterRole, setFilterRole] = useState('all');

  // Vista: 'lista' | 'crear' | 'editar' (como en Reportes)
  const [vista, setVista] = useState('lista');


  const [formEditar, setFormEditar] = useState({ id: null, nombre: '', correo: '', contrasenia: '', rol: '', id_manager: '' });

  const load = async () => {
    try {
      setLoading(true);
      const list = await todosUser();
      setUsuarios(Array.isArray(list) ? list : []);
      const r = await todosRoles();
      setRoles(Array.isArray(r) ? r : []);
    } catch (err) {
      console.error('Error cargando usuarios/roles:', err);
      setUsuarios([]);
      setRoles([]);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No fue posible cargar usuarios y roles. Revisa la consola.'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const listaFiltrada = useMemo(() => {
    let out = usuarios || [];
    if (filterRole !== 'all') {
      out = out.filter(u => (u.rol_nombre || '').toLowerCase() === (filterRole || '').toLowerCase());
    }
    if (query.trim()) {
      const q = query.toLowerCase();
      out = out.filter(u => (u.nombre_completo || '').toLowerCase().includes(q) || (u.correo || '').toLowerCase().includes(q));
    }
    return out;
  }, [usuarios, filterRole, query]);

  // Crear (lee valores desde ev.target como en Reportes crear)
  const handleCrear = async (ev) => {
    ev.preventDefault();
    const nombre = ev.target.nombre?.value?.trim();
    const correo = ev.target.correo?.value?.trim();
    const rol = ev.target.rol?.value;
    const id_manager = ev.target.id_manager?.value || null;

    if (!nombre || !correo || !rol) {
      Swal.fire({
        icon: 'error',
        title: 'Faltan datos',
        text: 'Rellena nombre, correo y rol'
      });
      return;
    }

    try {
      const res = await crearUsuario({
        nombre,
        correo,
        rol,
        id_manager: id_manager || null
      });

      // crearUsuario en el hook setea mensajes pero no siempre devuelve la respuesta.
      await load();
      ev.target.reset();
      setVista('lista');
      Swal.fire({
        title: 'Creado',
        text: 'Usuario creado correctamente.',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false,
        draggable: true
      });
    } catch (err) {
      console.error('Error creando usuario:', err);
      const msg = err?.message || err?.msg || 'Error creando usuario';
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: msg
      });
    }
  };

  // Preparar edición: rellena formEditar y cambia vista a 'editar'
  const prepararEditar = (u) => {
    setFormEditar({
      id: u.id_usuario,
      nombre: u.nombre_completo || '',
      correo: u.correo || '',
      contrasenia: '', // dejar vacío para no cambiar
      rol: u.rol_nombre || '',
      id_manager: u.id_manager || ''
    });
    setVista('editar');
    // desplaza hacia el formulario para mejor UX
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Actualizar: usa el estado controlado formEditar (similar a handleActualizar en Reportes)
  const handleActualizar = async (ev) => {
    ev.preventDefault();
    const id = formEditar.id;
    if (!id) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Usuario no seleccionado'
      });
      return;
    }
    const datos = {
      id,
      nombre: (formEditar.nombre || '').trim(),
      correo: (formEditar.correo || '').trim(),
      contrasenia: formEditar.contrasenia || '', // si vacío backend mantiene actual
      rol: formEditar.rol
    };
    if (!datos.nombre || !datos.correo || !datos.rol) {
      Swal.fire({
        icon: 'error',
        title: 'Faltan datos',
        text: 'Rellena nombre, correo y rol'
      });
      return;
    }
    try {
      await actualizarUser(datos);
      await load();
      setFormEditar({ id: null, nombre: '', correo: '', contrasenia: '', rol: '', id_manager: '' });
      setVista('lista');
      Swal.fire({
        title: 'Actualizado',
        text: 'Usuario actualizado correctamente.',
        icon: 'success',
        timer: 1400,
        showConfirmButton: false,
        draggable: true
      });
    } catch (err) {
      console.error('Error actualizando usuario:', err);
      const msg = err?.message || err?.msg || 'Error actualizando usuario';
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: msg
      });
    }
  };

  // Eliminar
  const handleDelete = async (u) => {
    try {
      const { value: confirmDelete } = await Swal.fire({
        title: '¿Estás seguro?',
        text: `Eliminar usuario ${u.nombre_completo} (no se podrá revertir).`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar',
        focusCancel: true
      });

      if (!confirmDelete) {
        return;
      }

      // Llamada al hook
      const res = await eliminarUser(u.id_usuario, u.correo);

      if (!res) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se recibió respuesta del servidor.'
        });
        return;
      }

      if (res.ok === true) {
        await load();
        Swal.fire({
          title: 'Eliminado',
          text: res.msg || 'Usuario eliminado correctamente.',
          icon: 'success',
          timer: 1400,
          showConfirmButton: false,
          draggable: true
        });
      } else {
        const errMsg = res.msg || res.message || JSON.stringify(res);
        Swal.fire({
          icon: 'error',
          title: 'No se pudo eliminar',
          text: errMsg
        });
        console.warn('Eliminar usuario fallo:', res);
      }
    } catch (err) {
      console.error('Error en handleDelete:', err);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error eliminando usuario. Mira la consola.'
      });
    }
  };

  const tabBase = {
    padding: '10px 14px',
    borderRadius: 10,
    border: '1.6px solid rgba(0,0,0,0.08)',
    background: '#fff',
    color: 'var(--texto-negro)',
    cursor: 'pointer',
    fontWeight: 600,
    boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
  };
  const tabActive = {
    ...tabBase,
    background: 'linear-gradient(180deg, var(--verde) 0%, var(--verde-oscuro) 100%)',
    color: 'var(--texto-blanco)',
    borderColor: 'transparent',
    boxShadow: '0 8px 20px rgba(46,139,87,0.12)',
  };

  // Si el usuario no es Administrador, bloquear acceso a esta página 
  if (user?.rol !== 'Administrador') {
    return <div style={{ padding: 16 }}>No tienes permisos para ver esta sección.</div>;
  }

  return (
    <div className="reportes-page" style={{ padding: 16 }}>
      <h1>Gestión de Usuarios</h1>

      <div className="user-info" style={{ marginBottom: 12 }}>
        <strong>Usuario:</strong> {user?.nombre || '—'} ({user?.rol || '—'})
      </div>

      {/* Pestañas: Lista / Crear */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
        <button type="button" style={vista === 'lista' ? tabActive : tabBase} onClick={() => setVista('lista')}>Lista Usuarios</button>
        <button type="button" style={vista === 'crear' ? tabActive : tabBase} onClick={() => { setVista('crear'); setFormEditar({ id: null, nombre: '', correo: '', contrasenia: '', rol: '', id_manager: '' }); }}>+ Nuevo Usuario</button>
      </div>

      {/* Vista crear (solo cuando vista === 'crear') */}
      {vista === 'crear' && (
        <section className="crear-section" style={{ marginBottom: 16 }}>
          <h3>Crear usuario</h3>
          <form onSubmit={handleCrear} className="form-crear">
            <div>
              <input name="nombre" placeholder="Nombre completo" />
            </div>
            <div>
              <input name="correo" placeholder="Correo" />
            </div>
            {/* <div>
              <input name="contrasenia" placeholder="Contraseña" />
            </div> */}
            <div>
              <label>Rol</label>
              <select name="rol" defaultValue="">
                <option value="" disabled>Selecciona un rol</option>
                {roles.map(r => (<option key={r.id_rol || r.id} value={r.nombre}>{r.nombre}</option>))}
              </select>
            </div>
            <div>
              <label>Manager (opcional, id)</label>
              <input name="id_manager" placeholder="ID Manager (opcional)" />
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <button type="submit" className="btn btn-guardar">Crear</button>
              <button type="button" className="btn btn-cancelar" onClick={() => setVista('lista')}>Cancelar</button>
            </div>
          </form>
        </section>
      )}

      {/* Vista editar (solo cuando vista === 'editar') */}
      {vista === 'editar' && (
        <section className="crear-section" style={{ marginBottom: 16 }}>
          <h3>Editar usuario</h3>
          <form onSubmit={handleActualizar} className="form-crear">
            <div>
              <input name="nombreEditar" value={formEditar.nombre} onChange={e => setFormEditar({ ...formEditar, nombre: e.target.value })} placeholder="Nombre completo" />
            </div>
            <div>
              <input name="correoEditar" value={formEditar.correo} onChange={e => setFormEditar({ ...formEditar, correo: e.target.value })} placeholder="Correo" />
            </div>
            <div>
              <input name="contraseniaEditar" value={formEditar.contrasenia} onChange={e => setFormEditar({ ...formEditar, contrasenia: e.target.value })} placeholder="Dejar vacío para no cambiar" />
            </div>
            <div>
              <label>Rol</label>
              <select value={formEditar.rol} onChange={e => setFormEditar({ ...formEditar, rol: e.target.value })}>
                <option value="">Selecciona un rol</option>
                {roles.map(r => (<option key={r.id_rol || r.id} value={r.nombre}>{r.nombre}</option>))}
              </select>
            </div>
            <div>
              <label>Manager (opcional, id)</label>
              <input name="id_manager_edit" value={formEditar.id_manager} onChange={e => setFormEditar({ ...formEditar, id_manager: e.target.value })} placeholder="ID Manager (opcional)" />
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <button type="submit" className="btn btn-guardar">Actualizar</button>
              <button type="button" className="btn btn-cancelar" onClick={() => { setVista('lista'); setFormEditar({ id: null, nombre: '', correo: '', contrasenia: '', rol: '', id_manager: '' }); }}>Cancelar</button>
            </div>
          </form>
        </section>
      )}

      {/* Vista lista */}
      {vista === 'lista' && (
        <>
          <div style={{ marginBottom: 12 }}>
            <input className='crear-section' placeholder="Buscar por nombre o correo..." value={query} onChange={e => setQuery(e.target.value)} style={{ width: 300, marginRight: 8 }} />
            <select value={filterRole} onChange={e => setFilterRole(e.target.value)}>
              <option value="all">Todos los roles</option>
              {roles.map(r => <option key={r.id_rol || r.id} value={r.nombre}>{r.nombre}</option>)}
            </select>
          </div>

          <div>
            {loading && <div className="empty">Cargando...</div>}
            {!loading && listaFiltrada.length === 0 && <div className="empty">No hay usuarios que coincidan.</div>}
            {!loading && listaFiltrada.map(u => (
              <div key={u.id_usuario} className="reporte-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong>{u.nombre_completo}</strong>
                  <div style={{ color: 'var(--texto-gris)' }}>{u.correo} • <small>{u.rol_nombre}</small> {u.id_manager ? `• manager:${u.id_manager}` : ''}</div>
                </div>
                <div style={{ color: 'red', fontWeight: 'bold' }}>
                  {u.primer_login ? 'Debe cambiar contraseña' : ''}
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn btn-cancelar" onClick={() => prepararEditar(u)}>Editar</button>
                  <button className="btn btn-borrar" onClick={() => handleDelete(u)}>Eliminar</button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default UsuariosPage;