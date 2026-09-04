import { useState, useEffect } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { PRODUCTOS_DATA, formatearPrecio } from "./Productos";
import {
  actualizarPerfilUsuario,
  obtenerDireccionesUsuario,
  guardarDireccionUsuario,
  eliminarDireccionUsuario,
  obtenerPedidosUsuario,
  guardarConfiguracionUsuario,
} from "../servicios/usuario";
import "./Usuario.css";

/* Lista de departamentos para las direcciones */
const DEPARTAMENTOS = [
  "Amazonas", "Antioquia", "Arauca", "Atlántico", "Bogotá D.C.", "Bolívar",
  "Boyacá", "Caldas", "Caquetá", "Casanare", "Cauca", "Cesar", "Chocó",
  "Córdoba", "Cundinamarca", "Guainía", "Guaviare", "Huila", "La Guajira",
  "Magdalena", "Meta", "Nariño", "Norte de Santander", "Putumayo", "Quindío",
  "Risaralda", "San Andrés y Providencia", "Santander", "Sucre", "Tolima",
  "Valle del Cauca", "Vaupés", "Vichada",
];

/* Componente Usuario con pestañas y accesibilidad */
const Usuario = ({
  usuario,
  favoritos,
  configuracion,
  onAlternarFavorito,
  onAgregarCarrito,
  onActualizarUsuario,
  onActualizarConfig,
  onAlternarSesion,
}) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  /* Pestaña activa basada en la URL ?tab= o por defecto 'pedidos' */
  const tabInicial = searchParams.get("tab") || "pedidos";
  const [pestanaActiva, setPestanaActiva] = useState(tabInicial);

  /* Sincronizar la pestaña con los cambios en la URL */
  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab) {
      setPestanaActiva(tab);
    }
  }, [searchParams]);

  /* Cambiar pestaña y actualizar la URL */
  const cambiarPestana = (tab) => {
    setPestanaActiva(tab);
    setSearchParams({ tab });
  };

  /* Estados de datos */
  const [ordenes, setOrdenes] = useState([]);
  const [direcciones, setDirecciones] = useState([]);
  const [mensajeExito, setMensajeExito] = useState("");

  /* Formulario de Perfil (Tabla usuario) */
  const [formPerfil, setFormPerfil] = useState({
    nombre: "",
    apellido: "",
    tipo_doc: "C.C",
    num_ident: "",
    telefono: "",
    correo: "",
  });
  const [erroresPerfil, setErroresPerfil] = useState({});

  /* Formulario de Dirección (Tabla ubicacion) */
  const [formDireccion, setFormDireccion] = useState({
    id_ubi: null,
    departamento: "",
    ciudad: "",
    direccion: "",
  });
  const [mostrandoFormDir, setMostrandoFormDir] = useState(false);
  const [erroresDir, setErroresDir] = useState({});

  /* Cargar órdenes y direcciones del usuario directamente desde MySQL */
  useEffect(() => {
    if (usuario?.id_usu) {
      obtenerPedidosUsuario(usuario.id_usu).then((res) => {
        setOrdenes(res || []);
      });
      obtenerDireccionesUsuario(usuario.id_usu).then((res) => {
        setDirecciones(res || []);
      });
    } else {
      setOrdenes([]);
      setDirecciones([]);
    }
  }, [usuario]);

  /* Cargar datos del usuario en el formulario de perfil */
  useEffect(() => {
    if (usuario) {
      setFormPerfil({
        nombre: usuario.nombre || "",
        apellido: usuario.apellido || "",
        tipo_doc: usuario.tipo_doc || "C.C",
        num_ident: usuario.num_ident || "",
        telefono: usuario.telefono || "",
        correo: usuario.correo || "",
      });
    }
  }, [usuario]);

  /* Mostrar un mensaje temporal de éxito */
  const notificarExito = (msg) => {
    setMensajeExito(msg);
    setTimeout(() => setMensajeExito(""), 3500);
  };

  /* Validaciones del perfil */
  const validarPerfil = () => {
    const err = {};
    const soloLetras = (v) => /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/.test(v);
    const soloDigitos = (v) => /^\d+$/.test(v);
    const correoValido = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

    if (!formPerfil.nombre.trim()) err.nombre = "El nombre es obligatorio.";
    else if (!soloLetras(formPerfil.nombre)) err.nombre = "Solo se permiten letras.";

    if (!formPerfil.apellido.trim()) err.apellido = "El apellido es obligatorio.";
    else if (!soloLetras(formPerfil.apellido)) err.apellido = "Solo se permiten letras.";

    if (!formPerfil.num_ident.trim()) err.num_ident = "La identificación es obligatoria.";
    else if (!soloDigitos(formPerfil.num_ident)) err.num_ident = "Solo se permiten números.";

    if (!formPerfil.telefono.trim()) err.telefono = "El teléfono es obligatorio.";
    else if (!soloDigitos(formPerfil.telefono)) err.telefono = "Solo se permiten números.";

    if (!formPerfil.correo.trim()) err.correo = "El correo es obligatorio.";
    else if (!correoValido(formPerfil.correo)) err.correo = "Correo no válido.";

    setErroresPerfil(err);
    return Object.keys(err).length === 0;
  };

  /* Guardar Perfil en MySQL */
  const handleGuardarPerfil = async (e) => {
    e.preventDefault();
    if (!validarPerfil()) return;

    const perfilActualizado = await actualizarPerfilUsuario(formPerfil);
    onActualizarUsuario(perfilActualizado);
    notificarExito("Perfil actualizado correctamente en la base de datos.");
  };

  /* Guardar Dirección en MySQL */
  const handleGuardarDireccion = async (e) => {
    e.preventDefault();
    const err = {};
    if (!formDireccion.departamento) err.departamento = "Selecciona un departamento.";
    if (!formDireccion.ciudad.trim()) err.ciudad = "La ciudad es obligatoria.";
    if (!formDireccion.direccion.trim()) err.direccion = "La dirección es obligatoria.";

    if (Object.keys(err).length > 0) {
      setErroresDir(err);
      return;
    }

    const listaNueva = await guardarDireccionUsuario(formDireccion);
    setDirecciones(listaNueva);
    setMostrandoFormDir(false);
    setFormDireccion({ id_ubi: null, departamento: "", ciudad: "", direccion: "" });
    setErroresDir({});
    notificarExito("Dirección guardada correctamente.");
  };

  /* Eliminar Dirección en MySQL */
  const handleEliminarDireccion = async (idUbi) => {
    const listaNueva = await eliminarDireccionUsuario(idUbi);
    setDirecciones(listaNueva);
    notificarExito("Dirección eliminada.");
  };

  /* Editar Dirección existente */
  const handleEditarDireccion = (dir) => {
    setFormDireccion(dir);
    setMostrandoFormDir(true);
  };

  /* Productos filtrados por lista de Favoritos */
  const productosFavoritos = PRODUCTOS_DATA.filter((p) =>
    favoritos.includes(p.id)
  );

  /* Si no está autenticado */
  if (!usuario) {
    return (
      <main className="pagina-usuario usuario-no-autenticado">
        <div className="usuario-tarjeta-alerta">
          <div className="usuario-icono-alerta">
            {/* Heroicon: Lock */}
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="svg-icono-grande">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
            </svg>
          </div>
          <h1>Acceso de Usuario</h1>
          <p>
            Debes estar registrado e iniciar sesión para ver tus pedidos,
            favoritos, perfil y configuraciones.
          </p>
          <div className="usuario-acciones-alerta">
            <Link to="/inicio-sesion" className="boton-primario">
              Iniciar Sesión
            </Link>
            <Link to="/crear-cuenta" className="boton-contorno">
              Crear Cuenta
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="pagina-usuario">
      {/* Cabecera del usuario */}
      <div className="usuario-cabecera">
        <div className="usuario-avatar">
          {usuario.nombre?.charAt(0)}
          {usuario.apellido?.charAt(0)}
        </div>
        <div className="usuario-saludo">
          <span className="usuario-kicker">MI CUENTA</span>
          <h1>
            ¡Hola, {usuario.nombre} {usuario.apellido}!
          </h1>
          <p>{usuario.correo} • Cliente registrado</p>
        </div>
        <button
          className="boton-cerrar-sesion"
          onClick={onAlternarSesion}
          title="Cerrar sesión de prueba"
        >
          Cerrar Sesión
        </button>
      </div>

      {/* Alerta de notificación exitosa con Heroicon */}
      {mensajeExito && (
        <div className="usuario-alerta-exito">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="svg-icono-exito">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{mensajeExito}</span>
        </div>
      )}

      {/* Menú de navegación por pestañas con Heroicons */}
      <div className="usuario-navegacion-tabs">
        <button
          className={`tab-btn ${pestanaActiva === "pedidos" ? "activo" : ""}`}
          onClick={() => cambiarPestana("pedidos")}
        >
          {/* Heroicon: Cube / Box */}
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="svg-tab">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
          </svg>
          <span>Mis Pedidos</span>
        </button>

        <button
          className={`tab-btn ${pestanaActiva === "favoritos" ? "activo" : ""}`}
          onClick={() => cambiarPestana("favoritos")}
        >
          {/* Heroicon: Heart */}
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="svg-tab">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
          </svg>
          <span>Favoritos ({favoritos.length})</span>
        </button>

        <button
          className={`tab-btn ${pestanaActiva === "perfil" ? "activo" : ""}`}
          onClick={() => cambiarPestana("perfil")}
        >
          {/* Heroicon: User */}
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="svg-tab">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
          </svg>
          <span>Perfil</span>
        </button>

        <button
          className={`tab-btn ${pestanaActiva === "direccion" ? "activo" : ""}`}
          onClick={() => cambiarPestana("direccion")}
        >
          {/* Heroicon: Map Pin */}
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="svg-tab">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0zM19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
          </svg>
          <span>Direcciones</span>
        </button>

        <button
          className={`tab-btn ${pestanaActiva === "configuracion" ? "activo" : ""}`}
          onClick={() => cambiarPestana("configuracion")}
        >
          {/* Heroicon: Sliders / Accesibilidad */}
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="svg-tab">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0m-6.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0m-9.75 0h9.75" />
          </svg>
          <span>Accesibilidad</span>
        </button>
      </div>

      {/* ================================================ */}
      {/* Pestaña: MIS PEDIDOS                            */}
      {/* ================================================ */}
      {pestanaActiva === "pedidos" && (
        <section className="usuario-seccion">
          <h2>Mis Pedidos</h2>
          {ordenes.length === 0 ? (
            <div className="bloque-vacio">
              <p>Aún no has realizado pedidos en la plataforma.</p>
              <Link to="/productos" className="boton-guardar">
                Ir a comprar
              </Link>
            </div>
          ) : (
            <div className="lista-pedidos">
              {ordenes.map((ord) => (
                <article key={ord.id_venta} className="tarjeta-pedido">
                  <div className="pedido-encabezado">
                    <div>
                      <span className="pedido-id">{ord.id_venta}</span>
                      <span className="pedido-fecha">
                        {new Date(ord.fecha_venta).toLocaleDateString("es-CO")}
                      </span>
                    </div>
                    <span className={`estado-badge estado-${ord.estado?.toLowerCase()}`}>
                      {ord.estado}
                    </span>
                  </div>

                  <div className="pedido-detalles">
                    <h4>Productos comprados:</h4>
                    <ul>
                      {ord.detalles.map((d, index) => (
                        <li key={index}>
                          <span>Producto #{d.id_pro}</span>
                          <span>Cantidad: {d.cantidad}</span>
                          <strong>{formatearPrecio(d.subtotal)}</strong>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pedido-pie">
                    <span>
                      Enviado a: {ord.cliente?.direccion}, {ord.cliente?.ciudad}
                    </span>
                    <strong>Total: {formatearPrecio(ord.total)}</strong>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      )}

      {/* ================================================ */}
      {/* Pestaña: FAVORITOS                              */}
      {/* ================================================ */}
      {pestanaActiva === "favoritos" && (
        <section className="usuario-seccion">
          <h2>Mis Favoritos</h2>
          {productosFavoritos.length === 0 ? (
            <div className="bloque-vacio">
              <p>No tienes productos agregados a tus favoritos aún.</p>
              <Link to="/productos" className="boton-guardar">
                Descubrir productos
              </Link>
            </div>
          ) : (
            <div className="cuadricula-favoritos">
              {productosFavoritos.map((prod) => (
                <article key={prod.id} className="tarjeta-favorito">
                  <button
                    className="btn-quitar-favorito"
                    onClick={() => onAlternarFavorito(prod.id)}
                    title="Quitar de favoritos"
                  >
                    {/* Heroicon: X mark */}
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="svg-icono-sm">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                  <div className="favorito-imagen">
                    <img
                      src={prod.imagen || prod.imagen_url || 'https://admin.wurth.co/uploads/ec5f5dc6_8a5c_45c1_8630_f7dc139a3e30_7b732362fb.jpg'}
                      alt={prod.titulo}
                    />
                  </div>
                  <span className="favorito-categoria">{prod.categoria}</span>
                  <h3>{prod.titulo}</h3>
                  <strong className="favorito-precio">
                    {formatearPrecio(prod.precio)}
                  </strong>
                  <button
                    className="boton-guardar boton-mover-carrito"
                    onClick={() => onAgregarCarrito(prod, 1)}
                  >
                    Agregar al carrito
                  </button>
                </article>
              ))}
            </div>
          )}
        </section>
      )}

      {/* ================================================ */}
      {/* Pestaña: PERFIL (Tabla usuario)                  */}
      {/* ================================================ */}
      {pestanaActiva === "perfil" && (
        <section className="usuario-seccion">
          <h2>Perfil de Usuario</h2>
          <p className="descripcion-seccion">
            Administra tus datos personales (preparado para sincronizar con la tabla <code>usuario</code>).
          </p>

          <form className="form-usuario-perfil" onSubmit={handleGuardarPerfil} noValidate>
            <div className="form-fila">
              <div className="campo-grupo">
                <label>Nombre *</label>
                <input
                  type="text"
                  value={formPerfil.nombre}
                  onChange={(e) =>
                    setFormPerfil({ ...formPerfil, nombre: e.target.value })
                  }
                  className={erroresPerfil.nombre ? "campo-error" : ""}
                />
                {erroresPerfil.nombre && (
                  <span className="error-msg">{erroresPerfil.nombre}</span>
                )}
              </div>

              <div className="campo-grupo">
                <label>Apellido *</label>
                <input
                  type="text"
                  value={formPerfil.apellido}
                  onChange={(e) =>
                    setFormPerfil({ ...formPerfil, apellido: e.target.value })
                  }
                  className={erroresPerfil.apellido ? "campo-error" : ""}
                />
                {erroresPerfil.apellido && (
                  <span className="error-msg">{erroresPerfil.apellido}</span>
                )}
              </div>
            </div>

            <div className="form-fila">
              <div className="campo-grupo campo-tipo-doc">
                <label>Tipo Documento *</label>
                <select
                  value={formPerfil.tipo_doc}
                  onChange={(e) =>
                    setFormPerfil({ ...formPerfil, tipo_doc: e.target.value })
                  }
                >
                  <option value="C.C">C.C</option>
                  <option value="C.E">C.E</option>
                  <option value="NIT">NIT</option>
                  <option value="PAS">PAS</option>
                </select>
              </div>

              <div className="campo-grupo">
                <label>Número de Identificación *</label>
                <input
                  type="text"
                  value={formPerfil.num_ident}
                  onChange={(e) =>
                    setFormPerfil({ ...formPerfil, num_ident: e.target.value })
                  }
                  className={erroresPerfil.num_ident ? "campo-error" : ""}
                />
                {erroresPerfil.num_ident && (
                  <span className="error-msg">{erroresPerfil.num_ident}</span>
                )}
              </div>
            </div>

            <div className="form-fila">
              <div className="campo-grupo">
                <label>Teléfono *</label>
                <input
                  type="tel"
                  value={formPerfil.telefono}
                  onChange={(e) =>
                    setFormPerfil({ ...formPerfil, telefono: e.target.value })
                  }
                  className={erroresPerfil.telefono ? "campo-error" : ""}
                />
                {erroresPerfil.telefono && (
                  <span className="error-msg">{erroresPerfil.telefono}</span>
                )}
              </div>

              <div className="campo-grupo">
                <label>Correo Electrónico *</label>
                <input
                  type="email"
                  value={formPerfil.correo}
                  onChange={(e) =>
                    setFormPerfil({ ...formPerfil, correo: e.target.value })
                  }
                  className={erroresPerfil.correo ? "campo-error" : ""}
                />
                {erroresPerfil.correo && (
                  <span className="error-msg">{erroresPerfil.correo}</span>
                )}
              </div>
            </div>

            <button type="submit" className="boton-guardar">
              {/* Heroicon: Checkmark */}
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="svg-icono-sm">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
              <span>Guardar Cambios de Perfil</span>
            </button>
          </form>
        </section>
      )}

      {/* Pestaña: DIRECCIONES */}
      {pestanaActiva === "direccion" && (
        <section className="usuario-seccion">
          <div className="seccion-cabecera-flex">
            <h2>Mis Direcciones</h2>
            {!mostrandoFormDir && (
              <button
                className="boton-guardar"
                onClick={() => {
                  setFormDireccion({
                    id_ubi: null,
                    departamento: "",
                    ciudad: "",
                    direccion: "",
                  });
                  setMostrandoFormDir(true);
                }}
              >
                {/* Heroicon: Plus */}
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="svg-icono-sm">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                <span>Agregar Nueva Dirección</span>
              </button>
            )}
          </div>
          <p className="descripcion-seccion">
            Gestión de ubicaciones preparadas para la tabla <code>ubicacion</code>.
          </p>

          {mostrandoFormDir && (
            <form className="form-usuario-direccion" onSubmit={handleGuardarDireccion}>
              <h3>{formDireccion.id_ubi ? "Editar Dirección" : "Nueva Dirección"}</h3>

              <div className="campo-grupo">
                <label>Departamento *</label>
                <select
                  value={formDireccion.departamento}
                  onChange={(e) =>
                    setFormDireccion({ ...formDireccion, departamento: e.target.value })
                  }
                  className={erroresDir.departamento ? "campo-error" : ""}
                >
                  <option value="">Selecciona departamento</option>
                  {DEPARTAMENTOS.map((dep) => (
                    <option key={dep} value={dep}>
                      {dep}
                    </option>
                  ))}
                </select>
                {erroresDir.departamento && (
                  <span className="error-msg">{erroresDir.departamento}</span>
                )}
              </div>

              <div className="campo-grupo">
                <label>Ciudad *</label>
                <input
                  type="text"
                  value={formDireccion.ciudad}
                  onChange={(e) =>
                    setFormDireccion({ ...formDireccion, ciudad: e.target.value })
                  }
                  placeholder="Ej: Bogotá"
                  className={erroresDir.ciudad ? "campo-error" : ""}
                />
                {erroresDir.ciudad && (
                  <span className="error-msg">{erroresDir.ciudad}</span>
                )}
              </div>

              <div className="campo-grupo">
                <label>Dirección completa *</label>
                <input
                  type="text"
                  value={formDireccion.direccion}
                  onChange={(e) =>
                    setFormDireccion({ ...formDireccion, direccion: e.target.value })
                  }
                  placeholder="Ej: Carrera 15 # 85 - 30"
                  className={erroresDir.direccion ? "campo-error" : ""}
                />
                {erroresDir.direccion && (
                  <span className="error-msg">{erroresDir.direccion}</span>
                )}
              </div>

              <div className="acciones-form">
                <button type="submit" className="boton-guardar">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="svg-icono-sm">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                  <span>Guardar Dirección</span>
                </button>
                <button
                  type="button"
                  className="boton-contorno"
                  onClick={() => setMostrandoFormDir(false)}
                >
                  Cancelar
                </button>
              </div>
            </form>
          )}

          <div className="lista-direcciones">
            {direcciones.map((dir) => (
              <article key={dir.id_ubi} className="tarjeta-direccion">
                <div className="direccion-info">
                  <strong>{dir.direccion}</strong>
                  <p>
                    {dir.ciudad}, {dir.departamento}
                  </p>
                </div>
                <div className="direccion-acciones">
                  <button
                    className="btn-link"
                    onClick={() => handleEditarDireccion(dir)}
                  >
                    Editar
                  </button>
                  <button
                    className="btn-link btn-link-eliminar"
                    onClick={() => handleEliminarDireccion(dir.id_ubi)}
                  >
                    Eliminar
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* Pestaña: CONFIGURACIÓN Y ACCESIBILIDAD */}
      {pestanaActiva === "configuracion" && (
        <section className="usuario-seccion">
          <h2>Configuración y Accesibilidad</h2>
          <p className="descripcion-seccion">
            Ajustes para mejorar la comodidad visual y la experiencia de usuario.
          </p>

          <div className="opciones-configuracion">
            {/* Alto contraste */}
            <div className="opcion-item">
              <div>
                <h4>Modo Alto Contraste</h4>
                <p>Aumenta el contraste en toda la aplicación (incluye encabezado).</p>
              </div>
              <label className="switch-toggle">
                <input
                  type="checkbox"
                  checked={configuracion?.altoContraste || false}
                  onChange={(e) => {
                    const nueva = guardarConfiguracionUsuario({
                      ...configuracion,
                      altoContraste: e.target.checked,
                    });
                    onActualizarConfig(nueva);
                  }}
                />
                <span className="slider-round"></span>
              </label>
            </div>

            {/* Tamaño de fuente */}
            <div className="opcion-item">
              <div>
                <h4>Tamaño de Fuente</h4>
                <p>Ajusta la escala tipográfica de todas las páginas.</p>
              </div>
              <div className="selector-tamano">
                <button
                  className={`btn-tamano ${configuracion?.tamanoFuente === "normal" ? "activo" : ""}`}
                  onClick={() => {
                    const nueva = guardarConfiguracionUsuario({
                      ...configuracion,
                      tamanoFuente: "normal",
                    });
                    onActualizarConfig(nueva);
                  }}
                >
                  Normal
                </button>
                <button
                  className={`btn-tamano ${configuracion?.tamanoFuente === "grande" ? "activo" : ""}`}
                  onClick={() => {
                    const nueva = guardarConfiguracionUsuario({
                      ...configuracion,
                      tamanoFuente: "grande",
                    });
                    onActualizarConfig(nueva);
                  }}
                >
                  Grande
                </button>
                <button
                  className={`btn-tamano ${configuracion?.tamanoFuente === "extra-grande" ? "activo" : ""}`}
                  onClick={() => {
                    const nueva = guardarConfiguracionUsuario({
                      ...configuracion,
                      tamanoFuente: "extra-grande",
                    });
                    onActualizarConfig(nueva);
                  }}
                >
                  Extra Grande
                </button>
              </div>
            </div>

            {/* Notificaciones por correo */}
            <div className="opcion-item">
              <div>
                <h4>Notificaciones por correo</h4>
                <p>Recibir actualizaciones sobre el estado de tus compras.</p>
              </div>
              <label className="switch-toggle">
                <input
                  type="checkbox"
                  checked={configuracion?.notificacionesEmail || false}
                  onChange={(e) => {
                    const nueva = guardarConfiguracionUsuario({
                      ...configuracion,
                      notificacionesEmail: e.target.checked,
                    });
                    onActualizarConfig(nueva);
                  }}
                />
                <span className="slider-round"></span>
              </label>
            </div>
          </div>
        </section>
      )}
    </main>
  );
};

export default Usuario;
