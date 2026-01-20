import { useContext, useState } from "react";
import { jwtDecode } from "jwt-decode"
import { UserContext } from "../contexts/UserContext";
import conectar from "../helpers/fetch";

const urlBase = import.meta.env.VITE_BACKEND_URL;

/**
 * Hook personalizado para manejar autenticación y operaciones relacionadas con usuarios.
 * Permite login, logout, gestión de usuarios y roles.
 */
export const userAuth = () => {

    const { login, logout, user, token } = useContext(UserContext);
    const [error, setError] = useState(null);
    const [mensaje, setMensaje] = useState(null);

     // ---------------- LOGIN ---------------- //
     /**
   * Inicia sesión en el sistema
   * @param {Object} datos { correo, contrasenia }
   */
    const loginUser = async(datos) =>{
        //console.log(datos);
        const info = await conectar(`${urlBase}auth/login`, 'POST',datos);
        //console.log(info);
        const { user, token, ok} = info
        if(ok === true){
            login(user,token);
        }else{
            const errors = info.errors || info
            setError(errors)
            //console.log(errors);
        }
    }

    /**
   * Cierra sesión del usuario actual
   */
    const logoutUser = () =>{
        logout();
    }

    // ---------------- RENOVACION ----------------//
    const renewToken = async () => {
        const info = await conectar(`${urlBase}auth/renovar`, 'GET', {}, token);
        const { token: nuevoToken } = info
        //console.log(info);
        //console.log(nuevoToken);
        login(user, nuevoToken);
        
    };

    // ---------------- UTILIDADES ----------------//
    
    /**
   * Obtiene el rol del usuario a partir del token
   * @returns {string|null} Rol del usuario o null si expiró o es inválido
   */

    const getRole = () =>{
        if(!token) return null;
        try{
            const { rol, exp } = jwtDecode(token);
            // exp en segundos; compara con tiempo actual en ms
            if (typeof exp === 'number' && exp * 1000 <= Date.now()) {
                return null;
            }
            return rol;
        }catch{
            // token mal formado
            return null;
        }
    }

    // ---------------- USUARIOS ----------------//
    
    /**
   * Obtiene todos los usuarios del sistema
   * @returns {Array} Lista de usuarios
   */
    const todosUser = async()=>{
        const info = await conectar(`${urlBase}user/todosUsuarios/${user.uid}`,'GET',{},token);
        //----------renewToken();
        //console.log(info);
        const {usuarios} = info;
        console.log(usuarios);
        return usuarios;
    }

    /**
   * Crea un nuevo usuario
   * @param {Object} datos Datos del usuario
   */
    const crearUsuario = async(datos) =>{
        //console.log(datos);
        const info = await conectar(`${urlBase}user/crear`,'POST',datos,token);
        console.log(info)
        const { ok , msg} = info;
        if(ok === true){
            setMensaje(msg);
            setError(null);
        }else{
            setError(info.msg || "Error al crear usuario");
        }
    }

    /**
   * Obtiene un usuario por su ID
   * @param {number} idUser ID del usuario
   * @returns {Object} Usuario encontrado
   */
    const traerUsuario = async(idUser)=>{
        const info = await conectar(`${urlBase}user/usuario/${idUser}`,'GET',{},token);
        //console.log(info);
        const { usuario } = info
        return usuario;
    }

    /**
   * Obtiene todos los roles
   * @returns {Array} Lista de roles
   */
    const todosRoles = async()=>{
        const info = await conectar(`${urlBase}user/todosRoles`,'GET',{},token);
        //console.log(info)
        const { roles } = info
        return roles;
    }

    /**
   * Actualiza un usuario existente
   * @param {Object} datos { id, nombre, correo, contrasenia, rol }
   */
    const actualizarUser = async(datos)=>{
        console.log(datos);
        const info = await conectar(`${urlBase}user/actualizar/${datos.id}`,'PUT',datos,token)
        console.log(info);
        const { ok, msg} = info
        if(ok === true){
            setMensaje(msg);
            setError(null);
        }else{
            setError(info.msg || "Error al actualizar usuario");
        }
    }

    /**
   * Elimina un usuario
   * @param {number} idUser ID del usuario
   * @param {string} email Email del usuario
   */
    const eliminarUser = async(idUser, email)=>{
        //console.log(idUser);
        //console.log(email);
        const datos = {
            "correo": email
        }
        const info = await conectar(`${urlBase}user/eliminar/${idUser}`,'DELETE',datos,token)
        console.log(info);
        const { ok, msg } = info;
        if(ok === true){
            setMensaje(msg);
            setError(null)
        }
    }

    /**
   * Cambia el estado (activo/inactivo) de un usuario
   * @param {number} idUser ID del usuario
   */
    const estadoUser = async(idUser)=>{
        const info = await conectar(`${urlBase}user/cambiarEstado/${idUser}`,'PUT',{},token)
        console.log(info)
        const { ok, msg } = info
        if(ok == true){
            setMensaje(msg);
            setError(null);
        }
    }

    /**
   * Obtiene usuarios por rol específico
   * @param {string} nombreRol Nombre del rol
   * @returns {Array} Lista de usuarios
   */
    const userPoRole = async(nombreRol)=>{
        //console.log(nombreRol);
        const dato = {
            nombre: nombreRol
        }
        const info = await conectar(`${urlBase}user/porUserRol`,'POST',dato,token);
        //console.log(info);
        const { usuarios } = info
        //console.log(usuarios)
        return usuarios;
    }

    /**
   * Limpia los mensajes de éxito
   */
    const limpiarMensaje = () => setMensaje(null);

  return {
    loginUser,
    logoutUser,
    user,
    error,
    getRole,
    token,
    todosUser,
    eliminarUser,
    todosRoles,
    traerUsuario,
    crearUsuario,
    actualizarUser,
    mensaje,
    estadoUser,
    limpiarMensaje,
    userPoRole
    }
}
