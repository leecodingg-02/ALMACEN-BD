import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { crearOrden } from "../servicios/ordenes";
import { obtenerTotalCarrito } from "../servicios/carrito";
import { formatearPrecio } from "./Productos";
import "./Checkout.css";

/* Lista de departamentos — coincide con el ENUM de la tabla ubicacion */
const DEPARTAMENTOS = [
  "Amazonas", "Antioquia", "Arauca", "Atlántico", "Bogotá D.C.", "Bolívar",
  "Boyacá", "Caldas", "Caquetá", "Casanare", "Cauca", "Cesar", "Chocó",
  "Córdoba", "Cundinamarca", "Guainía", "Guaviare", "Huila", "La Guajira",
  "Magdalena", "Meta", "Nariño", "Norte de Santander", "Putumayo", "Quindío",
  "Risaralda", "San Andrés y Providencia", "Santander", "Sucre", "Tolima",
  "Valle del Cauca", "Vaupés", "Vichada",
];

/**
 * Checkout
 * Formulario de datos de envío con validaciones.
 * Al confirmar, crea la orden (mock) y redirige a /confirmacion.
 *
 * Campos alineados a las tablas:
 *  - usuario  : nombre, apellido, tipo_doc, num_ident, telefono, correo
 *  - ubicacion: departamento, ciudad, direccion
 */
const Checkout = ({ carrito: carrritoProp, onLimpiarCarrito }) => {
  const navigate = useNavigate();
  const location = useLocation();

  /* El carrito puede venir por state (desde Carrito.jsx) o por prop */
  const carrito = location.state?.carrito || carrritoProp || [];
  const total = obtenerTotalCarrito(carrito);

  /* Estado del formulario */
  const [form, setForm] = useState({
    nombre: "",
    apellido: "",
    tipoDoc: "C.C",
    numIdent: "",
    telefono: "",
    correo: "",
    departamento: "",
    ciudad: "",
    direccion: "",
  });

  /* Errores de validación */
  const [errores, setErrores] = useState({});

  /* Estado de envío */
  const [enviando, setEnviando] = useState(false);

  /* ---- Validaciones ---- */

  /* Solo letras y espacios */
  const soloLetras = (valor) => /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/.test(valor);

  /* Solo dígitos */
  const soloDigitos = (valor) => /^\d+$/.test(valor);

  /* Correo válido */
  const correoValido = (valor) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor);

  const validarFormulario = () => {
    const nuevosErrores = {};

    /* Nombre — obligatorio, solo letras */
    if (!form.nombre.trim()) {
      nuevosErrores.nombre = "El nombre es obligatorio.";
    } else if (!soloLetras(form.nombre)) {
      nuevosErrores.nombre = "El nombre solo puede contener letras.";
    }

    /* Apellido — obligatorio, solo letras */
    if (!form.apellido.trim()) {
      nuevosErrores.apellido = "El apellido es obligatorio.";
    } else if (!soloLetras(form.apellido)) {
      nuevosErrores.apellido = "El apellido solo puede contener letras.";
    }

    /* Número de identificación — obligatorio, solo dígitos */
    if (!form.numIdent.trim()) {
      nuevosErrores.numIdent = "El número de identificación es obligatorio.";
    } else if (!soloDigitos(form.numIdent)) {
      nuevosErrores.numIdent = "Solo se permiten dígitos.";
    }

    /* Teléfono — obligatorio, solo dígitos */
    if (!form.telefono.trim()) {
      nuevosErrores.telefono = "El teléfono es obligatorio.";
    } else if (!soloDigitos(form.telefono)) {
      nuevosErrores.telefono = "Solo se permiten dígitos.";
    }

    /* Correo — obligatorio, formato válido */
    if (!form.correo.trim()) {
      nuevosErrores.correo = "El correo es obligatorio.";
    } else if (!correoValido(form.correo)) {
      nuevosErrores.correo = "Ingresa un correo válido.";
    }

    /* Departamento — obligatorio */
    if (!form.departamento) {
      nuevosErrores.departamento = "Selecciona un departamento.";
    }

    /* Ciudad — obligatoria, solo letras */
    if (!form.ciudad.trim()) {
      nuevosErrores.ciudad = "La ciudad es obligatoria.";
    } else if (!soloLetras(form.ciudad)) {
      nuevosErrores.ciudad = "La ciudad solo puede contener letras.";
    }

    /* Dirección — obligatoria */
    if (!form.direccion.trim()) {
      nuevosErrores.direccion = "La dirección es obligatoria.";
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  /* ---- Handlers ---- */

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    /* Limpiar el error del campo al editar */
    if (errores[name]) {
      setErrores((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validarFormulario()) return;

    setEnviando(true);

    const { idOrden, orden } = await crearOrden({
      carrito,
      cliente: {
        nombre: form.nombre,
        apellido: form.apellido,
        tipo_doc: form.tipoDoc,
        num_ident: form.numIdent,
        telefono: form.telefono,
        correo: form.correo,
        departamento: form.departamento,
        ciudad: form.ciudad,
        direccion: form.direccion,
      },
    });

    if (typeof onLimpiarCarrito === 'function') {
      onLimpiarCarrito();
    }
    localStorage.removeItem("almacenweb_carrito");

    /* Redirigir a la página de confirmación */
    navigate("/confirmacion", {
      state: { idOrden, orden, carrito },
    });
  };

  /* Si no hay productos, redirigir al catálogo */
  if (carrito.length === 0) {
    return (
      <main className="pagina-checkout checkout-vacio">
        <h1>No hay productos en tu carrito</h1>
        <Link to="/productos" className="boton-carrito">
          Ver productos
        </Link>
      </main>
    );
  }

  return (
    <main className="pagina-checkout">
      {/* Cabecera */}
      <div className="checkout-cabecera">
        <span className="checkout-kicker">CHECKOUT</span>
        <h1>Datos de envío</h1>
      </div>

      <div className="checkout-contenido">
        {/* Formulario */}
        <form className="checkout-form" onSubmit={handleSubmit} noValidate>
          {/* Nombre */}
          <div className="campo-grupo">
            <label htmlFor="nombre">Nombre *</label>
            <input
              id="nombre"
              name="nombre"
              type="text"
              value={form.nombre}
              onChange={handleChange}
              placeholder="Ej: Juan"
              className={errores.nombre ? "campo-error" : ""}
            />
            {errores.nombre && <span className="error-msg">{errores.nombre}</span>}
          </div>

          {/* Apellido */}
          <div className="campo-grupo">
            <label htmlFor="apellido">Apellido *</label>
            <input
              id="apellido"
              name="apellido"
              type="text"
              value={form.apellido}
              onChange={handleChange}
              placeholder="Ej: Pérez"
              className={errores.apellido ? "campo-error" : ""}
            />
            {errores.apellido && <span className="error-msg">{errores.apellido}</span>}
          </div>

          {/* Tipo y número de documento */}
          <div className="campo-fila">
            <div className="campo-grupo campo-tipo-doc">
              <label htmlFor="tipoDoc">Tipo doc. *</label>
              <select
                id="tipoDoc"
                name="tipoDoc"
                value={form.tipoDoc}
                onChange={handleChange}
              >
                <option value="C.C">C.C</option>
                <option value="C.E">C.E</option>
                <option value="NIT">NIT</option>
                <option value="PAS">PAS</option>
              </select>
            </div>

            <div className="campo-grupo campo-num-ident">
              <label htmlFor="numIdent">N.° Identificación *</label>
              <input
                id="numIdent"
                name="numIdent"
                type="text"
                inputMode="numeric"
                value={form.numIdent}
                onChange={handleChange}
                placeholder="Ej: 1234567890"
                className={errores.numIdent ? "campo-error" : ""}
              />
              {errores.numIdent && <span className="error-msg">{errores.numIdent}</span>}
            </div>
          </div>

          {/* Teléfono */}
          <div className="campo-grupo">
            <label htmlFor="telefono">Teléfono *</label>
            <input
              id="telefono"
              name="telefono"
              type="tel"
              inputMode="numeric"
              value={form.telefono}
              onChange={handleChange}
              placeholder="Ej: 3001234567"
              className={errores.telefono ? "campo-error" : ""}
            />
            {errores.telefono && <span className="error-msg">{errores.telefono}</span>}
          </div>

          {/* Correo */}
          <div className="campo-grupo">
            <label htmlFor="correo">Correo electrónico *</label>
            <input
              id="correo"
              name="correo"
              type="email"
              value={form.correo}
              onChange={handleChange}
              placeholder="Ej: correo@ejemplo.com"
              className={errores.correo ? "campo-error" : ""}
            />
            {errores.correo && <span className="error-msg">{errores.correo}</span>}
          </div>

          {/* Departamento */}
          <div className="campo-grupo">
            <label htmlFor="departamento">Departamento *</label>
            <select
              id="departamento"
              name="departamento"
              value={form.departamento}
              onChange={handleChange}
              className={errores.departamento ? "campo-error" : ""}
            >
              <option value="">Selecciona un departamento</option>
              {DEPARTAMENTOS.map((dep) => (
                <option key={dep} value={dep}>{dep}</option>
              ))}
            </select>
            {errores.departamento && <span className="error-msg">{errores.departamento}</span>}
          </div>

          {/* Ciudad */}
          <div className="campo-grupo">
            <label htmlFor="ciudad">Ciudad *</label>
            <input
              id="ciudad"
              name="ciudad"
              type="text"
              value={form.ciudad}
              onChange={handleChange}
              placeholder="Ej: Bogotá"
              className={errores.ciudad ? "campo-error" : ""}
            />
            {errores.ciudad && <span className="error-msg">{errores.ciudad}</span>}
          </div>

          {/* Dirección */}
          <div className="campo-grupo">
            <label htmlFor="direccion">Dirección *</label>
            <input
              id="direccion"
              name="direccion"
              type="text"
              value={form.direccion}
              onChange={handleChange}
              placeholder="Ej: Calle 123 #45-67"
              className={errores.direccion ? "campo-error" : ""}
            />
            {errores.direccion && <span className="error-msg">{errores.direccion}</span>}
          </div>

          {/* Botón confirmar */}
          <button
            type="submit"
            className="boton-carrito boton-comprar"
            disabled={enviando}
          >
            {enviando ? "Procesando..." : "Confirmar compra"}
          </button>
        </form>

        {/* Resumen del pedido (lateral) */}
        <aside className="checkout-resumen">
          <h2>Tu pedido</h2>
          <ul className="checkout-lista-productos">
            {carrito.map((linea) => (
              <li key={linea.id_pro}>
                <div className="checkout-producto-info">
                  <span className="checkout-producto-nombre">{linea.nombre}</span>
                  <span className="checkout-producto-cant">× {linea.cantidad}</span>
                </div>
                <span className="checkout-producto-precio">
                  {formatearPrecio(linea.precio_unitario * linea.cantidad)}
                </span>
              </li>
            ))}
          </ul>
          <div className="checkout-total">
            <span>Total</span>
            <strong>{formatearPrecio(total)}</strong>
          </div>
        </aside>
      </div>
    </main>
  );
};

export default Checkout;
