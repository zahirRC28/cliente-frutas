import { useState } from "react";
import { Eye, EyeOff, LeafyGreen } from "lucide-react";
import "../styles/Login.css";
import { userAuth } from "../hooks/userAuth";
import logo from "../assets/logo_bueno.png"
import { useNavigate } from 'react-router-dom';

export const Login = () => {
    const [mostrarContrasenia, setMostrarContrasenia] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errorLogin, setErrorLogin] = useState("");
    const { loginUser, error } = userAuth();
    const navigate = useNavigate();

    const handleSubmit = async(e) => {
        e.preventDefault();
        const correo = email;
        const contra = password;

         if (!correo.trim() || !contra.trim()) {
            setErrorLogin("El email y la contraseña son obligatorios");
            return;
        }
        const datos = { "correo": correo, "contrasenia": contra };


        const info = await loginUser(datos);
        console.log(info);
        if(info.ok !== true){
            setErrorLogin("Email o contraseña incorrectos");
            return;
        }

        // Redirigir según si es primer login o no
        if(info.primer_login){
            navigate('/primer-login'); // Nueva ruta para cambiar contraseña
        } else {
            navigate('/', { replace: true }) // Ruta normal después de login
        }
        

    };
    return (
        <main className="login-container">
            <section className="login-izq">
                <div className="marca">
                    <span className="marca-icon"><img className="LogoPrincipal" src={logo}></img></span>
                    <h2 className="nombreApp">culti tech</h2>
                </div>
                <h1>Gestiona tus cultivos agrícolas de forma inteligente</h1>
                <p>
                    Monitoriza tus cultivos, coordina con proveedores y recibe
                    alertas en tiempo real desde una única plataforma.
                </p>
                <div className="stats-login">
                    <div>
                        <strong>+2,500</strong>
                        <span>Hectáreas gestionadas</span>
                    </div>
                    <div>
                        <strong>98%</strong>
                        <span>Precisión alertas</span>
                    </div>
                    <div>
                        <strong>24/7</strong>
                        <span>Monitorización</span>
                    </div>
                </div>
            </section>
            <section className="login-der">
                {/* Logo y nombre solo en móvil, encima del formulario */}
                <form className="login-form" onSubmit={handleSubmit} noValidate>
                    {/* Logo y nombre solo en móvil, dentro de la card */}
                    <div className="mobile-header-login">
                        <span className="mobile-logo"><img className="LogoPrincipal" src={logo} alt="Logo" /></span>
                        <span className="mobile-appname">culti tech</span>
                    </div>
                    <h2>Bienvenido de nuevo</h2>
                    <p>Ingresa tus credenciales para acceder</p>
                    {errorLogin && (
                        <div className="error-login">{errorLogin}</div>
                    )}
                    <div className="field">
                        <label>Email</label>
                        <input
                            name="email"
                            type="email"
                            value={email}
                            onChange={(e) => {
                                setEmail(e.target.value);
                                setErrorLogin("");
                            }}
                            placeholder="tu@email.com"
                        />
                    </div>
                    <div className="field">
                        <label>Contraseña</label>
                        <div className="password-wrapper">
                            <input
                                name="contrasenia"
                                type={mostrarContrasenia ? "text" : "password"}
                                value={password}
                                onChange={(e) => {
                                    setPassword(e.target.value);
                                    setErrorLogin("");
                                }}
                                placeholder="••••••••"
                            />
                            <button
                                type="button"
                                className="toggle"
                                onClick={() =>
                                    setMostrarContrasenia(!mostrarContrasenia)
                                }
                            >
                                {mostrarContrasenia ? (
                                    <EyeOff size={18} />
                                ) : (
                                    <Eye size={18} />
                                )}
                            </button>
                        </div>
                    </div>
                    <button type="submit" className="login-btn">
                        Iniciar sesión →
                    </button>
                </form>
            </section>
        </main>
    );
};