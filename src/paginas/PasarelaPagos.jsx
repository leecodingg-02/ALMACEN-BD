import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { obtenerTotalCarrito } from '../servicios/carrito';
import { crearOrden } from '../servicios/ordenes';
import { formatearPrecio } from './Productos';
import { useAvisoSesion } from '../contextos/AvisoSesionContext';
import './PasarelaPagos.css';

/* Departamentos de Colombia */
const DEPARTAMENTOS = [
  "Amazonas", "Antioquia", "Arauca", "Atlántico", "Bogotá D.C.", "Bolívar",
  "Boyacá", "Caldas", "Caquetá", "Casanare", "Cauca", "Cesar", "Chocó",
  "Córdoba", "Cundinamarca", "Guainía", "Guaviare", "Huila", "La Guajira",
  "Magdalena", "Meta", "Nariño", "Norte de Santander", "Putumayo", "Quindío",
  "Risaralda", "San Andrés y Providencia", "Santander", "Sucre", "Tolima",
  "Valle del Cauca", "Vaupés", "Vichada"
];

/* Bancos para PSE */
const BANCOS_PSE = [
  "Bancolombia",
  "Banco de Bogotá",
  "Davivienda",
  "BBVA Colombia",
  "Banco de Occidente",
  "Banco Popular",
  "Scotiabank Colpatria",
  "Banco AV Villas",
  "Nequi",
  "Daviplata",
  "Banco Caja Social",
  "Banco Agrario de Colombia"
];

export default function PasarelaPagos({ usuario, carrito: carritoProp, onLimpiarCarrito }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { mostrarAvisoSesion } = useAvisoSesion();

  const carrito = location.state?.carrito || carritoProp || [];
  const total = obtenerTotalCarrito(carrito);

  /* Si el usuario no está autenticado, activar aviso flotante */
  useEffect(() => {
    if (!usuario) {
      mostrarAvisoSesion('realizar una compra en la pasarela de pagos', 'pagos');
    }
  }, [usuario, mostrarAvisoSesion]);

  /* Método de pago seleccionado: 'tarjeta' | 'pse' | 'nequi' | 'contraentrega' */
  const [metodoPago, setMetodoPago] = useState('tarjeta');

  /* Formulario de envío y facturación */
  const [formEnvio, setFormEnvio] = useState({
    nombre: usuario?.nombre || '',
    apellido: usuario?.apellido || '',
    tipo_doc: usuario?.tipo_doc || 'C.C',
    num_ident: usuario?.num_ident || '',
    telefono: usuario?.telefono || '',
    correo: usuario?.correo || '',
    departamento: 'Bogotá D.C.',
    ciudad: 'Bogotá',
    direccion: ''
  });

  /* Actualizar datos si llega el usuario cargado */
  useEffect(() => {
    if (usuario) {
      setFormEnvio((prev) => ({
        ...prev,
        nombre: usuario.nombre || prev.nombre,
        apellido: usuario.apellido || prev.apellido,
        tipo_doc: usuario.tipo_doc || prev.tipo_doc,
        num_ident: usuario.num_ident || prev.num_ident,
        telefono: usuario.telefono || prev.telefono,
        correo: usuario.correo || prev.correo
      }));
    }
  }, [usuario]);

  /* Formulario de Tarjeta */
  const [formTarjeta, setFormTarjeta] = useState({
    numero: '',
    titular: '',
    expiraMes: '08',
    expiraAno: '28',
    cvv: '',
    cuotas: '1'
  });

  /* Formulario de PSE */
  const [formPse, setFormPse] = useState({
    banco: 'Bancolombia',
    tipoPersona: 'Natural',
    emailPse: usuario?.correo || ''
  });

  /* Formulario de Billetera Móvil (Nequi / Daviplata) */
  const [formBilletera, setFormBilletera] = useState({
    tipo: 'Nequi',
    celular: usuario?.telefono || ''
  });

  /* Estados de procesamiento */
  const [procesando, setProcesando] = useState(false);
  const [etapaProceso, setEtapaProceso] = useState('');
  const [errorValidacion, setErrorValidacion] = useState('');

  /* Detección de franquicia de tarjeta */
  const detectarFranquicia = (num) => {
    const limpio = num.replace(/\s+/g, '');
    if (/^4/.test(limpio)) return 'VISA';
    if (/^5[1-5]/.test(limpio) || /^2[2-7]/.test(limpio)) return 'MASTERCARD';
    if (/^3[47]/.test(limpio)) return 'AMEX';
    if (/^6(?:011|5)/.test(limpio)) return 'DISCOVER';
    return 'TARJETA';
  };

  /* Formatear número de tarjeta con espacios cada 4 dígitos */
  const formatearNumeroTarjeta = (valor) => {
    const limpio = valor.replace(/\D/g, '').slice(0, 16);
    return limpio.replace(/(\d{4})(?=\d)/g, '$1 ');
  };

  /* Manejador de campos de envío */
  const handleEnvioChange = (e) => {
    const { name, value } = e.target;
    setFormEnvio((prev) => ({ ...prev, [name]: value }));
    setErrorValidacion('');
  };

  /* Manejador de tarjeta */
  const handleTarjetaChange = (e) => {
    const { name, value } = e.target;
    if (name === 'numero') {
      setFormTarjeta((prev) => ({ ...prev, numero: formatearNumeroTarjeta(value) }));
    } else if (name === 'cvv') {
      const limpio = value.replace(/\D/g, '').slice(0, 4);
      setFormTarjeta((prev) => ({ ...prev, cvv: limpio }));
    } else {
      setFormTarjeta((prev) => ({ ...prev, [name]: value }));
    }
    setErrorValidacion('');
  };

  /* Procesar el pago con simulación de pasarela segura */
  const handleSubmitPago = async (e) => {
    e.preventDefault();
    setErrorValidacion('');

    if (!usuario) {
      mostrarAvisoSesion('realizar una compra en la pasarela de pagos', 'pagos');
      return;
    }

    if (carrito.length === 0) {
      setErrorValidacion('Tu carrito está vacío. Agrega productos para procesar el pago.');
      return;
    }

    // Validar datos de envío
    if (!formEnvio.nombre.trim() || !formEnvio.apellido.trim() || !formEnvio.num_ident.trim() ||
        !formEnvio.telefono.trim() || !formEnvio.correo.trim() || !formEnvio.direccion.trim() || !formEnvio.ciudad.trim()) {
      setErrorValidacion('Por favor completa todos los datos obligatorios de envío y facturación (*)');
      return;
    }

    // Validar según método
    if (metodoPago === 'tarjeta') {
      const numLimpio = formTarjeta.numero.replace(/\s+/g, '');
      if (numLimpio.length < 15) {
        setErrorValidacion('Ingresa un número de tarjeta válido (15 o 16 dígitos)');
        return;
      }
      if (!formTarjeta.titular.trim()) {
        setErrorValidacion('Ingresa el nombre del titular tal como figura en la tarjeta');
        return;
      }
      if (formTarjeta.cvv.length < 3) {
        setErrorValidacion('Ingresa un código de seguridad CVV válido (3 o 4 dígitos)');
        return;
      }
    } else if (metodoPago === 'pse') {
      if (!formPse.emailPse.trim()) {
        setErrorValidacion('Ingresa el correo electrónico registrado en PSE');
        return;
      }
    } else if (metodoPago === 'nequi') {
      if (formBilletera.celular.replace(/\D/g, '').length < 10) {
        setErrorValidacion('Ingresa un número de celular válido para la confirmación de la billetera');
        return;
      }
    }

    // Iniciar flujo de procesamiento
    setProcesando(true);
    setEtapaProceso('1. Cifrando datos con protocolo SSL 256 bits...');

    setTimeout(() => {
      setEtapaProceso('2. Conectando con la red bancaria y autorizando transacción...');
    }, 1200);

    setTimeout(async () => {
      setEtapaProceso('3. Registrando orden y actualizando inventario en MySQL...');
      try {
        const clienteOrden = {
          ...formEnvio,
          id_usu: usuario.id_usu,
          metodoPago: metodoPago === 'tarjeta' ? 'Tarjeta de Crédito' :
                      metodoPago === 'pse' ? `PSE (${formPse.banco})` :
                      metodoPago === 'nequi' ? formBilletera.tipo : 'Contra Entrega'
        };

        const { idOrden, orden } = await crearOrden({
          carrito,
          cliente: clienteOrden
        });

        // Limpiar carrito
        if (typeof onLimpiarCarrito === 'function') {
          onLimpiarCarrito();
        }
        localStorage.removeItem('almacenweb_carrito');

        setProcesando(false);

        // Redirigir a confirmación con datos de la orden
        navigate('/confirmacion', {
          state: { idOrden, orden, carrito }
        });
      } catch (err) {
        console.error('Error registrando orden:', err);
        setProcesando(false);
        setErrorValidacion('Ocurrió un error al procesar el pago o registrar la venta en la base de datos.');
      }
    }, 2500);
  };

  /* Si el usuario no ha iniciado sesión, mostrar pantalla de bloqueo con aviso */
  if (!usuario) {
    return (
      <main className="pagina-pasarela pasarela-bloqueada">
        <div className="tarjeta-bloqueo-pasarela">
          <div className="icono-bloqueo-candado">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.8" stroke="currentColor" className="svg-candado">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
            </svg>
          </div>
          <span className="pasarela-kicker">PASARELA DE PAGO SEGURA</span>
          <h1>Acceso Seguro Requerido</h1>
          <p className="descripcion-bloqueo">
            Por políticas de seguridad, trazabilidad de envíos y facturación electrónica, debes iniciar sesión con tu cuenta registrada para procesar tu orden y realizar el pago.
          </p>
          <div className="pasarela-acciones-bloqueo">
            <Link to="/inicio-sesion" className="boton-primario-pasarela">
              Iniciar Sesión
            </Link>
            <Link to="/crear-cuenta" className="boton-secundario-pasarela">
              Crear Nueva Cuenta
            </Link>
          </div>
        </div>
      </main>
    );
  }

  /* Si el carrito está vacío */
  if (carrito.length === 0) {
    return (
      <main className="pagina-pasarela pasarela-vacia">
        <div className="tarjeta-bloqueo-pasarela">
          <div className="icono-bloqueo-candado">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" width="48" height="48">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
            </svg>
          </div>
          <span className="pasarela-kicker">PASARELA DE PAGO</span>
          <h1>No hay productos en el carrito</h1>
          <p className="descripcion-bloqueo">
            Agrega productos a tu carrito de compras antes de proceder al pago seguro.
          </p>
          <Link to="/productos" className="boton-primario-pasarela">
            Explorar Catálogo
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="pagina-pasarela">
      {/* Banner de Seguridad Superior */}
      <div className="pasarela-barra-seguridad">
        <div className="seguridad-badge">
          <span className="punto-verde" />
          <span>Conexión Encriptada TLS 1.3 • Certificado SSL 256-bit</span>
        </div>
        <div className="seguridad-usuario">
          Comprando como: <strong>{usuario.nombre} {usuario.apellido}</strong> ({usuario.correo})
        </div>
      </div>

      <div className="pasarela-cabecera">
        <span className="pasarela-kicker">CHECKOUT &amp; CHECKIN</span>
        <h1>Pasarela de Pagos NovaCasa</h1>
        <p className="pasarela-subtitulo">Completa tu información y elige tu método de pago preferido para finalizar tu compra.</p>
      </div>

      {errorValidacion && (
        <div className="pasarela-alerta-error" role="alert">
          <span className="alerta-error-icono">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" width="20" height="20">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
          </span>
          <span>{errorValidacion}</span>
        </div>
      )}

      <form onSubmit={handleSubmitPago} noValidate className="pasarela-grilla-principal">
        {/* Columna Izquierda: Datos y Métodos de Pago */}
        <div className="pasarela-columna-formulario">
          {/* PASO 1: Datos de Envío y Facturación */}
          <section className="pasarela-seccion-card">
            <div className="seccion-card-encabezado">
              <span className="seccion-paso-numero">1</span>
              <div>
                <h2>Datos de Envío y Facturación</h2>
                <p>Información para el despacho y emisión de la factura de venta</p>
              </div>
            </div>

            <div className="campos-grilla-dos">
              <div className="campo-grupo-pasarela">
                <label>Nombre *</label>
                <input
                  type="text"
                  name="nombre"
                  value={formEnvio.nombre}
                  onChange={handleEnvioChange}
                  placeholder="Ej: Laura"
                  required
                />
              </div>

              <div className="campo-grupo-pasarela">
                <label>Apellido *</label>
                <input
                  type="text"
                  name="apellido"
                  value={formEnvio.apellido}
                  onChange={handleEnvioChange}
                  placeholder="Ej: Restrepo"
                  required
                />
              </div>
            </div>

            <div className="campos-grilla-dos">
              <div className="campo-grupo-pasarela">
                <label>Tipo de Documento *</label>
                <select name="tipo_doc" value={formEnvio.tipo_doc} onChange={handleEnvioChange}>
                  <option value="C.C">Cédula de Ciudadanía (C.C)</option>
                  <option value="C.E">Cédula de Extranjería (C.E)</option>
                  <option value="NIT">NIT</option>
                  <option value="PAS">Pasaporte (PAS)</option>
                </select>
              </div>

              <div className="campo-grupo-pasarela">
                <label>Número de Documento *</label>
                <input
                  type="text"
                  name="num_ident"
                  value={formEnvio.num_ident}
                  onChange={handleEnvioChange}
                  placeholder="Ej: 1020304050"
                  required
                />
              </div>
            </div>

            <div className="campos-grilla-dos">
              <div className="campo-grupo-pasarela">
                <label>Correo Electrónico *</label>
                <input
                  type="email"
                  name="correo"
                  value={formEnvio.correo}
                  onChange={handleEnvioChange}
                  placeholder="correo@ejemplo.com"
                  required
                />
              </div>

              <div className="campo-grupo-pasarela">
                <label>Teléfono Celular *</label>
                <input
                  type="tel"
                  name="telefono"
                  value={formEnvio.telefono}
                  onChange={handleEnvioChange}
                  placeholder="Ej: 3101234567"
                  required
                />
              </div>
            </div>

            <div className="campos-grilla-dos">
              <div className="campo-grupo-pasarela">
                <label>Departamento *</label>
                <select name="departamento" value={formEnvio.departamento} onChange={handleEnvioChange}>
                  {DEPARTAMENTOS.map((dep) => (
                    <option key={dep} value={dep}>{dep}</option>
                  ))}
                </select>
              </div>

              <div className="campo-grupo-pasarela">
                <label>Ciudad / Municipio *</label>
                <input
                  type="text"
                  name="ciudad"
                  value={formEnvio.ciudad}
                  onChange={handleEnvioChange}
                  placeholder="Ej: Bogotá"
                  required
                />
              </div>
            </div>

            <div className="campo-grupo-pasarela ancho-completo">
              <label>Dirección de Entrega *</label>
              <input
                type="text"
                name="direccion"
                value={formEnvio.direccion}
                onChange={handleEnvioChange}
                placeholder="Ej: Carrera 15 # 85-32 Apto 401"
                required
              />
            </div>
          </section>

          {/* PASO 2: Selección de Método de Pago */}
          <section className="pasarela-seccion-card">
            <div className="seccion-card-encabezado">
              <span className="seccion-paso-numero">2</span>
              <div>
                <h2>Método de Pago</h2>
                <p>Selecciona tu forma de pago preferida 100% segura</p>
              </div>
            </div>

            {/* Pestañas de Métodos */}
            <div className="pasarela-tabs-metodos">
              <button
                type="button"
                className={`tab-metodo ${metodoPago === 'tarjeta' ? 'activo' : ''}`}
                onClick={() => setMetodoPago('tarjeta')}
              >
                <span className="tab-metodo-icono">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" width="22" height="22">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
                  </svg>
                </span>
                <span className="tab-metodo-nombre">Tarjeta Crédito / Débito</span>
              </button>

              <button
                type="button"
                className={`tab-metodo ${metodoPago === 'pse' ? 'activo' : ''}`}
                onClick={() => setMetodoPago('pse')}
              >
                <span className="tab-metodo-icono">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" width="22" height="22">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z" />
                  </svg>
                </span>
                <span className="tab-metodo-nombre">Transferencia PSE</span>
              </button>

              <button
                type="button"
                className={`tab-metodo ${metodoPago === 'nequi' ? 'activo' : ''}`}
                onClick={() => setMetodoPago('nequi')}
              >
                <span className="tab-metodo-icono">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" width="22" height="22">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-6 18.75h6" />
                  </svg>
                </span>
                <span className="tab-metodo-nombre">Nequi / Daviplata</span>
              </button>

              <button
                type="button"
                className={`tab-metodo ${metodoPago === 'contraentrega' ? 'activo' : ''}`}
                onClick={() => setMetodoPago('contraentrega')}
              >
                <span className="tab-metodo-icono">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" width="22" height="22">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
                  </svg>
                </span>
                <span className="tab-metodo-nombre">Contra Entrega</span>
              </button>
            </div>

            {/* Detalle según método seleccionado */}
            <div className="metodo-detalle-contenedor">
              {/* OPCION 1: TARJETA DE CRÉDITO/DÉBITO */}
              {metodoPago === 'tarjeta' && (
                <div className="detalle-tarjeta-vista">
                  {/* Vista previa animada de la tarjeta */}
                  <div className="tarjeta-visual-preview">
                    <div className="tarjeta-visual-franquicia">
                      {detectarFranquicia(formTarjeta.numero)}
                    </div>
                    <div className="tarjeta-visual-chip" />
                    <div className="tarjeta-visual-numero">
                      {formTarjeta.numero || '•••• •••• •••• ••••'}
                    </div>
                    <div className="tarjeta-visual-footer">
                      <div>
                        <span className="visual-sub">TITULAR</span>
                        <div className="visual-val">
                          {formTarjeta.titular.toUpperCase() || 'NOMBRE APELLIDO'}
                        </div>
                      </div>
                      <div>
                        <span className="visual-sub">EXPIRA</span>
                        <div className="visual-val">
                          {formTarjeta.expiraMes}/{formTarjeta.expiraAno}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Campos de la tarjeta */}
                  <div className="campos-tarjeta-grid">
                    <div className="campo-grupo-pasarela ancho-completo">
                      <label>Número de Tarjeta *</label>
                      <input
                        type="text"
                        name="numero"
                        value={formTarjeta.numero}
                        onChange={handleTarjetaChange}
                        placeholder="4500 0000 0000 0000"
                        maxLength="19"
                        required
                      />
                    </div>

                    <div className="campo-grupo-pasarela ancho-completo">
                      <label>Nombre del Titular *</label>
                      <input
                        type="text"
                        name="titular"
                        value={formTarjeta.titular}
                        onChange={handleTarjetaChange}
                        placeholder="Como figura en la tarjeta"
                        required
                      />
                    </div>

                    <div className="campos-grilla-tres">
                      <div className="campo-grupo-pasarela">
                        <label>Mes *</label>
                        <select name="expiraMes" value={formTarjeta.expiraMes} onChange={handleTarjetaChange}>
                          {Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0')).map((m) => (
                            <option key={m} value={m}>{m}</option>
                          ))}
                        </select>
                      </div>

                      <div className="campo-grupo-pasarela">
                        <label>Año *</label>
                        <select name="expiraAno" value={formTarjeta.expiraAno} onChange={handleTarjetaChange}>
                          {['25', '26', '27', '28', '29', '30', '31', '32'].map((a) => (
                            <option key={a} value={a}>20{a}</option>
                          ))}
                        </select>
                      </div>

                      <div className="campo-grupo-pasarela">
                        <label>CVV / CVC *</label>
                        <input
                          type="password"
                          name="cvv"
                          value={formTarjeta.cvv}
                          onChange={handleTarjetaChange}
                          placeholder="123"
                          maxLength="4"
                          required
                        />
                      </div>
                    </div>

                    <div className="campo-grupo-pasarela ancho-completo">
                      <label>Cuotas de Pago</label>
                      <select name="cuotas" value={formTarjeta.cuotas} onChange={handleTarjetaChange}>
                        <option value="1">1 cuota (Sin interés)</option>
                        <option value="3">3 cuotas</option>
                        <option value="6">6 cuotas</option>
                        <option value="12">12 cuotas</option>
                        <option value="24">24 cuotas</option>
                        <option value="36">36 cuotas</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* OPCION 2: PSE */}
              {metodoPago === 'pse' && (
                <div className="detalle-pse-vista">
                  <div className="pse-banner-info">
                    <img src="/src/imagenes/sitio.png" alt="PSE" className="pse-logo-mini" onError={(e) => { e.target.style.display = 'none'; }} />
                    <div>
                      <strong>Débito en Línea Seguro a través de PSE</strong>
                      <p>Serás conectado con tu entidad bancaria en una pasarela protegida por ACH Colombia.</p>
                    </div>
                  </div>

                  <div className="campo-grupo-pasarela ancho-completo">
                    <label>Selecciona tu Banco *</label>
                    <select
                      value={formPse.banco}
                      onChange={(e) => setFormPse({ ...formPse, banco: e.target.value })}
                    >
                      {BANCOS_PSE.map((b) => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                    </select>
                  </div>

                  <div className="campo-grupo-pasarela ancho-completo">
                    <label>Tipo de Cliente</label>
                    <select
                      value={formPse.tipoPersona}
                      onChange={(e) => setFormPse({ ...formPse, tipoPersona: e.target.value })}
                    >
                      <option value="Natural">Persona Natural</option>
                      <option value="Juridica">Persona Jurídica</option>
                    </select>
                  </div>

                  <div className="campo-grupo-pasarela ancho-completo">
                    <label>Correo Electrónico registrado en PSE *</label>
                    <input
                      type="email"
                      value={formPse.emailPse}
                      onChange={(e) => setFormPse({ ...formPse, emailPse: e.target.value })}
                      placeholder="tunombre@banco.com"
                      required
                    />
                  </div>
                </div>
              )}

              {/* OPCION 3: NEQUI / DAVIPLATA */}
              {metodoPago === 'nequi' && (
                <div className="detalle-billetera-vista">
                  <div className="billetera-selector-tipo">
                    <button
                      type="button"
                      className={`btn-billetera-tipo ${formBilletera.tipo === 'Nequi' ? 'activo' : ''}`}
                      onClick={() => setFormBilletera({ ...formBilletera, tipo: 'Nequi' })}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="#7C3AED" viewBox="0 0 24 24" width="16" height="16"><circle cx="12" cy="12" r="10" /></svg> Nequi
                    </button>
                    <button
                      type="button"
                      className={`btn-billetera-tipo ${formBilletera.tipo === 'Daviplata' ? 'activo' : ''}`}
                      onClick={() => setFormBilletera({ ...formBilletera, tipo: 'Daviplata' })}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="#DC2626" viewBox="0 0 24 24" width="16" height="16"><circle cx="12" cy="12" r="10" /></svg> Daviplata
                    </button>
                  </div>

                  <div className="campo-grupo-pasarela ancho-completo">
                    <label>Número de Teléfono Celular *</label>
                    <input
                      type="tel"
                      value={formBilletera.celular}
                      onChange={(e) => setFormBilletera({ ...formBilletera, celular: e.target.value })}
                      placeholder="Ej: 3101234567"
                      maxLength="10"
                      required
                    />
                  </div>

                  <div className="billetera-instrucciones">
                    <p>
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" width="16" height="16" style={{display:'inline',verticalAlign:'middle',marginRight:'4px'}}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
                      </svg>
                      Al hacer clic en <strong>"Pagar Ahora"</strong>, recibirás una notificación push o SMS en tu app de <strong>{formBilletera.tipo}</strong> para autorizar el débito seguro de <strong>{formatearPrecio(total)}</strong>.
                    </p>
                  </div>
                </div>
              )}

              {/* OPCION 4: CONTRA ENTREGA */}
              {metodoPago === 'contraentrega' && (
                <div className="detalle-contraentrega-vista">
                  <div className="contraentrega-alerta">
                    <span className="icono-efectivo">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" width="28" height="28">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
                      </svg>
                    </span>
                    <div>
                      <strong>Pago en Efectivo Contra Entrega</strong>
                      <p>Pagas en efectivo directamente a la transportadora cuando recibas tu pedido en <strong>{formEnvio.direccion || 'tu dirección'}</strong>.</p>
                      <span className="nota-cambio">Por favor ten preparado el valor exacto de {formatearPrecio(total)} para facilitar la entrega.</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Columna Derecha: Resumen del Pedido y Botón Pagar */}
        <aside className="pasarela-columna-resumen">
          <div className="pasarela-resumen-card">
            <h3>Resumen de tu Compra</h3>

            {/* Lista de productos */}
            <div className="resumen-lista-productos">
              {carrito.map((item) => (
                <div key={item.id_pro} className="resumen-producto-item">
                  <div className="resumen-prod-img-box">
                    <img src={item.imagen || '/src/imagenes/sitio.png'} alt={item.nombre} />
                    <span className="resumen-badge-cant">{item.cantidad}</span>
                  </div>
                  <div className="resumen-prod-detalles">
                    <h4 className="resumen-prod-nombre">{item.nombre}</h4>
                    <span className="resumen-prod-precio">{formatearPrecio(item.precio_unitario)} c/u</span>
                  </div>
                  <strong className="resumen-prod-subtotal">
                    {formatearPrecio(item.precio_unitario * item.cantidad)}
                  </strong>
                </div>
              ))}
            </div>

            {/* Totales */}
            <div className="resumen-totales-tabla">
              <div className="fila-total">
                <span>Subtotal</span>
                <span>{formatearPrecio(total)}</span>
              </div>
              <div className="fila-total">
                <span>Envío a domicilio</span>
                <span className="envio-gratis-badge">GRATIS</span>
              </div>
              <div className="fila-total">
                <span>IVA (19% incluido)</span>
                <span>{formatearPrecio(Math.round(total * 0.19 / 1.19))}</span>
              </div>
              <div className="fila-total total-destacado">
                <span>Total a Pagar</span>
                <strong>{formatearPrecio(total)}</strong>
              </div>
            </div>

            {/* Botón de Pago */}
            <button
              type="submit"
              className="boton-pagar-ahora"
              disabled={procesando}
            >
              {procesando ? (
                <span className="spinner-pago">Procesando pago seguro...</span>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" width="18" height="18" style={{display:'inline',verticalAlign:'middle',marginRight:'6px'}}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                  </svg>
                  Confirmar y Pagar {formatearPrecio(total)} &rarr;
                </>
              )}
            </button>

            {/* Sellos de Confianza */}
            <div className="sellos-confianza-grid">
              <div className="sello-item">
                <span className="sello-icono">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" width="20" height="20">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                  </svg>
                </span>
                <span>Garantía NovaCasa 30 Días</span>
              </div>
              <div className="sello-item">
                <span className="sello-icono">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" width="20" height="20">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                  </svg>
                </span>
                <span>Transacción Encriptada 256-Bit</span>
              </div>
              <div className="sello-item">
                <span className="sello-icono">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" width="20" height="20">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                  </svg>
                </span>
                <span>Despacho Rápido y Seguro</span>
              </div>
            </div>
          </div>
        </aside>
      </form>

      {/* Modal de Simulación de Procesamiento Bancario */}
      {procesando && (
        <div className="modal-procesando-overlay">
          <div className="modal-procesando-caja">
            <div className="loader-bancario-anillo" />
            <h3>Pasarela Bancaria NovaCasa</h3>
            <p className="etapa-proceso-texto">{etapaProceso}</p>
            <span className="aviso-no-cerrar">Por favor no cierres ni recargues esta ventana.</span>
          </div>
        </div>
      )}
    </main>
  );
}
