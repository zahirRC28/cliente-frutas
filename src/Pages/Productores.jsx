import React, { useMemo, useState } from 'react';
import { Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { userAuth } from '../hooks/userAuth';
import { useProductores } from '../hooks/useProductores';
import './reportes.css';

export const Productores = () => {
  const navigate = useNavigate();
  const { user, token } = userAuth();
  const rol = user?.rol;
  const uid = user?.uid;
  const { productores, loading } = useProductores(rol, uid, token);

  const [search, setSearch] = useState('');

  // Filtro por nombre
  const listaFiltrada = useMemo(() => {
    if (!search.trim()) return productores || [];
    const q = search.toLowerCase();
    return (productores || []).filter(p => (p.nombre_completo || '').toLowerCase().includes(q));
  }, [productores, search]);

  // Si el rol es Productor, no mostrar la página
  if (!['Administrador', 'Manager', 'Asesor'].includes(rol)) {
    return <div style={{ padding: 16 }}>No tienes permisos para ver esta sección.</div>;
  }

  return (
    <div className="reportes-page" style={{ padding: 16 }}>
      <h1 style={{display:'flex',alignItems:'center',gap:8}}><Users size={24} /> Productores</h1>

      <div style={{ marginBottom: 12 }}>
        <label htmlFor="buscar">Buscar productor</label>
        <input className='crear-section'
          id="buscar"
          placeholder="Escribe nombre del productor..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ display: 'block', marginTop: 8, width: '100%', maxWidth: 420 }}
        />
      </div>

      <div style={{ marginBottom: 8 }}>
        <strong>Total: {listaFiltrada.length}</strong>
      </div>

      <div className="lista-reportes">
        {loading && <div className="empty">Cargando...</div>}
        {!loading && listaFiltrada.length === 0 && <div className="empty">No hay productores que coincidan.</div>}
        {!loading && listaFiltrada.map(p => (
          <div key={p.id_usuario} className="reporte-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <strong>{p.nombre_completo}</strong>
              <div style={{ color: 'var(--texto-gris)', marginTop: 6 }}>{p.correo}</div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                className="btn btn-cancelar"
                onClick={() => {
                  // Si rol es 'Administrador', ruta -> '/admin'
                  // Si rol es 'Manager', ruta -> '/manager'
                  const rutaBase = user.rol === 'Administrador' ? 'admin' : user.rol.toLowerCase();
                  navigate(`/${rutaBase}/productores/${p.id_usuario}`);
                }}
              >
                Ver más
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Productores;