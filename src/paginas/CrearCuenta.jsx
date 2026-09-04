import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registrarUsuario, rutaPanelSegunRol } from '../servicios/usuario';
import './CrearCuenta.css';

const CrearCuenta = ({ onIniciarSesion }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    tipoDocumento: 'CC',
    documento: '',
    email: '',
    password: '',
    repetirPassword: ''
  });

  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [errores, setErrores] = useState({});
  const [cargando, setCargando] = useState(false);
  const [mensajeError, setMensajeError] = useState('');
  const [registroExitoso, setRegistroExitoso] = useState(false);
  const [usuarioRegistrado, setUsuarioRegistrado] = useState(null);

  /* Validaciones */
  const soloLetras = (valor) => /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s'-]+$/.test(valor);
  const correoValido = (valor) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor);

  const validarFormulario = () => {
    const nuevosErrores = {};

    /* Nombre — obligatorio, solo letras */
    if (!formData.nombre.trim()) {
      nuevosErrores.nombre = "El nombre es obligatorio.";
    } else if (!soloLetras(formData.nombre.trim())) {
      nuevosErrores.nombre = "El nombre solo puede contener letras.";
    }

    /* Apellido — obligatorio, solo letras */
    if (!formData.apellido.trim()) {
      nuevosErrores.apellido = "El apellido es obligatorio.";
    } else if (!soloLetras(formData.apellido.trim())) {
      nuevosErrores.apellido = "El apellido solo puede contener letras.";
    }

    /* Tipo de documento — obligatorio */
    if (!formData.tipoDocumento) {
      nuevosErrores.tipoDocumento = "Selecciona un tipo de documento.";
    }

    /* Documento — obligatorio, mínimo 4 caracteres */
    if (!formData.documento.trim()) {
      nuevosErrores.documento = "El número de documento es obligatorio.";
    } else if (formData.tipoDocumento !== 'PAS' && !/^\d+$/.test(formData.documento.trim())) {
      nuevosErrores.documento = "Solo se permiten dígitos para este tipo de documento.";
    } else if (formData.documento.trim().length < 4) {
      nuevosErrores.documento = "El documento debe tener al menos 4 caracteres.";
    }

    /* Email — obligatorio, formato válido */
    if (!formData.email.trim()) {
      nuevosErrores.email = "El correo electrónico es obligatorio.";
    } else if (!correoValido(formData.email.trim())) {
      nuevosErrores.email = "Ingresa un correo electrónico válido (ej: usuario@correo.com).";
    }

    /* Contraseña — obligatoria, mínimo 6 caracteres */
    if (!formData.password) {
      nuevosErrores.password = "La contraseña es obligatoria.";
    } else if (formData.password.length < 6) {
      nuevosErrores.password = "La contraseña debe tener al menos 6 caracteres.";
    }

    /* Repetir Contraseña — obligatoria, debe coincidir */
    if (!formData.repetirPassword) {
      nuevosErrores.repetirPassword = "Debes confirmar tu contraseña.";
    } else if (formData.password !== formData.repetirPassword) {
      nuevosErrores.repetirPassword = "Las contraseñas no coinciden.";
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));

    /* Limpiar error del campo modificado */
    if (errores[name]) {
      setErrores((prev) => ({ ...prev, [name]: undefined }));
    }
    if (mensajeError) {
      setMensajeError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validarFormulario()) return;

    setCargando(true);
    setMensajeError('');

    try {
      // Mapear los campos del formulario a los nombres esperados por el backend
      const datos = {
        nombre: formData.nombre.trim(),
        apellido: formData.apellido.trim(),
        tipo_doc: formData.tipoDocumento,
        num_ident: formData.documento.trim(),
        correo: formData.email.trim().toLowerCase(),
        contrasena: formData.password,
      };

      const usuario = await registrarUsuario(datos);
      setUsuarioRegistrado(usuario);
      setRegistroExitoso(true);

      if (onIniciarSesion) {
        onIniciarSesion(usuario);
      }

      // Redirigir al panel del usuario tras 1.8 segundos para dar feedback visual claro
      setTimeout(() => {
        navigate(rutaPanelSegunRol(usuario));
      }, 1800);
    } catch (err) {
      setMensajeError(err.message || 'No se pudo crear la cuenta. Por favor verifica tus datos e intenta nuevamente.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="crear-cuenta-page">
      {/* Seccion principal de registro */}
      <main className="crear-cuenta-container">
        {/* Panel Izquierdo: Formulario */}
        <div className="crear-cuenta-left-panel">

          {/* Encabezado del Formulario */}
          <div className="crear-cuenta-header">
            <h1 className="crear-cuenta-title">Crear Cuenta</h1>
            <p className="crear-cuenta-subtitle">
              Únete a NovaCasa y transforma tu hogar hoy mismo.
            </p>
          </div>

          {/* Notificación de éxito si la cuenta fue creada */}
          {registroExitoso ? (
            <div style={{
              background: '#ecfdf5',
              border: '1.5px solid #10b981',
              borderRadius: '12px',
              padding: '24px 20px',
              textAlign: 'center',
              marginBottom: '24px',
              animation: 'fadeIn 0.3s ease'
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                background: '#10b981',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 14px',
                color: '#ffffff'
              }}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" style={{ width: '26px', height: '26px' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                </svg>
              </div>
              <h3 style={{ margin: '0 0 8px', color: '#065f46', fontSize: '18px', fontWeight: 800 }}>
                ¡Cuenta creada con éxito!
              </h3>
              <p style={{ margin: '0 0 16px', color: '#047857', fontSize: '14px', lineHeight: '1.4' }}>
                Bienvenido/a <strong>{usuarioRegistrado?.nombre || formData.nombre}</strong>. Tu cuenta ha sido guardada en la base de datos.
              </p>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: '#059669', fontSize: '13px', fontWeight: 600 }}>
                <span className="spinner-dots" style={{ display: 'inline-block' }}>Redirigiendo a tu cuenta...</span>
              </div>
            </div>
          ) : null}

          {/* Mensaje de error del registro */}
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

          {/* Formulario de Registro */}
          {!registroExitoso && (
            <form onSubmit={handleSubmit} className="crear-cuenta-form" noValidate>
              {/* Fila 1: Nombre y Apellido */}
              <div className="form-row two-columns">
                <div className="form-group">
                  <label className="form-label">
                    Nombre <span className="asterisk">*</span>
                  </label>
                  <input
                    type="text"
                    name="nombre"
                    className={`form-input ${errores.nombre ? "campo-error" : ""}`}
                    value={formData.nombre}
                    onChange={handleChange}
                    placeholder="Ej: Juan"
                    required
                  />
                  {errores.nombre && <span className="error-msg">{errores.nombre}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Apellido <span className="asterisk">*</span>
                  </label>
                  <input
                    type="text"
                    name="apellido"
                    className={`form-input ${errores.apellido ? "campo-error" : ""}`}
                    value={formData.apellido}
                    onChange={handleChange}
                    placeholder="Ej: Pérez"
                    required
                  />
                  {errores.apellido && <span className="error-msg">{errores.apellido}</span>}
                </div>
              </div>

              {/* Fila 2: Tipo de Documento y Documento */}
              <div className="form-row two-columns">
                <div className="form-group">
                  <label className="form-label">
                    Tipo de documento <span className="asterisk">*</span>
                  </label>
                  <div className="select-wrapper">
                    <select
                      name="tipoDocumento"
                      className={`form-select ${errores.tipoDocumento ? "campo-error" : ""}`}
                      value={formData.tipoDocumento}
                      onChange={handleChange}
                      required
                    >
                      <option value="CC">Cédula de Ciudadanía (CC)</option>
                      <option value="CE">Cédula de Extranjería (CE)</option>
                      <option value="PAS">Pasaporte (PAS)</option>
                      <option value="NIT">NIT</option>
                    </select>
                    <svg
                      className="select-chevron"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                    </svg>
                  </div>
                  {errores.tipoDocumento && <span className="error-msg">{errores.tipoDocumento}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Documento <span className="asterisk">*</span>
                  </label>
                  <input
                    type="text"
                    name="documento"
                    inputMode="numeric"
                    placeholder="Ej: 1020304050"
                    className={`form-input ${errores.documento ? "campo-error" : ""}`}
                    value={formData.documento}
                    onChange={handleChange}
                    required
                  />
                  {errores.documento && <span className="error-msg">{errores.documento}</span>}
                </div>
              </div>

              {/* Fila 3: Correo electrónico */}
              <div className="form-group">
                <label className="form-label">
                  Correo electrónico <span className="asterisk">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  placeholder="ejemplo@correo.com"
                  className={`form-input ${errores.email ? "campo-error" : ""}`}
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
                {errores.email && <span className="error-msg">{errores.email}</span>}
              </div>

              {/* Fila 4: Contraseña y Repetir Contraseña */}
              <div className="form-row two-columns">
                <div className="form-group password-group">
                  <label className="form-label">
                    Contraseña <span className="asterisk">*</span>
                  </label>
                  <div className="password-input-wrapper">
                    <input
                      type={mostrarPassword ? 'text' : 'password'}
                      name="password"
                      placeholder="Mínimo 6 caracteres"
                      className={`form-input ${errores.password ? "campo-error" : ""}`}
                      value={formData.password}
                      onChange={handleChange}
                      required
                    />
                    <button
                      type="button"
                      className="btn-toggle-eye"
                      onClick={() => setMostrarPassword(!mostrarPassword)}
                      aria-label="Mostrar u ocultar contraseña"
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
                  </div>
                  {errores.password && <span className="error-msg">{errores.password}</span>}
                </div>

                <div className="form-group password-group">
                  <label className="form-label">
                    Repetir Contraseña <span className="asterisk">*</span>
                  </label>
                  <div className="password-input-wrapper">
                    <input
                      type={mostrarPassword ? 'text' : 'password'}
                      name="repetirPassword"
                      placeholder="Repite tu contraseña"
                      className={`form-input ${errores.repetirPassword ? "campo-error" : ""}`}
                      value={formData.repetirPassword}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  {errores.repetirPassword && <span className="error-msg">{errores.repetirPassword}</span>}
                </div>
              </div>

              {/* Botón Principal de Enviar */}
              <button type="submit" className="crear-cuenta-btn" disabled={cargando}>
                <span>{cargando ? 'CREANDO CUENTA...' : 'Crear Cuenta'}</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2.5}
                  stroke="currentColor"
                  className="btn-arrow-icon"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                </svg>
              </button>
            </form>
          )}

          {/* Enlace para ir al Inicio de Sesión */}
          <div className="crear-cuenta-footer">
            <span>¿Ya tienes una cuenta? </span>
            <Link to="/inicio-sesion" className="link-iniciar-sesion">
              Iniciar sesión
            </Link>
          </div>
        </div>

        {/* Panel Derecho: Espacio para la Imagen Hero Decorativa */}
        <div className="crear-cuenta-right-panel">
          <div className="crear-cuenta-img-container">
            {!imgError ? (
              <img
                src="/src/imagenes/registro-hero.jpg"
                alt="Haz de tu hogar tu mejor versión"
                className="crear-cuenta-hero-img"
                onError={() => setImgError(true)}
              />
            ) : (
              /* Fallback elegante con la imagen hero por defecto de la aplicación */
              <div className="crear-cuenta-hero-fallback" />
            )}
            <div className="hero-gradient-overlay" />

            {/* Texto superpuesto en la imagen derecha */}
            <div className="hero-text-content">
              <h2 className="hero-title">
                Haz de tu hogar<br />tu mejor versión.
              </h2>
              <p className="hero-description">
                Descubre herramientas, muebles y decoración de diseño para cada espacio de tu vida.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CrearCuenta;

