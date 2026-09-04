import { useState } from 'react';
import { Link } from 'react-router-dom';
import './CrearCuenta.css';

const CrearCuenta = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    tipoDocumento: '',
    documento: '',
    email: '',
    password: ''
  });

  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [errores, setErrores] = useState({});

  /* Validaciones */
  const soloLetras = (valor) => /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/.test(valor);
  const soloDigitos = (valor) => /^\d+$/.test(valor);
  const correoValido = (valor) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor);
  const contraseñaValida = (valor) => {
    // Mínimo 8 caracteres, con mayúscula, minúscula, número y carácter especial
    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(valor);
  };

  const validarFormulario = () => {
    const nuevosErrores = {};

    /* Nombre — obligatorio, solo letras */
    if (!formData.nombre.trim()) {
      nuevosErrores.nombre = "El nombre es obligatorio.";
    } else if (!soloLetras(formData.nombre)) {
      nuevosErrores.nombre = "El nombre solo puede contener letras.";
    }

    /* Apellido — obligatorio, solo letras */
    if (!formData.apellido.trim()) {
      nuevosErrores.apellido = "El apellido es obligatorio.";
    } else if (!soloLetras(formData.apellido)) {
      nuevosErrores.apellido = "El apellido solo puede contener letras.";
    }

    /* Tipo de documento — obligatorio */
    if (!formData.tipoDocumento) {
      nuevosErrores.tipoDocumento = "Selecciona un tipo de documento.";
    }

    /* Documento — obligatorio, solo dígitos */
    if (!formData.documento.trim()) {
      nuevosErrores.documento = "El documento es obligatorio.";
    } else if (!soloDigitos(formData.documento)) {
      nuevosErrores.documento = "Solo se permiten dígitos.";
    }

    /* Email — obligatorio, formato válido */
    if (!formData.email.trim()) {
      nuevosErrores.email = "El correo es obligatorio.";
    } else if (!correoValido(formData.email)) {
      nuevosErrores.email = "Ingresa un correo válido.";
    }

    /* Contraseña — obligatoria, con requisitos de seguridad */
    if (!formData.password.trim()) {
      nuevosErrores.password = "La contraseña es obligatoria.";
    } else if (formData.password.length < 8) {
      nuevosErrores.password = "La contraseña debe tener al menos 8 caracteres.";
    } else if (!contraseñaValida(formData.password)) {
      nuevosErrores.password = "Debe tener mayúscula, minúscula, número y carácter especial (@$!%*?&).";
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

    /* Limpiar error al editar */
    if (errores[name]) {
      setErrores((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validarFormulario()) return;
    console.log('Datos de Registro:', formData);
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

          {/* Formulario de Registro */}
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
                    <option value="" disabled hidden>
                      Seleccionar...
                    </option>
                    <option value="CC">Cédula de Ciudadanía</option>
                    <option value="CE">Cédula de Extranjería</option>
                    <option value="PAS">Pasaporte</option>
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
                  className={`form-input ${errores.documento ? "campo-error" : ""}`}
                  value={formData.documento}
                  onChange={handleChange}
                  required
                />
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
                className="form-input"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            {/* Fila 4: Contraseña */}
            <div className="form-group password-group">
              <label className="form-label">
                Contraseña <span className="asterisk">*</span>
              </label>
              <div className="password-input-wrapper">
                <input
                  type={mostrarPassword ? 'text' : 'password'}
                  name="password"
                  className="form-input"
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
            </div>

            {/* Botón Principal de Enviar */}
            <button type="submit" className="crear-cuenta-btn">
              <span>Crear Cuenta</span>
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
