/* eslint-disable react-refresh/only-export-components */
import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import "./Productos.css";

// ============================================================
// FUENTE ÚNICA DE DATOS DE PRODUCTOS
// ============================================================
export const PRODUCTOS_DATA = [
  {
    id: 1,
    categoria: "HERRAMIENTAS",
    subcategoria: "Taladros",
    titulo: "Taladro Inalámbrico 20V",
    precio: 299900,
    precioAnterior: 359900,
    calificacion: 5,
    valoraciones: 128,
    etiqueta: "OFERTA",
    descripcion:
      "Taladro inalámbrico de alta potencia con batería de litio 20V. Incluye mandril de 13mm, 2 velocidades y función martillo. Ideal para perforaciones en concreto, madera y metal. Batería con hasta 4 horas de autonomía continua.",
    colores: ["#1a1a1a", "#c0392b"],
    specs: {
      Material: "Acero y ABS",
      Voltaje: "20V Li-Ion",
      Velocidad: "0–1.500 RPM",
      Peso: "1.8 kg",
      Mandril: "13 mm",
      Modos: "Taladro / Percutor",
    },
    relacionados: [8, 11, 15, 19],
  },
  {
    id: 2,
    categoria: "MUEBLES",
    subcategoria: "Sala",
    titulo: "Sofá Modular 3 Puestos Tela Premium",
    precio: 1299900,
    precioAnterior: null,
    calificacion: 5,
    valoraciones: 86,
    etiqueta: null,
    descripcion:
      "Sofá modular de 3 puestos con tapizado en tela premium de alta resistencia. Estructura de pino macizo y espuma de alta densidad para un confort excepcional. Diseño escandinavo de líneas puras que se adapta a cualquier espacio.",
    colores: ["#7f8c8d", "#2c3e50", "#8e6b3e"],
    specs: {
      "Material tela": "Poliéster premium",
      Estructura: "Pino macizo",
      Ancho: "210 cm",
      Alto: "85 cm",
      Profundidad: "90 cm",
      Peso: "45 kg",
    },
    relacionados: [4, 5, 6, 13],
  },
  {
    id: 3,
    categoria: "ILUMINACIÓN",
    subcategoria: "Colgantes",
    titulo: "Lámpara Colgante Minimalista Negra",
    precio: 159900,
    precioAnterior: null,
    calificacion: 5,
    valoraciones: 49,
    etiqueta: null,
    descripcion:
      "Lámpara colgante de estilo minimalista con acabado negro mate. Cable textil de 1.5 m de largo, casquillo E27 y pantalla de metal. Compatible con bombillos LED. Perfecta para comedores, islas de cocina y espacios de trabajo.",
    colores: ["#1a1a1a", "#f5f5f5", "#c0392b"],
    specs: {
      Material: "Metal",
      Acabado: "Negro mate",
      Cable: "1.5 m textil",
      Casquillo: "E27",
      Diámetro: "25 cm",
      Peso: "0.8 kg",
    },
    relacionados: [7, 12, 16, 9],
  },
  {
    id: 4,
    categoria: "MUEBLES",
    subcategoria: "Almacenamiento",
    titulo: "Estantería Industrial 5 Niveles",
    precio: 219900,
    precioAnterior: null,
    calificacion: 5,
    valoraciones: 92,
    etiqueta: "NUEVO",
    descripcion:
      "Estantería de estilo industrial con estructura de metal pintado y tableros de MDF. 5 niveles con capacidad de hasta 30 kg por repisa. Fácil montaje sin necesidad de herramientas especiales. Ideal para oficinas, salas y habitaciones.",
    colores: ["#1a1a1a", "#8e6b3e"],
    specs: {
      Material: "MDF y metal",
      Alto: "180 cm",
      Ancho: "90 cm",
      Profundidad: "30 cm",
      Niveles: "5",
      "Carga máx.": "30 kg/nivel",
    },
    relacionados: [2, 13, 20, 6],
  },
  {
    id: 5,
    categoria: "MUEBLES",
    subcategoria: "Sala",
    titulo: "Mesa de Centro Industrial",
    precio: 189900,
    precioAnterior: null,
    calificacion: 4,
    valoraciones: 42,
    etiqueta: null,
    descripcion:
      "Mesa de centro de estilo industrial con tablero de madera maciza y base metálica en negro. Acabados artesanales que le dan un toque único a cada pieza. Resistente y fácil de limpiar.",
    colores: ["#8e6b3e", "#1a1a1a"],
    specs: {
      Material: "Madera maciza y metal",
      Largo: "120 cm",
      Ancho: "60 cm",
      Alto: "45 cm",
      Peso: "18 kg",
      Acabado: "Barniz natural",
    },
    relacionados: [2, 4, 6, 13],
  },
  {
    id: 6,
    categoria: "MUEBLES",
    subcategoria: "Sillas",
    titulo: "Silla Nórdica Gris",
    precio: 145000,
    precioAnterior: null,
    calificacion: 4,
    valoraciones: 56,
    etiqueta: null,
    descripcion:
      "Silla de diseño nórdico con patas de madera maciza y asiento tapizado en tela gris. Ergonómica y ligera, perfecta para comedores y oficinas en casa. Soporta hasta 120 kg.",
    colores: ["#7f8c8d", "#2c3e50", "#ecf0f1"],
    specs: {
      Material: "Madera y tela",
      "Alto asiento": "46 cm",
      Ancho: "50 cm",
      Profundidad: "55 cm",
      Peso: "5 kg",
      "Carga máx.": "120 kg",
    },
    relacionados: [2, 5, 13, 17],
  },
  {
    id: 7,
    categoria: "ILUMINACIÓN",
    subcategoria: "Pie",
    titulo: "Lámpara de Pie Cromo",
    precio: 210000,
    precioAnterior: null,
    calificacion: 4,
    valoraciones: 28,
    etiqueta: null,
    descripcion:
      "Lámpara de pie con acabado cromo brillante y pantalla de tela blanca. Perfecta para crear ambientes cálidos en salas y dormitorios. Incluye interruptor en el cable y casquillo E27.",
    colores: ["#bdc3c7", "#1a1a1a"],
    specs: {
      Material: "Metal y tela",
      Acabado: "Cromo brillante",
      Alto: "160 cm",
      "Diámetro base": "25 cm",
      Casquillo: "E27",
      Cable: "1.8 m",
    },
    relacionados: [3, 12, 16, 9],
  },
  {
    id: 8,
    categoria: "HERRAMIENTAS",
    subcategoria: "Kits",
    titulo: "Set de Herramientas 50 pzas",
    precio: 95900,
    precioAnterior: null,
    calificacion: 5,
    valoraciones: 112,
    etiqueta: null,
    descripcion:
      "Kit completo de 50 herramientas para el hogar en maletín de transporte. Incluye destornilladores, llaves, alicates, cutter, nivel y más. Acero cromo vanadio de alta resistencia. El regalo perfecto para el hogar.",
    colores: ["#c0392b", "#1a1a1a"],
    specs: {
      Piezas: "50",
      Material: "Acero cromo vanadio",
      Maletín: "Plástico ABS",
      "Peso total": "3.5 kg",
      Garantía: "1 año",
      Dimensiones: "42 x 22 x 9 cm",
    },
    relacionados: [1, 11, 15, 19],
  },
  {
    id: 9,
    categoria: "DECORACIÓN",
    subcategoria: "Espejos",
    titulo: "Espejo Decorativo Redondo",
    precio: 120000,
    precioAnterior: null,
    calificacion: 5,
    valoraciones: 34,
    etiqueta: null,
    descripcion:
      "Espejo redondo con marco de ratán natural. Toque bohemio y natural que complementa cualquier decoración. Incluye sistema de fijación para pared. Ideal para entradas, salas y dormitorios.",
    colores: ["#8e6b3e", "#f5f5f5"],
    specs: {
      "Material marco": "Ratán natural",
      Diámetro: "70 cm",
      Grosor: "3 cm",
      Espejo: "5 mm biselado",
      Instalación: "Tornillos incluidos",
      Peso: "2.5 kg",
    },
    relacionados: [10, 14, 18, 3],
  },
  {
    id: 10,
    categoria: "DECORACIÓN",
    subcategoria: "Arte",
    titulo: "Cuadro Minimalista Botánico",
    precio: 85000,
    precioAnterior: null,
    calificacion: 4,
    valoraciones: 15,
    etiqueta: "NUEVO",
    descripcion:
      "Cuadro de estilo minimalista con ilustración botánica impresa en papel de alta calidad. Marco de madera de pino natural. Llega listo para colgar. Disponible en varios tamaños.",
    colores: ["#f5f5f5", "#2c3e50"],
    specs: {
      Tamaño: "50 x 70 cm",
      Marco: "Pino natural",
      Impresión: "Papel 300g",
      Acabado: "Sin vidrio",
      Instalación: "Ganchos incluidos",
      Peso: "1.2 kg",
    },
    relacionados: [9, 14, 18, 7],
  },
  {
    id: 11,
    categoria: "HERRAMIENTAS",
    subcategoria: "Eléctricas",
    titulo: "Sierra Circular 1500W",
    precio: 345000,
    precioAnterior: 390000,
    calificacion: 5,
    valoraciones: 78,
    etiqueta: "OFERTA",
    descripcion:
      "Sierra circular profesional de 1500W con disco de 7-1/4 pulgadas. Profundidad de corte de hasta 65mm. Guía láser para cortes precisos. Incluye disco TCT multipropósito y funda de transporte.",
    colores: ["#c0392b", "#1a1a1a"],
    specs: {
      Potencia: "1500W",
      Disco: "7-1/4 pulgadas",
      "Corte máx.": "65 mm a 90°",
      Velocidad: "5.800 RPM",
      Peso: "3.8 kg",
      Cable: "2 m",
    },
    relacionados: [1, 8, 15, 19],
  },
  {
    id: 12,
    categoria: "ILUMINACIÓN",
    subcategoria: "Smart",
    titulo: "Foco Inteligente LED RGB",
    precio: 45000,
    precioAnterior: null,
    calificacion: 4,
    valoraciones: 210,
    etiqueta: null,
    descripcion:
      "Bombillo LED inteligente con más de 16 millones de colores. Compatible con Alexa y Google Home. Control por voz o app desde cualquier lugar. 9W equivalente a 60W incandescente. Ahorra hasta 80% de energía.",
    colores: ["#f5f5f5"],
    specs: {
      Potencia: "9W",
      Equivalente: "60W incandescente",
      Colores: "16 millones RGB",
      Casquillo: "E27",
      "Vida útil": "25.000 horas",
      Compatibilidad: "Alexa, Google Home",
    },
    relacionados: [3, 7, 16, 9],
  },
  {
    id: 13,
    categoria: "MUEBLES",
    subcategoria: "Oficina",
    titulo: "Escritorio Minimalista Blanco",
    precio: 280000,
    precioAnterior: null,
    calificacion: 5,
    valoraciones: 65,
    etiqueta: null,
    descripcion:
      "Escritorio de líneas limpias con acabado blanco mate. Amplia superficie de trabajo de 120x60 cm. Incluye cajón lateral y soporte para CPU. Estructura de MDF y patas metálicas. Fácil montaje.",
    colores: ["#f5f5f5", "#1a1a1a"],
    specs: {
      Material: "MDF laminado",
      Ancho: "120 cm",
      Profundidad: "60 cm",
      Alto: "75 cm",
      Cajones: "1",
      Peso: "22 kg",
    },
    relacionados: [6, 17, 4, 20],
  },
  {
    id: 14,
    categoria: "DECORACIÓN",
    subcategoria: "Plantas",
    titulo: "Maceta de Cerámica Nórdica",
    precio: 35000,
    precioAnterior: null,
    calificacion: 4,
    valoraciones: 89,
    etiqueta: null,
    descripcion:
      "Maceta de cerámica esmaltada con diseño nórdico. Base de madera de bambú incluida. Ideal para plantas de interior, suculentas y cactus. Diseño artesanal con variaciones naturales en cada pieza.",
    colores: ["#f5f5f5", "#7f8c8d", "#c0392b"],
    specs: {
      Material: "Cerámica esmaltada",
      Diámetro: "15 cm",
      Alto: "14 cm",
      Base: "Bambú natural",
      Capacidad: "1.5 L",
      Drenaje: "Agujero incluido",
    },
    relacionados: [9, 10, 18, 3],
  },
  {
    id: 15,
    categoria: "HERRAMIENTAS",
    subcategoria: "Básicas",
    titulo: "Martillo de Uña Curva",
    precio: 25000,
    precioAnterior: null,
    calificacion: 5,
    valoraciones: 300,
    etiqueta: null,
    descripcion:
      "Martillo de carpintero con cabeza de acero forjado y mango de fibra de vidrio antivibraciones. Uña curva para extracción de clavos. Equilibrado perfectamente para reducir la fatiga. El clásico imprescindible.",
    colores: ["#1a1a1a", "#c0392b"],
    specs: {
      Material: "Acero forjado",
      Mango: "Fibra de vidrio",
      "Peso cabeza": "500 g",
      "Largo total": "33 cm",
      Garantía: "3 años",
      Uña: "Curva extractora",
    },
    relacionados: [8, 1, 11, 19],
  },
  {
    id: 16,
    categoria: "ILUMINACIÓN",
    subcategoria: "Escritorio",
    titulo: "Lámpara de Escritorio Ajustable",
    precio: 95000,
    precioAnterior: null,
    calificacion: 5,
    valoraciones: 43,
    etiqueta: null,
    descripcion:
      "Lámpara LED de escritorio con brazo articulado de 3 puntos. 5 modos de luz y 5 niveles de brillo. Puerto USB de carga integrado. Base de sujeción con clip o base plana. Ideal para estudiar y trabajar.",
    colores: ["#1a1a1a", "#f5f5f5", "#c0392b"],
    specs: {
      Tecnología: "LED",
      Modos: "5 (cálido a frío)",
      Brillo: "5 niveles",
      USB: "5V / 1A",
      Brazo: "Articulado 3 puntos",
      Consumo: "8W",
    },
    relacionados: [3, 7, 12, 13],
  },
  {
    id: 17,
    categoria: "MUEBLES",
    subcategoria: "Oficina",
    titulo: "Silla de Oficina Ergonómica",
    precio: 450000,
    precioAnterior: 520000,
    calificacion: 4,
    valoraciones: 112,
    etiqueta: "OFERTA",
    descripcion:
      "Silla ergonómica con respaldo de malla transpirable, reposabrazos ajustables en 4D y soporte lumbar regulable. Asiento de espuma de alta densidad. Mecanismo reclinable con bloqueo. Ideal para largas jornadas de trabajo.",
    colores: ["#1a1a1a", "#7f8c8d"],
    specs: {
      Respaldo: "Malla transpirable",
      Reposabrazos: "4D ajustables",
      Lumbar: "Regulable",
      Altura: "Neumática",
      "Carga máx.": "130 kg",
      Ruedas: "Nylon 60 mm",
    },
    relacionados: [6, 13, 5, 20],
  },
  {
    id: 18,
    categoria: "DECORACIÓN",
    subcategoria: "Relojes",
    titulo: "Reloj de Pared Vintage",
    precio: 110000,
    precioAnterior: null,
    calificacion: 5,
    valoraciones: 22,
    etiqueta: null,
    descripcion:
      "Reloj de pared de diseño vintage con esfera de metal envejecido y manecillas doradas. Mecanismo de cuarzo silencioso (no hace tic-tac). Funciona con 1 pila AA (incluida). Diámetro de 40 cm.",
    colores: ["#8e6b3e", "#1a1a1a"],
    specs: {
      Mecanismo: "Cuarzo silencioso",
      Diámetro: "40 cm",
      Material: "Metal envejecido",
      Manecillas: "Dorado mate",
      Pila: "1x AA (incluida)",
      Peso: "0.6 kg",
    },
    relacionados: [9, 10, 14, 3],
  },
  {
    id: 19,
    categoria: "HERRAMIENTAS",
    subcategoria: "Almacenamiento",
    titulo: "Caja de Herramientas Metálica",
    precio: 135000,
    precioAnterior: null,
    calificacion: 4,
    valoraciones: 58,
    etiqueta: null,
    descripcion:
      "Caja de herramientas en acero galvanizado con bandeja superior extraíble y 2 compartimentos. Cierre con seguro y asa de transporte ergonómica. Resistente a golpes y corrosión. Capacidad de 18 litros.",
    colores: ["#c0392b", "#1a1a1a", "#bdc3c7"],
    specs: {
      Material: "Acero galvanizado",
      Capacidad: "18 L",
      Largo: "46 cm",
      Alto: "22 cm",
      Bandeja: "Extraíble",
      Seguro: "Con llave",
    },
    relacionados: [8, 1, 11, 15],
  },
  {
    id: 20,
    categoria: "MUEBLES",
    subcategoria: "Sala",
    titulo: "Mueble para TV Moderno",
    precio: 320000,
    precioAnterior: null,
    calificacion: 5,
    valoraciones: 39,
    etiqueta: "NUEVO",
    descripcion:
      "Mueble para TV de diseño moderno con patas metálicas doradas y tableros de MDF laminado. 2 puertas abatibles y espacio central abierto. Soporta televisores de hasta 65 pulgadas. Fácil montaje con instrucciones incluidas.",
    colores: ["#f5f5f5", "#2c3e50", "#8e6b3e"],
    specs: {
      Material: "MDF laminado",
      Ancho: "150 cm",
      Alto: "55 cm",
      Profundidad: "40 cm",
      "TV máx.": "65 pulgadas",
      Patas: "Metal dorado",
    },
    relacionados: [2, 4, 5, 13],
  },
];

export const CATEGORIAS_DISPONIBLES = [
  "Herramientas",
  "Muebles",
  "Decoración",
  "Iluminación",
];

const PRODUCTOS_POR_PAGINA = 8;

// ============================================================
// UTILIDADES
// ============================================================
export const formatearPrecio = (precio) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(precio);

export const renderizarEstrellas = (calificacion) => {
  const estrellas = [];
  for (let i = 1; i <= 5; i++) {
    estrellas.push(<span key={i}>{i <= calificacion ? "★" : "☆"}</span>);
  }
  return <span className='estrellas'>{estrellas}</span>;
};

// ============================================================
// COMPONENTE TARJETA (reutilizable + clicable)
// ============================================================
export const TarjetaProducto = ({ producto, onAgregarCarrito }) => (
  <Link to={`/productos/${producto.id}`} className='tarjeta-producto-link'>
    <div className='tarjeta-producto'>
      {producto.etiqueta && (
        <span className={`etiqueta ${producto.etiqueta.toLowerCase()}`}>
          {producto.etiqueta}
        </span>
      )}
      <button className='producto-favorito' onClick={(e) => e.preventDefault()}>
        &#9825;
      </button>
      <div className='producto-imagen-marcador'>
        <span
          style={{
            display: "flex",
            height: "100%",
            alignItems: "center",
            justifyContent: "center",
            color: "#aaa",
            fontSize: "0.8rem",
          }}
        >
          Img {producto.id}
        </span>
      </div>
      <div className='producto-info'>
        <span className='producto-categoria'>{producto.categoria}</span>
        <h4 className='producto-titulo'>{producto.titulo}</h4>
        <div className='producto-calificacion'>
          {renderizarEstrellas(producto.calificacion)}
          <span>({producto.valoraciones})</span>
        </div>
        <div className='producto-precios'>
          <span className='precio-actual'>
            {formatearPrecio(producto.precio)}
          </span>
          {producto.precioAnterior && (
            <span className='precio-anterior'>
              {formatearPrecio(producto.precioAnterior)}
            </span>
          )}
        </div>
        <button
          className='boton-agregar'
          onClick={(e) => {
            e.preventDefault();
            onAgregarCarrito?.(producto, 1);
          }}
        >
          Agregar al carrito
        </button>
      </div>
    </div>
  </Link>
);

// ============================================================
// PÁGINA PRINCIPAL DE PRODUCTOS
// ============================================================
const Productos = ({ onAgregarCarrito }) => {
  const [categoriasTemp, setCategoriasTemp] = useState([]);
  const [precioMinTemp, setPrecioMinTemp] = useState("");
  const [precioMaxTemp, setPrecioMaxTemp] = useState("");

  const [categoriasAplicadas, setCategoriasAplicadas] = useState([]);
  const [precioMinAplicado, setPrecioMinAplicado] = useState("");
  const [precioMaxAplicado, setPrecioMaxAplicado] = useState("");

  const [ordenar, setOrdenar] = useState("destacados");
  const [paginaActual, setPaginaActual] = useState(1);

  const handleCategoriaChange = (categoria) => {
    setCategoriasTemp((prev) =>
      prev.includes(categoria)
        ? prev.filter((c) => c !== categoria)
        : [...prev, categoria],
    );
  };

  const aplicarFiltros = () => {
    setCategoriasAplicadas(categoriasTemp);
    setPrecioMinAplicado(precioMinTemp);
    setPrecioMaxAplicado(precioMaxTemp);
    setPaginaActual(1);
  };

  const productosFiltrados = useMemo(() => {
    let resultado = PRODUCTOS_DATA.filter((producto) => {
      if (categoriasAplicadas.length > 0) {
        const catMatch = categoriasAplicadas.some(
          (catSel) => catSel.toUpperCase() === producto.categoria.toUpperCase(),
        );
        if (!catMatch) return false;
      }
      if (
        precioMinAplicado !== "" &&
        producto.precio < parseInt(precioMinAplicado, 10)
      )
        return false;
      if (
        precioMaxAplicado !== "" &&
        producto.precio > parseInt(precioMaxAplicado, 10)
      )
        return false;
      return true;
    });

    if (ordenar === "menor-mayor")
      resultado = [...resultado].sort((a, b) => a.precio - b.precio);
    else if (ordenar === "mayor-menor")
      resultado = [...resultado].sort((a, b) => b.precio - a.precio);

    return resultado;
  }, [categoriasAplicadas, precioMinAplicado, precioMaxAplicado, ordenar]);

  const totalPaginas = Math.ceil(
    productosFiltrados.length / PRODUCTOS_POR_PAGINA,
  );
  const indiceUltimoProducto = paginaActual * PRODUCTOS_POR_PAGINA;
  const indicePrimerProducto = indiceUltimoProducto - PRODUCTOS_POR_PAGINA;
  const productosPaginados = productosFiltrados.slice(
    indicePrimerProducto,
    indiceUltimoProducto,
  );

  const cambiarPagina = (numeroPagina) => {
    setPaginaActual(numeroPagina);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      <div className='pagina-productos'>
        <header className='productos-header'>
          <h1>Nuestros Productos</h1>
          <p>
            Encuentra herramientas, muebles y decoración de alta calidad para
            cada rincón de tu hogar.
          </p>
        </header>

        <div className='productos-layout'>
          <aside className='filtros-sidebar'>
            <div className='filtro-grupo'>
              <h3>Categorías</h3>
              {CATEGORIAS_DISPONIBLES.map((cat) => {
                const cantidad = PRODUCTOS_DATA.filter(
                  (p) => p.categoria.toUpperCase() === cat.toUpperCase(),
                ).length;
                return (
                  <label key={cat} className='checkbox-label'>
                    <input
                      type='checkbox'
                      checked={categoriasTemp.includes(cat)}
                      onChange={() => handleCategoriaChange(cat)}
                    />
                    <span>{cat}</span>
                    <span className='cantidad'>({cantidad})</span>
                  </label>
                );
              })}
            </div>

            <div className='filtro-grupo'>
              <h3>Precio</h3>
              <div className='precio-inputs'>
                <input
                  type='number'
                  placeholder='$ Min'
                  value={precioMinTemp}
                  onChange={(e) => setPrecioMinTemp(e.target.value)}
                />
                <span>-</span>
                <input
                  type='number'
                  placeholder='$ Max'
                  value={precioMaxTemp}
                  onChange={(e) => setPrecioMaxTemp(e.target.value)}
                />
              </div>
              <button className='boton-aplicar' onClick={aplicarFiltros}>
                APLICAR
              </button>
            </div>
          </aside>

          <main className='productos-contenido'>
            <div className='productos-barra-superior'>
              <span>
                Mostrando{" "}
                {productosFiltrados.length === 0 ? 0 : indicePrimerProducto + 1}
                -{Math.min(indiceUltimoProducto, productosFiltrados.length)} de{" "}
                {productosFiltrados.length} productos
              </span>
              <div className='ordenar-por'>
                <span>ORDENAR POR:</span>
                <select
                  value={ordenar}
                  onChange={(e) => {
                    setOrdenar(e.target.value);
                    setPaginaActual(1);
                  }}
                >
                  <option value='destacados'>Destacados</option>
                  <option value='menor-mayor'>Precio: Menor a Mayor</option>
                  <option value='mayor-menor'>Precio: Mayor a Menor</option>
                </select>
              </div>
            </div>

            {productosFiltrados.length === 0 ? (
              <div
                style={{ padding: "60px", textAlign: "center", color: "#999" }}
              >
                <h3>No se encontraron productos con estos filtros.</h3>
                <p style={{ marginTop: "8px", fontSize: "0.9rem" }}>
                  Intenta cambiar o quitar los filtros aplicados.
                </p>
              </div>
            ) : (
              <div className='productos-grid'>
                {productosPaginados.map((producto) => (
                  <TarjetaProducto
                    key={producto.id}
                    producto={producto}
                    onAgregarCarrito={onAgregarCarrito}
                  />
                ))}
              </div>
            )}

            {totalPaginas > 1 && (
              <div className='paginacion'>
                <button
                  className='paginacion-btn'
                  onClick={() => cambiarPagina(Math.max(1, paginaActual - 1))}
                  disabled={paginaActual === 1}
                  style={{
                    opacity: paginaActual === 1 ? 0.4 : 1,
                    cursor: paginaActual === 1 ? "not-allowed" : "pointer",
                  }}
                >
                  &lt;
                </button>
                {Array.from({ length: totalPaginas }, (_, i) => i + 1).map(
                  (num) => (
                    <button
                      key={num}
                      className={`paginacion-btn ${paginaActual === num ? "activo" : ""}`}
                      onClick={() => cambiarPagina(num)}
                    >
                      {num}
                    </button>
                  ),
                )}
                <button
                  className='paginacion-btn'
                  onClick={() =>
                    cambiarPagina(Math.min(totalPaginas, paginaActual + 1))
                  }
                  disabled={paginaActual === totalPaginas}
                  style={{
                    opacity: paginaActual === totalPaginas ? 0.4 : 1,
                    cursor:
                      paginaActual === totalPaginas ? "not-allowed" : "pointer",
                  }}
                >
                  &gt;
                </button>
              </div>
            )}
          </main>
        </div>
      </div>
    </>
  );
};

export default Productos;
