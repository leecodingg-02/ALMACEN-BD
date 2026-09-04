import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { iniciarSesion } from '../servicios/usuario';
import './InicioSesion.css';

const InicioSesion = ({ onIniciarSesion }) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [errores, setErrores] = useState({});
  const [cargando, setCargando] = useState(false);
  const [mensajeError, setMensajeError] = useState('');

  /* Validaciones */
  const correoValido = (valor) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor);

  const validarFormulario = () => {
    const nuevosErrores = {};

    /* Email — obligatorio, formato válido */
    if (!email.trim()) {
      nuevosErrores.email = "El correo es obligatorio.";
    } else if (!correoValido(email)) {
      nuevosErrores.email = "Ingresa un correo válido.";
    }

    /* Contraseña — obligatoria, mínimo 6 caracteres */
    if (!password.trim()) {
      nuevosErrores.password = "La contraseña es obligatoria.";
    } else if (password.length < 6) {
      nuevosErrores.password = "La contraseña debe tener al menos 6 caracteres.";
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'email') setEmail(value);
    if (name === 'password') setPassword(value);

    /* Limpiar error al editar */
    if (errores[name]) {
      setErrores((prev) => ({ ...prev, [name]: undefined }));
    }
    setMensajeError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validarFormulario()) return;

    setCargando(true);
    setMensajeError('');

    try {
      // Iniciar sesión consultando la tabla usuario en MySQL
      const usuario = await iniciarSesion(email, password);
      if (onIniciarSesion) {
        onIniciarSesion(usuario);
      }
      navigate('/usuario');
    } catch (err) {
      setMensajeError(err.message || 'Correo o contraseña incorrectos');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="login-pagina-wrapper">
      <main className="login-main-container">

        {/* Tarjeta central de Inicio de Sesión */}
        <div className="login-card-container">
          <div className="login-card">
            {/* Adorno amarillo en la esquina superior derecha */}
            <div className="login-card-corner-ribbon"></div>

            <h1 className="login-card-title">Iniciar Sesión</h1>
            <p className="login-card-subtitle">
              Ingresa a tu cuenta para continuar transformando tu hogar.
            </p>

            {mensajeError && (
              <div style={{
                background: 'rgba(239, 68, 68, 0.12)',
                color: '#ef4444',
                padding: '12px 16px',
                borderRadius: '8px',
                marginBottom: '16px',
                fontSize: '14px',
                border: '1px solid rgba(239, 68, 68, 0.3)'
              }}>
                ⚠️ {mensajeError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="login-form" noValidate>
              {/* Campo Correo Electrónico */}
              <div className="login-field-group">
                <input
                  type="email"
                  id="email"
                  name="email"
                  className={`login-input ${errores.email ? "campo-error" : ""}`}
                  placeholder="Correo Electrónico"
                  value={email}
                  onChange={handleChange}
                  required
                />
                {errores.email && <span className="error-msg">{errores.email}</span>}
              </div>

              {/* Campo Contraseña */}
              <div className="login-field-group login-password-group">
                <input
                  type={mostrarPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  className={`login-input ${errores.password ? "campo-error" : ""}`}
                  placeholder="Contraseña"
                  value={password}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  className="btn-toggle-eye"
                  onClick={() => setMostrarPassword(!mostrarPassword)}
                  aria-label={mostrarPassword ? "Ocultar contraseña" : "Ver contraseña"}
                  title={mostrarPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                  {mostrarPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                    </svg>
                  )}
                </button>
                {errores.password && <span className="error-msg">{errores.password}</span>}
              </div>

              {/* Olvidaste tu contraseña */}
              <div className="login-forgot-container">
                <Link to="/ayuda" className="login-forgot-link">
                  ¿Necesitas ayuda con tu cuenta?
                </Link>
              </div>

              {/* Botón principal de Iniciar Sesión */}
              <button type="submit" className="login-submit-btn" disabled={cargando}>
                <span>{cargando ? 'VERIFICANDO...' : 'Iniciar Sesión'}</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2.5}
                  stroke="currentColor"
                  className="icono-submit-flecha"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                </svg>
              </button>
            </form>

            <div className="login-divider"></div>

            {/* Enlace para ir al registro */}
            <div className="login-register-prompt">
              <span>¿No tienes una cuenta? </span>
              <Link to="/crear-cuenta" className="login-register-link">
                Registrate
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default InicioSesion;
