import { useState, useEffect } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { api } from '../servicios/api';

/* Helpers para mapear datos de la base de datos a los iconos y estados del tablero */
const mapearEstadoVenta = (estado) => {
  const e = (estado || '').toLowerCase();
  if (e === 'completada') return { estado: 'completada', estadoTexto: 'Completada' };
  if (e === 'cancelada') return { estado: 'cancelada', estadoTexto: 'Cancelada' };
  if (e === 'pendiente') return { estado: 'pendiente', estadoTexto: 'Pendiente' };
  return { estado: 'proceso', estadoTexto: 'En proceso' };
};

const iconoOrdenPorIndice = (i) =>
  [IconoHerramienta, IconoMueble, IconoIluminacion, IconoDecoracion][i % 4];

const mapearIconoCategoria = (nombre) => {
  const n = (nombre || '').toLowerCase();
  if (n.includes('herramienta')) return IconoHerramienta;
  if (n.includes('mueble')) return IconoMueble;
  if (n.includes('ilumin') || n.includes('lamp') || n.includes('luz')) return IconoIluminacion;
  if (n.includes('decor')) return IconoDecoracion;
  if (n.includes('baño') || n.includes('cocina')) return IconoBano;
  return IconoProductos;
};

const mapearIconoProducto = (nombre, indice) => {
  const n = (nombre || '').toLowerCase();
  if (n.includes('taladro') || n.includes('herramienta') || n.includes('cepillo')) return IconoHerramienta;
  if (n.includes('sof') || n.includes('mueble') || n.includes('silla') || n.includes('mesa')) return IconoMueble;
  if (n.includes('lampara') || n.includes('lamp') || n.includes('luz') || n.includes('bombillo')) return IconoIluminacion;
  if (n.includes('maceta') || n.includes('espejo') || n.includes('decor')) return IconoDecoracion;
  return [IconoHerramienta, IconoMueble, IconoDecoracion, IconoIluminacion][indice % 4];
};

export default function Tablero() {
  const context = useOutletContext();
  const nombreAdmin = context?.nombreAdmin || localStorage.getItem('almacen_admin_nombre') || 'Admin';
  const [filtroTiempo, setFiltroTiempo] = useState('Hoy');
  const [metricasBD, setMetricasBD] = useState(null);

  // Cargar métricas directamente desde MySQL
  useEffect(() => {
    api.get('/dashboard', null).then((res) => {
      if (res) setMetricasBD(res);
    });
  }, []);

  const totalVentasFormateado = metricasBD?.totalVentas 
    ? `$${Number(metricasBD.totalVentas).toLocaleString('es-CO')}` 
    : '$12.450.000';

  const totalProductosFormateado = metricasBD?.totalProductos 
    ? String(metricasBD.totalProductos) 
    : '248';

  const totalOrdenesFormateado = metricasBD?.totalOrdenes 
    ? String(metricasBD.totalOrdenes) 
    : '12';

  const totalClientesFormateado = metricasBD?.totalClientes != null 
    ? String(metricasBD.totalClientes) 
    : '1.204';

  const estadisticas = [
    {
      id: 'ventas',
      etiqueta: 'Ventas Totales',
      valor: totalVentasFormateado,
      cambio: '↑ 12.5%',
      subida: true,
      icono: IconoVentas,
      colorClase: 'tarjeta-est-verde',
      colorStroke: '#10B981',
      sparklineD: 'M2 22 Q 20 8, 40 16 T 78 4',
    },
    {
      id: 'productos',
      etiqueta: 'Productos Activos',
      valor: totalProductosFormateado,
      cambio: '↑ 8.2%',
      subida: true,
      icono: IconoProductos,
      colorClase: 'tarjeta-est-azul',
      colorStroke: '#3B82F6',
      sparklineD: 'M2 25 Q 20 18, 40 10 T 78 5',
    },
    {
      id: 'clientes',
      etiqueta: 'Clientes Registrados',
      valor: totalClientesFormateado,
      cambio: '↑ 14.3%',
      subida: true,
      icono: IconoClientes,
      colorClase: 'tarjeta-est-morado',
      colorStroke: '#8B5CF6',
      sparklineD: 'M2 20 Q 20 14, 40 6 T 78 2',
    },
    {
      id: 'ordenes',
      etiqueta: 'Órdenes en Sistema',
      valor: totalOrdenesFormateado,
      cambio: '↓ 6.7%',
      subida: false,
      icono: IconoOrdenes,
      colorClase: 'tarjeta-est-naranja',
      colorStroke: '#F97316',
      sparklineD: 'M2 10 Q 20 18, 40 14 T 78 24',
    },
  ];

  const ordenesRecientes = metricasBD?.ventasRecientes?.length
    ? metricasBD.ventasRecientes.map((v, i) => {
        const m = mapearEstadoVenta(v.estado);
        return {
          id: String(v.id),
          tiempo: v.fecha || '',
          estado: m.estado,
          estadoTexto: m.estadoTexto,
          monto: `$${Number(v.total || 0).toLocaleString('es-CO')}`,
          icono: iconoOrdenPorIndice(i),
        };
      })
    : [
        { id: '1247', tiempo: 'Hace 12 min', estado: 'completada', estadoTexto: 'Completada', monto: '$89.900', icono: IconoHerramienta },
        { id: '1246', tiempo: 'Hace 1 h', estado: 'proceso', estadoTexto: 'En proceso', monto: '$299.900', icono: IconoMueble },
        { id: '1245', tiempo: 'Hace 3 h', estado: 'pendiente', estadoTexto: 'Pendiente', monto: '$159.900', icono: IconoIluminacion },
        { id: '1244', tiempo: 'Hace 5 h', estado: 'completada', estadoTexto: 'Completada', monto: '$219.900', icono: IconoDecoracion },
      ];

  const topProductos = metricasBD?.topProductos?.length
    ? (() => {
        const max = Number(metricasBD.topProductos[0].cantidad) || 1;
        return metricasBD.topProductos.map((p, i) => ({
          posicion: i + 1,
          nombre: p.nombre,
          ventas: `${p.cantidad} ventas`,
          icono: mapearIconoProducto(p.nombre, i),
          progreso: Math.max(5, Math.round((Number(p.cantidad) / max) * 100)),
        }));
      })()
    : [
        { posicion: 1, nombre: 'Taladro Inalámbrico 20V', ventas: '126 ventas', icono: IconoHerramienta, progreso: 85 },
        { posicion: 2, nombre: 'Sofá Modular 3 Puestos', ventas: '98 ventas', icono: IconoMueble, progreso: 68 },
        { posicion: 3, nombre: 'Maceta Moderna Con Base', ventas: '87 ventas', icono: IconoDecoracion, progreso: 55 },
        { posicion: 4, nombre: 'Lámpara Colgante Minimalista', ventas: '76 ventas', icono: IconoIluminacion, progreso: 42 },
      ];

  const categorias = metricasBD?.categorias?.length
    ? (() => {
        const max = Number(metricasBD.categorias[0].cantidad) || 1;
        return metricasBD.categorias.map((c) => ({
          nombre: c.nombre,
          porcentaje: Math.max(4, Math.round((Number(c.cantidad) / max) * 100)),
          icono: mapearIconoCategoria(c.nombre),
        }));
      })()
    : [
        { nombre: 'Herramientas', porcentaje: 32, icono: IconoHerramienta },
        { nombre: 'Muebles', porcentaje: 24, icono: IconoMueble },
        { nombre: 'Decoración', porcentaje: 18, icono: IconoDecoracion },
        { nombre: 'Iluminación', porcentaje: 14, icono: IconoIluminacion },
        { nombre: 'Baño y Cocina', porcentaje: 12, icono: IconoBano },
      ];

  return (
    <>
      {/* BANNER BIENVENIDA MINIMALISTA */}
      <div className="banner-bienvenida-novacasa">
        <div className="banner-bienvenida-izq">
          <div className="banner-icono-casa">
            <IconoInicio className="banner-svg-icon" />
          </div>
          <div className="banner-bienvenida-texto">
            <h2>¡Bienvenido, {nombreAdmin}!</h2>
            <p>Gestiona tu tienda, analiza el rendimiento y haz crecer tu negocio.</p>
          </div>
        </div>
        <div className="banner-fecha-insignia">
          <IconoCalendario width="15" height="15" />
          <span>Lun, 26 Ago 2026 · 10:24 AM</span>
        </div>
      </div>

      {/* TARJETAS DE ESTADÍSTICAS VÍVIDAS */}
      <div className="grilla-estadisticas">
        {estadisticas.map((est) => (
          <div className={`tarjeta-estadistica ${est.colorClase}`} key={est.etiqueta}>
            <div className="tarjeta-est-encabezado">
              <div className="tarjeta-est-icono">
                <est.icono width="22" height="22" />
              </div>
              <span className={`badge-est-tendencia ${est.subida ? 'subida' : 'bajada'}`}>
                {est.cambio}
              </span>
            </div>
            <div className="tarjeta-est-info">
              <span className="tarjeta-est-etiqueta">{est.etiqueta}</span>
              <div className="tarjeta-est-valor">{est.valor}</div>
            </div>
            <div className="tarjeta-est-pie">
              <span className="tarjeta-est-comparativa">vs. mes anterior</span>
              <svg className="sparkline-svg" width="80" height="30" viewBox="0 0 80 30" fill="none">
                <path d={est.sparklineD} stroke={est.colorStroke} strokeWidth="2.8" fill="none" strokeLinecap="round" />
              </svg>
            </div>
          </div>
        ))}
      </div>

      {/* RESUMEN DE VENTAS Y ÓRDENES RECIENTES */}
      <div className="grilla-tablero-principal">
        <div className="tarjeta-panel">
          <div className="tarjeta-panel-encabezado">
            <h3>Resumen de Ventas</h3>
            <div className="botones-filtro-tiempo">
              {['Hoy', 'Esta Semana', 'Este Mes'].map((t) => (
                <button
                  key={t}
                  className={`btn-filtro-tiempo ${filtroTiempo === t ? 'activo' : ''}`}
                  onClick={() => setFiltroTiempo(t)}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="resumen-ventas-contenido">
            <div className="resumen-metrica-caja">
              <h2>$1.248.000</h2>
              <p>Ventas de hoy <span style={{ color: '#16A34A', fontWeight: 700 }}>↑ 10.2%</span></p>

              <h3 style={{ fontSize: 18, fontWeight: 800 }}>32</h3>
              <p>Órdenes <span style={{ color: '#16A34A', fontWeight: 700 }}>↑ 5.1%</span></p>
            </div>

            <div style={{ position: 'relative', width: '100%', height: 160 }}>
              <svg width="100%" height="100%" viewBox="0 0 350 160" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="yellowGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#FFC107" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#FFC107" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                <path
                  d="M0,130 Q40,110 80,125 T160,80 T240,40 T320,60 L350,65 L350,160 L0,160 Z"
                  fill="url(#yellowGrad)"
                />
                <path
                  d="M0,130 Q40,110 80,125 T160,80 T240,40 T320,60 L350,65"
                  fill="none"
                  stroke="#FFC107"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />
                <circle cx="240" cy="40" r="5" fill="#FFC107" stroke="#FFFFFF" strokeWidth="2" />
              </svg>
              <div className="chart-tooltip-badge">
                $892.000 <span style={{ fontSize: 9, color: 'var(--texto-secundario)', fontWeight: 400 }}>16:00</span>
              </div>
            </div>

            <div className="donut-chart-container">
              <div className="donut-circle">
                <div className="donut-inner">78%</div>
              </div>
              <span style={{ fontSize: 11, color: '#666', fontWeight: 600 }}>Meta mensual</span>
              <span style={{ fontSize: 13, fontWeight: 800 }}>$16.000.000</span>
              <span style={{ fontSize: 10, color: '#999' }}>/ $20.000.000</span>
            </div>
          </div>
        </div>

        {/* ÓRDENES RECIENTES */}
        <div className="tarjeta-panel">
          <div className="tarjeta-panel-encabezado">
            <h3>Órdenes Recientes</h3>
            <Link className="tarjeta-enlace" to="/admin/ventas">Ver todas →</Link>
          </div>

          <div className="lista-ordenes-recientes">
            {ordenesRecientes.map((ord) => (
              <div className="elemento-orden-reciente" key={ord.id}>
                <div className="orden-info-izquierda">
                  <div className="orden-imagen-thumbnail">
                    <ord.icono width="20" height="20" />
                  </div>
                  <div className="orden-detalles">
                    <h4>Orden #{ord.id}</h4>
                    <span>{ord.tiempo}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span className={`insignia-estado-novacasa ${ord.estado}`}>
                    {ord.estadoTexto}
                  </span>
                  <span style={{ fontSize: 13.5, fontWeight: 800 }}>{ord.monto}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* PRODUCTOS MÁS VENDIDOS Y CATEGORÍAS */}
      <div className="grilla-tablero-secundaria">
        <div className="tarjeta-panel">
          <div className="tarjeta-panel-encabezado">
            <h3>Productos Más Vendidos</h3>
            <Link className="tarjeta-enlace" to="/admin/productos">Ver todos →</Link>
          </div>

          <div className="grilla-tarjetas-productos">
            {topProductos.map((p) => (
              <div className="tarjeta-producto-top" key={p.posicion}>
                <div className="badge-top-rank">{p.posicion}</div>
                <div className="producto-imagen-box">
                  <p.icono width="32" height="32" />
                </div>
                <h4>{p.nombre}</h4>
                <span>{p.ventas}</span>
                <div className="progreso-producto-barra">
                  <div className="progreso-producto-relleno" style={{ width: `${p.progreso}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="tarjeta-panel">
          <div className="tarjeta-panel-encabezado">
            <h3>Categorías Destacadas</h3>
            <Link className="tarjeta-enlace" to="/admin/categorias">Ver todas →</Link>
          </div>

          <div className="lista-categorias-destacadas">
            {categorias.map((cat) => (
              <div className="fila-categoria-item" key={cat.nombre}>
                <div className="categoria-icono-box">
                  <cat.icono width="16" height="16" />
                </div>
                <span className="categoria-nombre-label">{cat.nombre}</span>
                <div className="categoria-pista-barra">
                  <div className="categoria-relleno-barra" style={{ width: `${cat.porcentaje}%` }} />
                </div>
                <span className="categoria-porcentaje-val">{cat.porcentaje}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

/* ===== ICONOS UNIFICADOS SVG (SIN EMOJIS) ===== */
function IconoInicio({ className }) {
  return <svg className={className} width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>;
}
function IconoVentas(props) {
  return <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>;
}
function IconoProductos(props) {
  return <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /></svg>;
}
function IconoClientes(props) {
  return <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>;
}
function IconoOrdenes(props) {
  return <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" /><rect x="8" y="2" width="8" height="4" rx="1" ry="1" /></svg>;
}
function IconoCalendario(props) {
  return <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>;
}
function IconoHerramienta(props) {
  return <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" /></svg>;
}
function IconoMueble(props) {
  return <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 9V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v3" /><path d="M2 11v5a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-5a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2z" /><path d="M4 18v3" /><path d="M20 18v3" /></svg>;
}
function IconoIluminacion(props) {
  return <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18h6" /><path d="M10 22h4" /><path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1.55.59 2.97 1.5 4 .76.76 1.23 1.52 1.41 2.5" /></svg>;
}
function IconoDecoracion(props) {
  return <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z" /></svg>;
}
function IconoBano(props) {
  return <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12h16a1 1 0 0 1 1 1v3a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4v-3a1 1 0 0 1 1-1z" /><path d="M6 12V5a2 2 0 0 1 2-2h3" /></svg>;
}
function IconoEnvio(props) {
  return <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13" rx="2" /><polygon points="16 8 20 8 23 11 23 16 16 16 16 8" /><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" /></svg>;
}
function IconoEscudo(props) {
  return <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>;
}
function IconoSoporte(props) {
  return <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 18v-6a9 9 0 0 1 18 0v6" /><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" /></svg>;
}
function IconoEstrella(props) {
  return <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>;
}
