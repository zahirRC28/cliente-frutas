import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { userAuth } from '../hooks/userAuth';
import Swal from 'sweetalert2';
import '../styles/PrimerLogin.css';

export const PrimerLogin = () => {
    const { primerLogin, logoutUser } = userAuth();
    const [contrasenia, setContrasenia] = useState('');
    const [codigo, setCodigo] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!contrasenia.trim() || !codigo.trim()) {
            Swal.fire('Error', 'La contraseña y el código son obligatorios', 'error');
            return;
        }

        setLoading(true);

        const datos = {
            nuevaContrasenia: contrasenia,
            codigo: codigo
        };

        try {
            const info = await primerLogin(datos);

            if (info.ok) {
                Swal.fire('Éxito', info.msg, 'success').then(() => {
                    navigate('/', { replace: true }); // redirige al dashboard
                });
            } else {
                // Aquí manejamos posibles errores detallados
                let mensajeError = 'No se pudo cambiar la contraseña';
                if (info.errors) {
                    mensajeError = Object.values(info.errors).join('<br>');
                } else if (info.msg) {
                    mensajeError = info.msg;
                }
                Swal.fire('Error', mensajeError, 'error');
            }
        } catch (err) {
            Swal.fire('Error', 'Error del servidor. Inténtalo de nuevo más tarde.', 'error');
        } finally {
            setLoading(false);
        }
    };
    const cancelar = ()=>{
        logoutUser();
    }

    return (
        <div className="primer-login-container">
            <h1>Primer login: cambia tu contraseña</h1>
            <form onSubmit={handleSubmit} className="primer-login-form">
                <input
                    type="text"
                    placeholder="Código de verificación"
                    value={codigo}
                    onChange={(e) => setCodigo(e.target.value)}
                    disabled={loading}
                />
                <input
                    type="password"
                    placeholder="Nueva contraseña"
                    value={contrasenia}
                    onChange={(e) => setContrasenia(e.target.value)}
                    disabled={loading}
                />
                <button type="submit" disabled={loading}>
                    {loading ? 'Actualizando...' : 'Actualizar contraseña'}
                </button>
                <button onClick={cancelar}>
                    {loading ? 'Cancelando...' : 'Cancelar'}
                </button>
            </form>
        </div>
    );
};

