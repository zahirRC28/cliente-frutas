import React, { useEffect, useMemo, useState } from 'react';
import { User } from 'lucide-react';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';
import { userAuth } from '../hooks/userAuth';
import './reportes.css';

const UsuariosPage = () => {
  const { user, todosUser, crearUsuario, actualizarUser, eliminarUser, todosRoles, userPoRole } = userAuth();

  const [usuarios, setUsuarios] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);

  const [query, setQuery] = useState('');
  const [filterRole, setFilterRole] = useState('all');

  const [vista, setVista] = useState('lista');

  const [formEditar, setFormEditar] = useState({ id: null, nombre: '', correo: '', contrasenia: '', rol: '', id_manager: '' });

  const [selectedRole, setSelectedRole] = useState('');

  const [managers, setManagers] = useState([]);
  const [loadingManagers, setLoadingManagers] = useState(false);
  const [managersError, setManagersError] = useState(false);

  const managerOptions = useMemo(() => {
    if (!Array.isArray(managers)) return [];
    return managers
      .map(m => {
        const rawId = m?.id_usuario ?? m?.id ?? m?.uid;
        const id = rawId !== undefined && rawId !== null ? String(rawId) : '';
        if (!id) return null;
        const name = m?.nombre_completo ?? `${m?.nombre ?? ''} ${m?.apellidos ?? ''}`.trim();
        const label = name || m?.correo || `Manager ${id}`;
        return { id, label };
      })
      .filter(Boolean);
  }, [managers]);

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

  useEffect(() => {
    let mounted = true;

    const loadManagers = async () => {
      setManagersError(false);
      setLoadingManagers(true);
      try {
        let list = [];

        if (typeof userPoRole === 'function') {
          try {
            const res = await userPoRole('Manager');
            list = Array.isArray(res) ? res : [];
          } catch (err) {
            list = [];
          }
        }

        if ((!Array.isArray(list) || list.length === 0) && typeof userPoRole === 'function') {
          try {
            const res2 = await userPoRole('manager');
            list = Array.isArray(res2) ? res2 : [];
          } catch (err) {
            // ignore
          }
        }

        if ((!Array.isArray(list) || list.length === 0) && typeof todosUser === 'function') {
          try {
            const all = await todosUser();
            if (Array.isArray(all)) {
              list = all.filter(u => {
                const rolField = (u?.rol || u?.rol_nombre || '').toString().toLowerCase();
                return rolField.includes('manager') || rolField.includes('gestor');
              });
            } else {
              list = [];
            }
          } catch (err) {
            list = [];
          }
        }

        if (!mounted) return;
        setManagers(list);
      } catch (err) {
        if (!mounted) return;
        setManagers([]);
        setManagersError(true);
      } finally {
        if (mounted) setLoadingManagers(false);
      }
    };

    const isCrearProductor = String(selectedRole || '').toLowerCase() === 'productor';
    const isEditProductor = String(formEditar.rol || '').toLowerCase() === 'productor';

    if (isCrearProductor || isEditProductor) {
      loadManagers();
    } else {
      setManagers([]);
      setManagersError(false);
      setLoadingManagers(false);
      const el = document.querySelector('select[name="id_manager"]');
      if (el) el.value = '';
    }

    return () => { mounted = false; };
  }, [selectedRole, formEditar.rol]);

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

  const handleCrear = async (ev) => {
    ev.preventDefault();
    const nombre = ev.target.nombre?.value?.trim();
    const correo = ev.target.correo?.value?.trim();
    const rol = ev.target.rol?.value;
    const id_manager_raw = ev.target.id_manager?.value || null;
    const id_manager = id_manager_raw ? Number(id_manager_raw) : null;

    if (!nombre || !correo || !rol) {
      Swal.fire({
        icon: 'error',
        title: 'Faltan datos',
        text: 'Rellena nombre, correo y rol'
      });
      return;
    }

    try {
      await crearUsuario({
        nombre,
        correo,
        rol,
        id_manager: id_manager || null
      });

      await load();
      ev.target.reset();
      setSelectedRole('');
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

  const prepararEditar = (u) => {
    setFormEditar({
      id: u.id_usuario,
      nombre: u.nombre_completo || '',
      correo: u.correo || '',
      contrasenia: '',
      rol: u.rol_nombre || '',
      id_manager: u.id_manager !== undefined && u.id_manager !== null ? String(u.id_manager) : ''
    });
    setVista('editar');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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
      contrasenia: formEditar.contrasenia || '',
      rol: formEditar.rol
    };

    if ((formEditar.rol || '').toString().toLowerCase() === 'productor') {
      datos.id_manager = formEditar.id_manager ? Number(formEditar.id_manager) : null;
    } else {
      datos.id_manager = null;
    }

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

      if (!confirmDelete) return;

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

  if (user?.rol !== 'Administrador') {
    return <div style={{ padding: 16 }}>No tienes permisos para ver esta sección.</div>;
  }

  // Tabs estilo reportes solo para los botones de arriba
  return (
    <div className="reportes-page" style={{ padding: 16 }}>
      <h1 style={{ display: 'flex', alignItems: 'center', gap: 8 }}><User size={24} /> Gestión de Usuarios</h1>

      <div className="user-info" style={{ marginBottom: 12 }}>
        <strong>Usuario:</strong> {user?.nombre || '—'} ({user?.rol || '—'})
      </div>

      <div className="tab-container" style={{ marginBottom: 12 }}>
        <button
          className={`tab${vista === 'lista' ? ' active' : ''}`}
          type="button"
          onClick={() => setVista('lista')}
        >
          Lista Usuarios
        </button>
        <button
          className={`tab${vista === 'crear' ? ' active' : ''}`}
          type="button"
          onClick={() => {
            setVista('crear');
            setFormEditar({ id: null, nombre: '', correo: '', contrasenia: '', rol: '', id_manager: '' });
            setSelectedRole('');
          }}
        >
          + Nuevo Usuario
        </button>
      </div>

      {/* Crear usuario */}
      {vista === 'crear' && (
        <section className="crear-section">
          <h3>Crear usuario</h3>
          <form onSubmit={handleCrear} className="form-crear">
            <div>
              <input name="nombre" placeholder="Nombre completo" />
            </div>
            <div>
              <input name="correo" placeholder="Correo" />
            </div>
            <div>
              <label>Rol</label>
              <select name="rol" defaultValue="" onChange={e => setSelectedRole(e.target.value)}>
                <option value="" disabled>Selecciona un rol</option>
                {roles.map(r => (<option key={r.id_rol || r.id} value={r.nombre}>{r.nombre}</option>))}
              </select>
            </div>

            {String(selectedRole || '').toLowerCase() === 'productor' ? (
              <div>
                <label>Manager asignado</label>
                {loadingManagers ? (
                  <div>Cargando managers...</div>
                ) : managersError ? (
                  <div className="error">No se pudieron cargar los managers</div>
                ) : managerOptions.length === 0 ? (
                  <div className="info">No hay managers disponibles</div>
                ) : (
                  <select name="id_manager" defaultValue="">
                    <option value="" disabled>Selecciona un manager</option>
                    {managerOptions.map(opt => (
                      <option key={opt.id} value={opt.id}>{opt.label}</option>
                    ))}
                  </select>
                )}
              </div>
            ) : (
              <input type="hidden" name="id_manager" value="" />
            )}

            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <button type="submit" className="btn btn-guardar">Crear</button>
              <button type="button" className="btn btn-cancelar" onClick={() => setVista('lista')}>Cancelar</button>
            </div>
          </form>
        </section>
      )}

      {/* Editar usuario */}
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
              <select
                value={formEditar.rol}
                onChange={e => {
                  const newRole = e.target.value;
                  setFormEditar(prev => ({
                    ...prev,
                    rol: newRole,
                    id_manager: String(newRole).toLowerCase() === 'productor' ? prev.id_manager : ''
                  }));
                }}
              >
                <option value="">Selecciona un rol</option>
                {roles.map(r => (<option key={r.id_rol || r.id} value={r.nombre}>{r.nombre}</option>))}
              </select>
            </div>

            {String(formEditar.rol || '').toLowerCase() === 'productor' ? (
              <div>
                <label>Manager asignado</label>

                {loadingManagers ? (
                  <div>Cargando managers...</div>
                ) : managersError ? (
                  <div className="error">No se pudieron cargar los managers</div>
                ) : managerOptions.length === 0 ? (
                  <div className="info">No hay managers disponibles</div>
                ) : (
                  <select
                    name="id_manager_edit"
                    value={formEditar.id_manager || ''}
                    onChange={e => setFormEditar({ ...formEditar, id_manager: e.target.value })}
                  >
                    <option value="" disabled>Selecciona un manager</option>
                    {managerOptions.map(opt => (
                      <option key={opt.id} value={opt.id}>{opt.label}</option>
                    ))}
                  </select>
                )}
              </div>
            ) : (
              <input type="hidden" name="id_manager_edit" value={formEditar.id_manager || ''} />
            )}

            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <button type="submit" className="btn btn-guardar">Actualizar</button>
              <button type="button" className="btn btn-cancelar" onClick={() => { setVista('lista'); setFormEditar({ id: null, nombre: '', correo: '', contrasenia: '', rol: '', id_manager: '' }); }}>Cancelar</button>
            </div>
          </form>
        </section>
      )}

      {/* Lista de usuarios */}
      {vista === 'lista' && (
        <>
          <div className="filtros">
            <div className="filtro-titulo">
              <input
                type="text"
                placeholder="Buscar por nombre o correo..."
                value={query}
                onChange={e => setQuery(e.target.value)}
              />
            </div>
            <div>
              <select value={filterRole} onChange={e => setFilterRole(e.target.value)}>
                <option value="all">Todos los roles</option>
                {roles.map(r => <option key={r.id_rol || r.id} value={r.nombre}>{r.nombre}</option>)}
              </select>
            </div>
          </div>

          <div className="lista-reportes">
            {loading && <div className="empty">Cargando...</div>}
            {!loading && listaFiltrada.length === 0 && <div className="empty">No hay usuarios que coincidan.</div>}
            {!loading && listaFiltrada.map(u => (
              <div key={u.id_usuario} className="reporte-card" role="article" aria-labelledby={`usuario-${u.id_usuario}`}
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div className="contenido">
                  <strong id={`usuario-${u.id_usuario}`}>{u.nombre_completo}</strong>
                  <div className="meta">
                    {u.correo} • <small>{u.rol_nombre}</small> {u.id_manager ? `• manager:${u.id_manager}` : ''}
                  </div>
                </div>
                <div style={{ color: 'red', fontWeight: 'bold' }}>
                  {u.primer_login ? 'Debe cambiar contraseña' : ''}
                </div>
                <div className="acciones">
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