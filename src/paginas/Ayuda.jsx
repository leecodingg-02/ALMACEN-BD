import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { enviarTicketSoporte } from "../servicios/ayuda";
import "./Ayuda.css";

const PREGUNTAS_FRECUENTES_DATA = [
  {
    id: 1,
    categoria: "despachos",
    pregunta: "¿Cuáles son los tiempos de entrega y costos de envío?",
    respuesta:
      "Realizamos despachos a todo el territorio nacional en Colombia. El tiempo estimado de entrega es de 2 a 5 días hábiles en ciudades principales (Bogotá, Medellín, Cali, Barranquilla) y de 4 a 8 días en otros municipios. ¡En compras superiores a $150.000 COP el envío es completamente GRATIS!",
  },
  {
    id: 2,
    categoria: "despachos",
    pregunta: "¿Cómo puedo rastrear el estado de mi pedido?",
    respuesta:
      "Una vez despachado tu paquete, recibirás una notificación con el número de guía de la transportadora. También puedes consultar el estado en tiempo real desde tu perfil en la sección 'Mis Pedidos'.",
  },
  {
    id: 3,
    categoria: "pagos",
    pregunta: "¿Qué métodos de pago aceptan en NovaCasa?",
    respuesta:
      "Aceptamos Tarjetas de Crédito y Débito (Visa, Mastercard, American Express), transferencias bancarias a través de PSE, Nequi, Daviplata, Efecty y servicio de Pago Contra Entrega en ciudades seleccionadas.",
  },
  {
    id: 4,
    categoria: "pagos",
    pregunta: "¿Los precios incluyen IVA?",
    respuesta:
      "Sí, todos los precios mostrados en la tienda virtual de NovaCasa incluyen el 19% de IVA conforme a la regulación tributaria colombiana.",
  },
  {
    id: 5,
    categoria: "cambios",
    pregunta: "¿Cómo solicito un cambio o devolución de producto?",
    respuesta:
      "Cuentas con 30 días calendario tras recibir tu compra para solicitar cambios o devoluciones por retracto. El producto debe encontrarse sin uso, con sus etiquetas y empaque original intactos.",
  },
  {
    id: 6,
    categoria: "garantias",
    pregunta: "¿Cómo funciona la garantía de herramientas y muebles?",
    respuesta:
      "Todos nuestros productos cuentan con garantía oficial directa. Las herramientas eléctricas poseen 24 meses de garantía, mientras que muebles y decoración tienen 12 meses. Cubrimos fallas técnicas o defectos de fábrica sin costo adicional.",
  },
];

function Ayuda() {
  const [searchParams, setSearchParams] = useSearchParams();
  const seccionUrl = searchParams.get("seccion") || "nosotros";

  const [seccionActiva, setSeccionActiva] = useState(seccionUrl);
  const [busqueda, setBusqueda] = useState("");
  const [faqAbierta, setFaqAbierta] = useState(1);
  const [categoriaFaq, setCategoriaFaq] = useState("todas");

  /* Formulario de Soporte y Validaciones */
  const [formSoporte, setFormSoporte] = useState({
    nombre: "",
    correo: "",
    telefono: "",
    tipoSolicitud: "Garantía o Cambio",
    asunto: "",
    mensaje: "",
  });

  const [erroresForm, setErroresForm] = useState({});
  const [intentadoSubmit, setIntentadoSubmit] = useState(false);
  const [ticketEnviado, setTicketEnviado] = useState(null);

  useEffect(() => {
    if (seccionUrl) {
      setSeccionActiva(seccionUrl);
    }
  }, [seccionUrl]);

  const cambiarSeccion = (clave) => {
    setSeccionActiva(clave);
    setSearchParams({ seccion: clave });
  };

  /* Función de validación del formulario */
  const validarFormulario = () => {
    const nuevosErrores = {};

    if (!formSoporte.nombre.trim()) {
      nuevosErrores.nombre = "El nombre completo es obligatorio.";
    } else if (formSoporte.nombre.trim().length < 3) {
      nuevosErrores.nombre = "El nombre debe tener al menos 3 caracteres.";
    }

    const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formSoporte.correo.trim()) {
      nuevosErrores.correo = "El correo electrónico es obligatorio.";
    } else if (!regexEmail.test(formSoporte.correo.trim())) {
      nuevosErrores.correo = "Ingresa un correo electrónico válido.";
    }

    if (formSoporte.telefono.trim()) {
      const regexTelefono = /^[0-9+\s-]{7,15}$/;
      if (!regexTelefono.test(formSoporte.telefono.trim())) {
        nuevosErrores.telefono = "Ingresa un número telefónico válido (mín. 7 dígitos).";
      }
    }

    if (!formSoporte.asunto.trim()) {
      nuevosErrores.asunto = "El asunto es obligatorio.";
    } else if (formSoporte.asunto.trim().length < 5) {
      nuevosErrores.asunto = "El asunto debe tener al menos 5 caracteres.";
    }

    if (!formSoporte.mensaje.trim()) {
      nuevosErrores.mensaje = "El mensaje o detalle es obligatorio.";
    } else if (formSoporte.mensaje.trim().length < 15) {
      nuevosErrores.mensaje = "Por favor detalla tu mensaje (al menos 15 caracteres).";
    }

    setErroresForm(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleEnviarFormulario = (e) => {
    e.preventDefault();
    setIntentadoSubmit(true);

    if (validarFormulario()) {
      const ticket = enviarTicketSoporte(formSoporte);
      setTicketEnviado(ticket);
      setFormSoporte({
        nombre: "",
        correo: "",
        telefono: "",
        tipoSolicitud: "Garantía o Cambio",
        asunto: "",
        mensaje: "",
      });
      setErroresForm({});
      setIntentadoSubmit(false);
    }
  };

  const handleChangeInput = (campo, valor) => {
    const nuevoEstado = { ...formSoporte, [campo]: valor };
    setFormSoporte(nuevoEstado);

    if (intentadoSubmit) {
      // Re-validar en tiempo real tras primer intento
      const nuevosErrores = { ...erroresForm };
      if (campo === "nombre") {
        if (!valor.trim()) nuevosErrores.nombre = "El nombre completo es obligatorio.";
        else if (valor.trim().length < 3) nuevosErrores.nombre = "El nombre debe tener al menos 3 caracteres.";
        else delete nuevosErrores.nombre;
      }
      if (campo === "correo") {
        const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!valor.trim()) nuevosErrores.correo = "El correo electrónico es obligatorio.";
        else if (!regexEmail.test(valor.trim())) nuevosErrores.correo = "Ingresa un correo electrónico válido.";
        else delete nuevosErrores.correo;
      }
      if (campo === "telefono") {
        if (valor.trim()) {
          const regexTelefono = /^[0-9+\s-]{7,15}$/;
          if (!regexTelefono.test(valor.trim())) nuevosErrores.telefono = "Ingresa un número telefónico válido.";
          else delete nuevosErrores.telefono;
        } else delete nuevosErrores.telefono;
      }
      if (campo === "asunto") {
        if (!valor.trim()) nuevosErrores.asunto = "El asunto es obligatorio.";
        else if (valor.trim().length < 5) nuevosErrores.asunto = "El asunto debe tener al menos 5 caracteres.";
        else delete nuevosErrores.asunto;
      }
      if (campo === "mensaje") {
        if (!valor.trim()) nuevosErrores.mensaje = "El mensaje o detalle es obligatorio.";
        else if (valor.trim().length < 15) nuevosErrores.mensaje = "Por favor detalla tu mensaje (al menos 15 caracteres).";
        else delete nuevosErrores.mensaje;
      }
      setErroresForm(nuevosErrores);
    }
  };

  /* Filtrado de FAQs */
  const faqsFiltradas = PREGUNTAS_FRECUENTES_DATA.filter((faq) => {
    const coincideCat =
      categoriaFaq === "todas" || faq.categoria === categoriaFaq;
    const coincideBusqueda =
      faq.pregunta.toLowerCase().includes(busqueda.toLowerCase()) ||
      faq.respuesta.toLowerCase().includes(busqueda.toLowerCase());
    return coincideCat && coincideBusqueda;
  });

  return (
    <main className="ayuda-pagina">
      {/* Hero Disruptivo */}
      <section className="ayuda-hero-disruptivo">
        <div className="ayuda-hero-contenido">
          <div className="hero-kicker">
            <span className="badge-kicker">Centro de Atención</span>
            <span className="badge-kicker-destacado">Soporte & Legal</span>
          </div>

          <h1 className="hero-disruptivo-titulo">
            Centro de <span>Ayuda</span>
          </h1>

          <p className="hero-disruptivo-subtitulo">
            Encuentra respuestas inmediatas a tus preguntas sobre despachos,
            garantías, políticas de privacidad y términos de compra en NovaCasa.
          </p>

          {/* Buscador Integrado */}
          <div className="ayuda-caja-busqueda">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="2"
              stroke="currentColor"
              className="icono-lupa"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
              />
            </svg>
            <input
              type="text"
              className="input-disruptivo"
              placeholder="¿Qué estás buscando? (ej. envíos, garantías, facturación)..."
              value={busqueda}
              onChange={(e) => {
                setBusqueda(e.target.value);
                if (seccionActiva !== "faq") cambiarSeccion("faq");
              }}
            />
            {busqueda && (
              <button
                type="button"
                className="btn-limpiar-disruptivo"
                onClick={() => setBusqueda("")}
              >
                ✕
              </button>
            )}
          </div>
        </div>

        <div className="hero-disruptivo-decoracion">
          <div className="circulo-decorativo"></div>
          <div className="poligono-decorativo"></div>
        </div>
      </section>

      {/* Pestañas con Íconos Vectoriales Heroicons */}
      <div className="ayuda-navegacion-contenedor">
        <div className="ayuda-pestanas">
          {/* Nosotros */}
          <button
            type="button"
            className={`ayuda-pestana-btn ${
              seccionActiva === "nosotros" ? "activo" : ""
            }`}
            onClick={() => cambiarSeccion("nosotros")}
          >
            <svg className="ayuda-heroicon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5s0 0 0 0m3 0h1.5m-4.5 3h1.5m3 0h1.5m-4.5 3h1.5m3 0h1.5m-4.5 3h1.5m3 0h1.5" />
            </svg>
            Nosotros
          </button>

          {/* Términos y Condiciones */}
          <button
            type="button"
            className={`ayuda-pestana-btn ${
              seccionActiva === "terminos" ? "activo" : ""
            }`}
            onClick={() => cambiarSeccion("terminos")}
          >
            <svg className="ayuda-heroicon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
            </svg>
            Términos y Condiciones
          </button>

          {/* Política de Privacidad */}
          <button
            type="button"
            className={`ayuda-pestana-btn ${
              seccionActiva === "privacidad" ? "activo" : ""
            }`}
            onClick={() => cambiarSeccion("privacidad")}
          >
            <svg className="ayuda-heroicon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
            </svg>
            Política de Privacidad
          </button>

          {/* Preguntas Frecuentes */}
          <button
            type="button"
            className={`ayuda-pestana-btn ${
              seccionActiva === "faq" ? "activo" : ""
            }`}
            onClick={() => cambiarSeccion("faq")}
          >
            <svg className="ayuda-heroicon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M12 18h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
            Preguntas Frecuentes
          </button>

          {/* Garantías */}
          <button
            type="button"
            className={`ayuda-pestana-btn ${
              seccionActiva === "garantias" ? "activo" : ""
            }`}
            onClick={() => cambiarSeccion("garantias")}
          >
            <svg className="ayuda-heroicon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751A11.959 11.959 0 0 1 12 2.714Z" />
            </svg>
            Garantías
          </button>

          {/* Contacto y Soporte */}
          <button
            type="button"
            className={`ayuda-pestana-btn ${
              seccionActiva === "contacto" ? "activo" : ""
            }`}
            onClick={() => cambiarSeccion("contacto")}
          >
            <svg className="ayuda-heroicon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-.623 0-1.243-.014-1.86-.041A2.25 2.25 0 0 1 11.89 15v-4.286c0-1.136.847-2.1 1.98-2.193.882-.072 1.776-.11 2.68-.11.904 0 1.798.038 2.68.11ZM3.75 5.25c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-.623 0-1.243-.014-1.86-.041A2.25 2.25 0 0 1 1.89 11.75V7.464c0-1.136.847-2.1 1.98-2.193.882-.072 1.776-.11 2.68-.11.904 0 1.798.038 2.68.11Z" />
            </svg>
            Contacto y Soporte
          </button>
        </div>
      </div>

      {/* Contenido Dinámico */}
      <section className="ayuda-cuerpo-contenedor">
        {/* SECCIÓN 1: NOSOTROS CON ANIMACIÓN DE TARJETAS */}
        {seccionActiva === "nosotros" && (
          <div className="ayuda-seccion-card anima-entrada">
            <div className="seccion-cabecera">
              <span className="badge-seccion">Conócenos</span>
              <h2>Sobre NovaCasa</h2>
              <p className="seccion-bajada">
                Transformamos espacios con calidad, innovación y diseño para cada rincón de tu hogar.
              </p>
            </div>

            <div className="nosotros-grid">
              <div className="nosotros-tarjeta animada-hover destacado-nosotros">
                <div className="nosotros-tarjeta-brillo"></div>
                <div className="nosotros-icono-header">
                  <svg className="icono-nosotros-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm0 0a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                  </svg>
                </div>
                <h3>Nuestra Misión</h3>
                <p>
                  Ofrecer a las familias y profesionales colombianos el catálogo más completo de
                  herramientas, muebles, iluminación y productos de remodelación, respaldado por
                  asesoría experta y garantía de calidad superior.
                </p>
              </div>

              <div className="nosotros-tarjeta animada-hover">
                <div className="nosotros-tarjeta-brillo"></div>
                <div className="nosotros-icono-header">
                  <svg className="icono-nosotros-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.573 16.49 16.638 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                  </svg>
                </div>
                <h3>Nuestra Visión</h3>
                <p>
                  Ser el e-commerce de mejor reputación y cobertura en Colombia para proyectos de
                  hogar, destacándonos por la rapidez de nuestros despachos y la excelencia en el
                  servicio postventa.
                </p>
              </div>

              <div className="nosotros-tarjeta animada-hover">
                <div className="nosotros-tarjeta-brillo"></div>
                <div className="nosotros-icono-header">
                  <svg className="icono-nosotros-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.25h-5.25a2.25 2.25 0 0 0-2.25 2.25v6" />
                  </svg>
                </div>
                <h3>Cobertura Nacional</h3>
                <p>
                  Contamos con centros logísticos en Bogotá, Medellín, Cali y Barranquilla,
                  permitiendo despachos express y entregas seguras en más de 800 municipios.
                </p>
              </div>

              <div className="nosotros-tarjeta animada-hover">
                <div className="nosotros-tarjeta-brillo"></div>
                <div className="nosotros-icono-header">
                  <svg className="icono-nosotros-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                  </svg>
                </div>
                <h3>Valores Fundamentales</h3>
                <ul>
                  <li>✓ Transparencia e integridad en precios y facturación.</li>
                  <li>✓ Innovación en herramientas y acabados sostenibles.</li>
                  <li>✓ Compromiso total con la satisfacción del usuario.</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* SECCIÓN 2: TÉRMINOS Y CONDICIONES */}
        {seccionActiva === "terminos" && (
          <div className="ayuda-seccion-card anima-entrada">
            <div className="seccion-cabecera">
              <span className="badge-seccion">Marco Legal</span>
              <h2>Términos y Condiciones de Uso</h2>
              <p className="seccion-bajada">
                Vigentes a partir de 2026 para todas las compras y navegación en NovaCasa.
              </p>
            </div>

            <div className="legal-contenido">
              <article className="bloque-legal">
                <h3>1. Aspectos Generales y Contrato de Compra</h3>
                <p>
                  El acceso a este portal web y las transacciones efectuadas a través de NovaCasa se
                  rigen por la legislación colombiana (Código de Comercio y Estatuto del Consumidor
                  Ley 1480 de 2011). Al concretar una orden, se entiende formalizada la oferta de
                  compra sujeta a confirmación de inventario y pago.
                </p>
              </article>

              <article className="bloque-legal">
                <h3>2. Precios, Impuestos y Disponibilidad</h3>
                <p>
                  Todos los precios expresados en nuestro catálogo digital incluyen el 19% del
                  Impuesto al Valor Agregado (IVA). Nos reservamos el derecho de modificar precios o
                  descuentos promocionales sin previo aviso, garantizando el valor ofertado al momento
                  de formalizar el pago.
                </p>
              </article>

              <article className="bloque-legal">
                <h3>3. Derecho de Retracto</h3>
                <p>
                  Conforme al Artículo 47 de la Ley 1480 de 2011, el cliente dispone de 5 días hábiles
                  contados a partir de la entrega del producto para ejercer su derecho de retracto.
                  El consumidor deberá devolver el bien en las mismas condiciones en que lo recibió,
                  asumiendo los costos de transporte de retorno.
                </p>
              </article>

              <article className="bloque-legal">
                <h3>4. Responsabilidad y Uso Adecuado</h3>
                <p>
                  Las herramientas de alto rendimiento o uso industrial deben ser operadas siguiendo
                  las recomendaciones del fabricante. NovaCasa no se hace responsable por daños
                  causados por manipulación inadecuada o instalaciones no certificadas.
                </p>
              </article>
            </div>
          </div>
        )}

        {/* SECCIÓN 3: POLÍTICA DE PRIVACIDAD */}
        {seccionActiva === "privacidad" && (
          <div className="ayuda-seccion-card anima-entrada">
            <div className="seccion-cabecera">
              <span className="badge-seccion">Habeas Data</span>
              <h2>Política de Privacidad y Protección de Datos</h2>
              <p className="seccion-bajada">
                Tratamiento seguro de datos personales según la Ley 1581 de 2012.
              </p>
            </div>

            <div className="legal-contenido">
              <article className="bloque-legal">
                <h3>1. Recolección y Finalidad de los Datos</h3>
                <p>
                  NovaCasa recolecta datos como nombre, identificación, correo, teléfono y dirección
                  con el único propósito de procesar despachos, emitir facturación electrónica y
                  brindar soporte técnico de garantías.
                </p>
              </article>

              <article className="bloque-legal">
                <h3>2. Seguridad en las Transacciones</h3>
                <p>
                  Utilizamos protocolos de encriptación SSL/TLS de 256 bits para resguardar la
                  información bancaria y de tarjetas. NovaCasa no almacena claves ni códigos de
                  seguridad CVV en sus servidores.
                </p>
              </article>

              <article className="bloque-legal">
                <h3>3. Derechos del Titular (ARCO)</h3>
                <p>
                  Como titular de los datos, tienes derecho a Conocer, Actualizar, Rectificar y
                  Solicitar la supresión de tu información de nuestras bases de datos en cualquier
                  momento enviando una solicitud a <strong>privacidad@novacasa.com</strong>.
                </p>
              </article>
            </div>
          </div>
        )}

        {/* SECCIÓN 4: PREGUNTAS FRECUENTES (FAQ) CON HICONS */}
        {seccionActiva === "faq" && (
          <div className="ayuda-seccion-card anima-entrada">
            <div className="seccion-cabecera">
              <span className="badge-seccion">Respuesta Inmediata</span>
              <h2>Preguntas Frecuentes</h2>
              <p className="seccion-bajada">
                Haz clic en una pregunta para desplegar su respuesta detallada.
              </p>
            </div>

            {/* Filtro por Categorías FAQ con Heroicons */}
            <div className="faq-categorias-filtro">
              <button
                type="button"
                className={`btn-faq-cat ${categoriaFaq === "todas" ? "activo" : ""}`}
                onClick={() => setCategoriaFaq("todas")}
              >
                Todas
              </button>

              <button
                type="button"
                className={`btn-faq-cat ${categoriaFaq === "despachos" ? "activo" : ""}`}
                onClick={() => setCategoriaFaq("despachos")}
              >
                <svg className="cat-heroicon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.25h-5.25a2.25 2.25 0 0 0-2.25 2.25v6" />
                </svg>
                Despachos
              </button>

              <button
                type="button"
                className={`btn-faq-cat ${categoriaFaq === "pagos" ? "activo" : ""}`}
                onClick={() => setCategoriaFaq("pagos")}
              >
                <svg className="cat-heroicon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 2.25 19.5Z" />
                </svg>
                Pagos
              </button>

              <button
                type="button"
                className={`btn-faq-cat ${categoriaFaq === "cambios" ? "activo" : ""}`}
                onClick={() => setCategoriaFaq("cambios")}
              >
                <svg className="cat-heroicon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
                </svg>
                Cambios
              </button>

              <button
                type="button"
                className={`btn-faq-cat ${categoriaFaq === "garantias" ? "activo" : ""}`}
                onClick={() => setCategoriaFaq("garantias")}
              >
                <svg className="cat-heroicon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751A11.959 11.959 0 0 1 12 2.714Z" />
                </svg>
                Garantías
              </button>
            </div>

            {/* Acordeón de FAQs */}
            <div className="faq-acordeon-lista">
              {faqsFiltradas.length === 0 ? (
                <div className="faq-vacio">
                  <p>No encontramos preguntas que coincidan con tu búsqueda.</p>
                </div>
              ) : (
                faqsFiltradas.map((faq) => {
                  const estaAbierta = faqAbierta === faq.id;

                  return (
                    <div
                      key={faq.id}
                      className={`faq-item ${estaAbierta ? "abierta" : ""}`}
                    >
                      <button
                        type="button"
                        className="faq-pregunta-btn"
                        onClick={() => setFaqAbierta(estaAbierta ? null : faq.id)}
                      >
                        <span className="faq-pregunta-txt">{faq.pregunta}</span>
                        <span className="faq-icono-flecha">
                          {estaAbierta ? "−" : "+"}
                        </span>
                      </button>

                      {estaAbierta && (
                        <div className="faq-respuesta-cuerpo">
                          <p>{faq.respuesta}</p>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* SECCIÓN 5: GARANTÍAS CON HEROICONS */}
        {seccionActiva === "garantias" && (
          <div className="ayuda-seccion-card anima-entrada">
            <div className="seccion-cabecera">
              <span className="badge-seccion">Respaldo Total</span>
              <h2>Políticas de Garantía y Servicio Técnico</h2>
              <p className="seccion-bajada">
                Protegemos tu inversión con cobertura directa de fábrica en todo nuestro catálogo.
              </p>
            </div>

            <div className="garantias-cobertura-grid">
              <div className="garantia-card">
                <div className="garantia-icono-svg-box">
                  <svg className="garantia-svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17 17.25 21A2.652 2.652 0 0 0 21 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 1 1-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 0 0 4.486-4.486c-.053-.615-.3-1.22-.647-1.742" />
                  </svg>
                </div>
                <h3>Herramientas Eléctricas y Manuales</h3>
                <span className="garantia-tiempo">24 Meses de Garantía</span>
                <p>
                  Cubrimos fallas de motor, defectos de ensamblaje, problemas en interruptores y
                  desgaste anormal de componentes internos.
                </p>
              </div>

              <div className="garantia-card">
                <div className="garantia-icono-svg-box">
                  <svg className="garantia-svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                  </svg>
                </div>
                <h3>Muebles y Acabados de Hogar</h3>
                <span className="garantia-tiempo">12 Meses de Garantía</span>
                <p>
                  Garantizamos la estructura de madera, herrajes metálicos, tapizados e
                  impermeabilización contra defectos de fabricación.
                </p>
              </div>

              <div className="garantia-card">
                <div className="garantia-icono-svg-box">
                  <svg className="garantia-svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 0 0 1.5-.189m-1.5.189a6.01 6.01 0 0 1-1.5-.189m3.75 7.478a12.06 12.06 0 0 1-4.5 0m3.75 2.383a14.406 14.406 0 0 1-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 1 0-7.516 0c.85.493 1.508 1.333 1.508 2.316V18" />
                  </svg>
                </div>
                <h3>Iluminación y Domótica</h3>
                <span className="garantia-tiempo">12 Meses de Garantía</span>
                <p>
                  Reposición inmediata por falla en drivers LED, cortocircuitos internos o falta de
                  sincronización en dispositivos inteligentes.
                </p>
              </div>
            </div>

            <div className="pasos-garantia-contenedor">
              <h3>Pasos para Solicitar una Garantía:</h3>
              <ol className="lista-pasos">
                <li>
                  <strong>1. Radica tu solicitud:</strong> Diligencia el formulario de soporte con tu
                  número de factura o cédula.
                </li>
                <li>
                  <strong>2. Diagnóstico técnico:</strong> Nuestro equipo inspecciona las fotos o video
                  del fallo en menos de 24 horas hábiles.
                </li>
                <li>
                  <strong>3. Solución sin costo:</strong> Recogemos el producto en tu domicilio para
                  reparación o reemplazo por uno totalmente nuevo.
                </li>
              </ol>
            </div>
          </div>
        )}

        {/* SECCIÓN 6: CONTACTO Y SOPORTE CON FORMULARIO VALIDADO */}
        {seccionActiva === "contacto" && (
          <div className="ayuda-seccion-card anima-entrada">
            <div className="seccion-cabecera">
              <span className="badge-seccion">Atención Directa</span>
              <h2>Formulario de Contacto y Soporte</h2>
              <p className="seccion-bajada">
                Radica tu inquietud y un asesor especializado te responderá en menos de 2 horas.
              </p>
            </div>

            <div className="contacto-contenedor-grid">
              {/* Información Directa con Heroicons */}
              <div className="contacto-info-tarjeta">
                <h3>Líneas de Atención</h3>
                <p className="contacto-horario">Lunes a Sábado: 8:00 AM - 7:00 PM</p>

                <div className="contacto-item-linea">
                  <div className="icono-contacto-svg-box">
                    <svg className="contacto-svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106a1.125 1.125 0 0 0-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
                    </svg>
                  </div>
                  <div>
                    <strong>Línea Nacional PBX:</strong>
                    <span>(601) 690 324 343</span>
                  </div>
                </div>

                <div className="contacto-item-linea">
                  <div className="icono-contacto-svg-box">
                    <svg className="contacto-svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a.75.75 0 0 1-.816-.98c.245-.635.539-1.258.882-1.854C3.896 16.634 3 14.416 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z" />
                    </svg>
                  </div>
                  <div>
                    <strong>WhatsApp Soporte:</strong>
                    <span>+57 300 123 4567</span>
                  </div>
                </div>

                <div className="contacto-item-linea">
                  <div className="icono-contacto-svg-box">
                    <svg className="contacto-svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                    </svg>
                  </div>
                  <div>
                    <strong>Correo Electrónico:</strong>
                    <span>soporte@novacasa.com</span>
                  </div>
                </div>

                <div className="contacto-item-linea">
                  <div className="icono-contacto-svg-box">
                    <svg className="contacto-svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                    </svg>
                  </div>
                  <div>
                    <strong>Centros de Soporte:</strong>
                    <Link to="/ubicaciones" className="link-sucursales-contacto">
                      Ver nuestras 4 sucursales principales &rarr;
                    </Link>
                  </div>
                </div>
              </div>

              {/* Formulario Validado */}
              <div className="contacto-formulario-caja">
                {ticketEnviado ? (
                  <div className="ticket-exito-card">
                    <div className="icono-check-exito">
                      <svg className="check-svg" viewBox="0 0 24 24" fill="currentColor">
                        <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.74-5.25Z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <h3>¡Ticket Radicado con Éxito!</h3>
                    <p>Hemos generado tu código de atención prioritario:</p>
                    <div className="codigo-ticket">{ticketEnviado.id}</div>
                    <p className="txt-ticket-info">
                      Enviamos un comprobante a <strong>{ticketEnviado.correo}</strong>.
                      Un asesor se pondrá en contacto contigo muy pronto.
                    </p>
                    <button
                      type="button"
                      className="btn-primario-inicio"
                      onClick={() => setTicketEnviado(null)}
                    >
                      Radicar otra consulta
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleEnviarFormulario} className="form-contacto" noValidate>
                    <div className="form-grupo-doble">
                      <div className="form-campo">
                        <label>Nombre Completo *</label>
                        <input
                          type="text"
                          className={erroresForm.nombre ? "input-error" : ""}
                          placeholder="Ej. María Rodríguez"
                          value={formSoporte.nombre}
                          onChange={(e) => handleChangeInput("nombre", e.target.value)}
                        />
                        {erroresForm.nombre && (
                          <span className="msg-error">{erroresForm.nombre}</span>
                        )}
                      </div>

                      <div className="form-campo">
                        <label>Correo Electrónico *</label>
                        <input
                          type="email"
                          className={erroresForm.correo ? "input-error" : ""}
                          placeholder="ejemplo@correo.com"
                          value={formSoporte.correo}
                          onChange={(e) => handleChangeInput("correo", e.target.value)}
                        />
                        {erroresForm.correo && (
                          <span className="msg-error">{erroresForm.correo}</span>
                        )}
                      </div>
                    </div>

                    <div className="form-grupo-doble">
                      <div className="form-campo">
                        <label>Teléfono de Contacto</label>
                        <input
                          type="tel"
                          className={erroresForm.telefono ? "input-error" : ""}
                          placeholder="Ej. 300 123 4567"
                          value={formSoporte.telefono}
                          onChange={(e) => handleChangeInput("telefono", e.target.value)}
                        />
                        {erroresForm.telefono && (
                          <span className="msg-error">{erroresForm.telefono}</span>
                        )}
                      </div>

                      <div className="form-campo">
                        <label>Tipo de Solicitud *</label>
                        <select
                          value={formSoporte.tipoSolicitud}
                          onChange={(e) =>
                            setFormSoporte({
                              ...formSoporte,
                              tipoSolicitud: e.target.value,
                            })
                          }
                        >
                          <option value="Garantía o Cambio">Garantía o Cambio</option>
                          <option value="Estado de Despacho">Estado de Despacho</option>
                          <option value="Facturación Electrónica">
                            Facturación Electrónica
                          </option>
                          <option value="Asesoría de Proyectos">
                            Asesoría de Proyectos
                          </option>
                          <option value="Otra Consulta">Otra Consulta</option>
                        </select>
                      </div>
                    </div>

                    <div className="form-campo">
                      <label>Asunto *</label>
                      <input
                        type="text"
                        className={erroresForm.asunto ? "input-error" : ""}
                        placeholder="Ej. Solicitud de cambio por talla o falla"
                        value={formSoporte.asunto}
                        onChange={(e) => handleChangeInput("asunto", e.target.value)}
                      />
                      {erroresForm.asunto && (
                        <span className="msg-error">{erroresForm.asunto}</span>
                      )}
                    </div>

                    <div className="form-campo">
                      <label>Mensaje o Detalle de la Consulta *</label>
                      <textarea
                        rows="4"
                        className={erroresForm.mensaje ? "input-error" : ""}
                        placeholder="Describe detalladamente tu inquietud o número de pedido (mín. 15 caracteres)..."
                        value={formSoporte.mensaje}
                        onChange={(e) => handleChangeInput("mensaje", e.target.value)}
                      ></textarea>
                      {erroresForm.mensaje && (
                        <span className="msg-error">{erroresForm.mensaje}</span>
                      )}
                    </div>

                    <button type="submit" className="btn-primario-inicio btn-block">
                      Enviar Mensaje y Generar Ticket &rarr;
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}

export default Ayuda;
