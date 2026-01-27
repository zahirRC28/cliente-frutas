import { useState } from "react"
import { UserContext } from "./UserContext"
import Cookies from 'js-cookie';

/**
 * Proveedor de contexto de usuario
 *
 * Este componente envuelve la aplicación y provee información del usuario
 * y del token de autenticación a todos los componentes que consuman el contexto.
 *
 * @component
 * @param {Object} props
 * @param {React.ReactNode} props.children - Elementos hijos que consumirán el contexto
 * @returns {JSX.Element} UserContext.Provider
 *
 * @example
 * <UserProvider>
 *   <App />
 * </UserProvider>
 */

export const UserProvider = ({ children }) => {
    /**
     * Estado del usuario
     * @type {Object|null}
     */
    const [user, setUser] = useState(() =>{
      const datos = Cookies.get('userData')
      return datos ? JSON.parse(datos) : null
    });
    /**
     * Estado del token de autenticación
     * @type {string|null}
     */
    const [token, setToken] = useState( Cookies.get('miToken') || null);
    const [nuevoUser, setNuevoUser] = useState(() => {
      const cookie = Cookies.get('primerLogin');
      return cookie ? JSON.parse(cookie) : null; // parsea "true"/"false" a boolean
    });
    //console.log(nuevoUser);
    /**
     * Función para iniciar sesión
     *
     * @param {Object} userDatos - Datos del usuario
     * @param {string} token - Token JWT
     * @returns {void}
     *
     * @example
     * login({ nombre: "Juan", rol: "Administrador" }, "token123")
     */
    const login = (userDatos, token, primer_login) =>{
      //console.log(userDatos)
      //console.log(token)
      setUser(userDatos);
      setToken(token);
      setNuevoUser(primer_login);
      //localStorage.setItem("token", token);
      Cookies.set('miToken', token, { expires: 1, path: '/' });
      Cookies.set('userData', JSON.stringify(userDatos), { expires: 1, path: '/' });
      Cookies.set('primerLogin', JSON.stringify(primer_login), { expires: 1, path: '/' });
    };
    const actualizarPrimer = (primer_login) =>{
      setNuevoUser(primer_login);
      Cookies.set('primerLogin', JSON.stringify(primer_login), { expires: 1, path: '/' });
    }
    /**
     * Función para cerrar sesión
     *
     * Limpia el estado del usuario y token, y elimina las cookies.
     *
     * @returns {void}
     *
     * @example
     * logout()
     */
    const logout = () =>{
      setUser(null)
      setToken(null)
      // Las cookies se setearon con path '/'; usa el mismo para borrarlas
      Cookies.remove('miToken', { path: '/' });
      Cookies.remove('userData', { path: '/' });
      Cookies.remove('primerLogin', { path: '/' });
    }

  return (
    
    <UserContext.Provider value={{user, token, login, logout, nuevoUser, actualizarPrimer}}>
        {children}
    </UserContext.Provider>
  )
}