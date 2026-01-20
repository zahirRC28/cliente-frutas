import { useState } from "react";
import { Eye, EyeOff, LeafyGreen } from "lucide-react";
import "../styles/Login.css";
import { userAuth } from "../hooks/userAuth";
export const Login = () => {
    const [mostrarContrasenia, setMostrarContrasenia] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errorLogin, setErrorLogin] = useState("");
    const { loginUser, error } = userAuth();

    const handleSubmit = async(e) => {
        e.preventDefault();
        const correo = email;
        const contra = password;

         if (!correo.trim() || !contra.trim()) {
            setErrorLogin("El email y la contraseña son obligatorios");
            return;
        }
        const datos = { "correo": correo, "contrasenia": contra };
        await loginUser(datos);
        //console.log(error.contrasenia.msg);
        if(error){
            setErrorLogin("Email o contraseña incorrectos");
        }
        

    };
    return (
        <main className="login-container">
            <section className="login-izq">
                <div className="marca">
                    <span className="marca-icon"><LeafyGreen/></span>
                    <h2>AgroTech</h2>
                </div>
                <h1>Gestiona tu explotación agrícola de forma inteligente</h1>
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
                <form className="login-form" onSubmit={handleSubmit} noValidate>
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