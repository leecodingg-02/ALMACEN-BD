import { useState } from 'react';
import { Link } from 'react-router-dom';
import Encabezado from '../componentes/Encabezado';
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
  const [logoError, setLogoError] = useState(false);
  const [imgError, setImgError] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Datos de Registro:', formData);
  };

  return (
    <div className="crear-cuenta-page">
      {/* Root de inicio: Encabezado principal del sitio */}
      <Encabezado />

      {/* Seccion principal de registro */}
      <main className="crear-cuenta-container">
        {/* Panel Izquierdo: Formulario */}
        <div className="crear-cuenta-left-panel">
          
          {/* Espacio reservado para la imagen del Logo */}
          <div className="crear-cuenta-logo-wrapper">
            <Link to="/" title="Ir al Inicio (Root)">
              {!logoError ? (
                <img
                  src="/src/imagenes/logo.png"
                  alt="NovaCasa Logo"
                  className="crear-cuenta-logo-img"
                  onError={() => setLogoError(true)}
                />
              ) : (
                /* Fallback en caso de que la imagen del logo aún no esté lista */
                <div className="crear-cuenta-logo-fallback">
                  <div className="logo-icon-box">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#F5B400" className="logo-svg">
                      <path d="M11.47 3.84a.75.75 0 011.06 0l8.69 8.69a.75.75 0 11-1.06 1.06l-.92-.92V19.5a1.5 1.5 0 01-1.5 1.5h-4.5a.75.75 0 01-.75-.75V15h-3v4.75a.75.75 0 01-.75.75H4.5a1.5 1.5 0 01-1.5-1.5V12.67l-.92.92a.75.75 0 01-1.06-1.06l8.69-8.69z" />
                    </svg>
                  </div>
                  <span className="logo-brand-text">NovaCasa</span>
                </div>
              )}
            </Link>
          </div>

          {/* Encabezado del Formulario */}
          <div className="crear-cuenta-header">
            <h1 className="crear-cuenta-title">Crear Cuenta</h1>
            <p className="crear-cuenta-subtitle">
              Únete a NovaCasa y transforma tu hogar hoy mismo.
            </p>
          </div>

          {/* Formulario de Registro */}
          <form onSubmit={handleSubmit} className="crear-cuenta-form">
            {/* Fila 1: Nombre y Apellido */}
            <div className="form-row two-columns">
              <div className="form-group">
                <label className="form-label">
                  Nombre <span className="asterisk">*</span>
                </label>
                <input
                  type="text"
                  name="nombre"
                  className="form-input"
                  value={formData.nombre}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  Apellido <span className="asterisk">*</span>
                </label>
                <input
                  type="text"
                  name="apellido"
                  className="form-input"
                  value={formData.apellido}
                  onChange={handleChange}
                  required
                />
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
                    className="form-select"
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
                    <option value="TI">Tarjeta de Identidad</option>
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
              </div>

              <div className="form-group">
                <label className="form-label">
                  Documento <span className="asterisk">*</span>
                </label>
                <input
                  type="text"
                  name="documento"
                  className="form-input"
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
              <span>CREAR CUENTA</span>
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
