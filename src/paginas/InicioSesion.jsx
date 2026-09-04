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
        {/* Enlace superior Volver a Inicio */}
        <div className="login-header-nav">
          <Link to="/" className="btn-volver-inicio">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="icono-flecha-volver"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
            </svg>
            <span>VOLVER A INICIO</span>
          </Link>
        </div>

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
                  placeholder="CORREO ELECTRÓNICO"
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
                  placeholder="CONTRASEÑA"
                  value={password}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  className="login-toggle-password"
                  onClick={() => setMostrarPassword(!mostrarPassword)}
                  aria-label={mostrarPassword ? "Ocultar contraseña" : "Ver contraseña"}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="icono-ojo"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </button>
                {errores.password && <span className="error-msg">{errores.password}</span>}
              </div>

              {/* Olvidaste tu contraseña */}
              <div className="login-forgot-container">
                <Link to="/ayuda" className="login-forgot-link">
                  ¿NECESITAS AYUDA CON TU CUENTA?
                </Link>
              </div>

              {/* Botón principal de Iniciar Sesión */}
              <button type="submit" className="login-submit-btn" disabled={cargando}>
                <span>{cargando ? 'VERIFICANDO...' : 'INICIAR SESIÓN'}</span>
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
                REGÍSTRATE
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default InicioSesion;
