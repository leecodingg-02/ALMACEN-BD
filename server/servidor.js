// Servidor principal de NovaCasa
// Configura Express, conexión MySQL y expone las APIs del sistema

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pool from './conexion.js';

// Cargar variables del entorno (.env)
dotenv.config();

// Importar los módulos de rutas
import rutasCategorias from './rutas/categorias.js';
import rutasMarcas from './rutas/marcas.js';
import rutasProductos from './rutas/productos.js';
import rutasUsuarios from './rutas/usuarios.js';
import rutasRoles from './rutas/roles.js';
import rutasSucursales from './rutas/sucursales.js';
import rutasInventario from './rutas/inventario.js';
import rutasVentas from './rutas/ventas.js';
import rutasCompras from './rutas/compras.js';
import rutasProveedores from './rutas/proveedores.js';
import rutasUbicaciones from './rutas/ubicaciones.js';

const app = express();
const PUERTO = process.env.PUERTO_SERVIDOR || 3001;

// Permitir conexiones desde cualquier origen en desarrollo (Vite)
app.use(cors({
  origin: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true
}));

// Interpretar datos enviados en formato JSON
app.use(express.json());

// Ruta de diagnóstico: comprueba si la API y MySQL están respondiendo
app.get('/api/estado', async (req, res) => {
  try {
    const conexion = await pool.getConnection();
    const [dbRes] = await conexion.query('SELECT DATABASE() AS bd, NOW() AS fecha');
    conexion.release();
    res.json({
      estado: 'conectado',
      mensaje: '✅ Conexión con base de datos MySQL exitosa',
      baseDatos: dbRes[0].bd,
      horaServidor: dbRes[0].fecha
    });
  } catch (error) {
    res.status(503).json({
      estado: 'desconectado',
      mensaje: '⚠️ El servidor está activo pero no pudo conectar con MySQL',
      error: error.message,
      sugerencia: 'Verifica la contraseña (DB_PASSWORD) en tu archivo .env'
    });
  }
});

// Resumen del Dashboard administrativo con métricas reales de MySQL
app.get('/api/dashboard', async (req, res) => {
  try {
    const periodo = req.query.periodo || 'Hoy';

    // Helper para tendencias de porcentaje
    const calcTendencia = (actual, anterior) => {
      const act = Number(actual || 0);
      const ant = Number(anterior || 0);
      if (ant === 0) {
        if (act > 0) return { cambio: '↑ 100%', subida: true };
        return { cambio: '0%', subida: true };
      }
      const pct = ((act - ant) / ant) * 100;
      const esSubida = pct >= 0;
      const signo = esSubida ? '↑' : '↓';
      return {
        cambio: `${signo} ${Math.abs(pct).toFixed(1)}%`,
        subida: esSubida
      };
    };

    // 1. Métricas Globales
    const [[{ totalVentas }]] = await pool.query('SELECT COALESCE(SUM(total), 0) AS totalVentas FROM venta WHERE estado != "Cancelada"');
    const [[{ totalOrdenes }]] = await pool.query('SELECT COUNT(*) AS totalOrdenes FROM venta');
    const [[{ totalProductos }]] = await pool.query('SELECT COUNT(*) AS totalProductos FROM producto WHERE estado = "Activo"');
    const [[{ bajoStock }]] = await pool.query('SELECT COUNT(*) AS bajoStock FROM inventario WHERE cantidad <= stock_minimo');
    const [[{ totalClientes }]] = await pool.query('SELECT COUNT(*) AS totalClientes FROM usuario WHERE id_rol = 2');

    // Tendencias de tarjetas KPI (Mes actual vs Mes anterior)
    const [[{ ventasMesAct }]] = await pool.query('SELECT COALESCE(SUM(total), 0) AS total FROM venta WHERE estado != "Cancelada" AND MONTH(fecha_venta) = MONTH(NOW()) AND YEAR(fecha_venta) = YEAR(NOW())');
    const [[{ ventasMesAnt }]] = await pool.query('SELECT COALESCE(SUM(total), 0) AS total FROM venta WHERE estado != "Cancelada" AND MONTH(fecha_venta) = MONTH(DATE_SUB(NOW(), INTERVAL 1 MONTH)) AND YEAR(fecha_venta) = YEAR(DATE_SUB(NOW(), INTERVAL 1 MONTH))');
    
    const [[{ ordenesMesAct }]] = await pool.query('SELECT COUNT(*) AS total FROM venta WHERE MONTH(fecha_venta) = MONTH(NOW()) AND YEAR(fecha_venta) = YEAR(NOW())');
    const [[{ ordenesMesAnt }]] = await pool.query('SELECT COUNT(*) AS total FROM venta WHERE MONTH(fecha_venta) = MONTH(DATE_SUB(NOW(), INTERVAL 1 MONTH)) AND YEAR(fecha_venta) = YEAR(DATE_SUB(NOW(), INTERVAL 1 MONTH))');

    const [[{ clientesMesAct }]] = await pool.query('SELECT COUNT(*) AS total FROM usuario WHERE id_rol = 2 AND MONTH(fecha_registro) = MONTH(NOW()) AND YEAR(fecha_registro) = YEAR(NOW())');
    const [[{ clientesMesAnt }]] = await pool.query('SELECT COUNT(*) AS total FROM usuario WHERE id_rol = 2 AND MONTH(fecha_registro) = MONTH(DATE_SUB(NOW(), INTERVAL 1 MONTH)) AND YEAR(fecha_registro) = YEAR(DATE_SUB(NOW(), INTERVAL 1 MONTH))');

    const tendenciaVentas = calcTendencia(ventasMesAct, ventasMesAnt);
    const tendenciaOrdenes = calcTendencia(ordenesMesAct, ordenesMesAnt);
    const tendenciaClientes = calcTendencia(clientesMesAct, clientesMesAnt);

    // 2. Resumen de Ventas según filtro de tiempo (Hoy, Esta Semana, Este Mes)
    let ventasResumen = 0;
    let ordenesResumen = 0;
    let ventasResumenPrev = 0;
    let ordenesResumenPrev = 0;
    let puntosGrafico = [];

    if (periodo === 'Hoy') {
      const [[vToday]] = await pool.query('SELECT COALESCE(SUM(total), 0) AS total, COUNT(*) AS ordenes FROM venta WHERE estado != "Cancelada" AND DATE(fecha_venta) = CURDATE()');
      const [[vYesterday]] = await pool.query('SELECT COALESCE(SUM(total), 0) AS total, COUNT(*) AS ordenes FROM venta WHERE estado != "Cancelada" AND DATE(fecha_venta) = DATE_SUB(CURDATE(), INTERVAL 1 DAY)');
      ventasResumen = vToday.total;
      ordenesResumen = vToday.ordenes;
      ventasResumenPrev = vYesterday.total;
      ordenesResumenPrev = vYesterday.ordenes;

      // Puntos del gráfico por franjas horarias de hoy
      const [horas] = await pool.query(`
        SELECT 
          HOUR(fecha_venta) AS hora,
          COALESCE(SUM(total), 0) AS total
        FROM venta
        WHERE estado != "Cancelada" AND DATE(fecha_venta) = CURDATE()
        GROUP BY HOUR(fecha_venta)
        ORDER BY hora ASC
      `);

      const horasMap = {};
      horas.forEach(h => { horasMap[h.hora] = Number(h.total); });
      const franjas = [6, 9, 12, 15, 18, 21];
      puntosGrafico = franjas.map(f => ({
        etiqueta: `${f}:00`,
        total: horasMap[f] || (horasMap[f-1] || 0) + (horasMap[f+1] || 0)
      }));
    } else if (periodo === 'Esta Semana') {
      const [[vWeek]] = await pool.query('SELECT COALESCE(SUM(total), 0) AS total, COUNT(*) AS ordenes FROM venta WHERE estado != "Cancelada" AND YEARWEEK(fecha_venta, 1) = YEARWEEK(NOW(), 1)');
      const [[vPrevWeek]] = await pool.query('SELECT COALESCE(SUM(total), 0) AS total, COUNT(*) AS ordenes FROM venta WHERE estado != "Cancelada" AND YEARWEEK(fecha_venta, 1) = YEARWEEK(DATE_SUB(NOW(), INTERVAL 1 WEEK), 1)');
      ventasResumen = vWeek.total;
      ordenesResumen = vWeek.ordenes;
      ventasResumenPrev = vPrevWeek.total;
      ordenesResumenPrev = vPrevWeek.ordenes;

      // Puntos del gráfico por día de la semana
      const [diasSemana] = await pool.query(`
        SELECT 
          DAYNAME(fecha_venta) AS diaNombre,
          DAYOFWEEK(fecha_venta) AS diaNum,
          COALESCE(SUM(total), 0) AS total
        FROM venta
        WHERE estado != "Cancelada" AND YEARWEEK(fecha_venta, 1) = YEARWEEK(NOW(), 1)
        GROUP BY diaNum, diaNombre
        ORDER BY diaNum ASC
      `);

      const nombresDias = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
      const diasMap = {};
      diasSemana.forEach(d => { diasMap[d.diaNum] = Number(d.total); });
      puntosGrafico = [2, 3, 4, 5, 6, 7, 1].map(num => ({
        etiqueta: nombresDias[num - 1],
        total: diasMap[num] || 0
      }));
    } else {
      // Este Mes
      ventasResumen = ventasMesAct;
      ordenesResumen = ordenesMesAct;
      ventasResumenPrev = ventasMesAnt;
      ordenesResumenPrev = ordenesMesAnt;

      // Puntos por semanas del mes
      const [diasMes] = await pool.query(`
        SELECT 
          DAY(fecha_venta) AS dia,
          COALESCE(SUM(total), 0) AS total
        FROM venta
        WHERE estado != "Cancelada" AND MONTH(fecha_venta) = MONTH(NOW()) AND YEAR(fecha_venta) = YEAR(NOW())
        GROUP BY dia
        ORDER BY dia ASC
      `);

      const diasMap = {};
      diasMes.forEach(d => { diasMap[d.dia] = Number(d.total); });
      puntosGrafico = [5, 10, 15, 20, 25, 30].map(dia => ({
        etiqueta: `Día ${dia}`,
        total: (diasMap[dia] || 0) + (diasMap[dia - 1] || 0) + (diasMap[dia + 1] || 0)
      }));
    }

    const tendenciaResumenVentas = calcTendencia(ventasResumen, ventasResumenPrev);
    const tendenciaResumenOrdenes = calcTendencia(ordenesResumen, ordenesResumenPrev);

    // 3. Ventas Recientes
    const [ventasRecientes] = await pool.query(`
      SELECT 
        v.id_venta AS id,
        DATE_FORMAT(v.fecha_venta, '%Y-%m-%d %H:%i') AS fecha,
        COALESCE(CONCAT(u.nombre, ' ', u.apellido), 'Cliente Mostrador') AS cliente,
        v.total,
        v.estado
      FROM venta v
      LEFT JOIN usuario u ON v.id_cli = u.id_usu
      ORDER BY v.fecha_venta DESC, v.id_venta DESC
      LIMIT 5
    `);

    // 4. Top Productos más vendidos (Solo productos efectivamente vendidos)
    const [topProductos] = await pool.query(`
      SELECT
        p.nombre,
        SUM(dv.cantidad) AS cantidad
      FROM producto p
      INNER JOIN detalle_venta dv ON p.id_pro = dv.id_pro
      INNER JOIN venta v ON dv.id_venta = v.id_venta
      WHERE v.estado != 'Cancelada'
      GROUP BY p.id_pro, p.nombre
      HAVING cantidad > 0
      ORDER BY cantidad DESC, p.id_pro ASC
      LIMIT 4
    `);

    // 5. Categorías con ventas reales (Solo categorías cuyos productos se han vendido efectivamente)
    const [categorias] = await pool.query(`
      SELECT
        c.nombre,
        SUM(dv.cantidad) AS cantidad,
        COALESCE(SUM(dv.subtotal), 0) AS total_ventas
      FROM categoria c
      INNER JOIN producto p ON c.id_categoria = p.id_categoria
      INNER JOIN detalle_venta dv ON p.id_pro = dv.id_pro
      INNER JOIN venta v ON dv.id_venta = v.id_venta
      WHERE v.estado != 'Cancelada'
      GROUP BY c.id_categoria, c.nombre
      HAVING cantidad > 0
      ORDER BY cantidad DESC, total_ventas DESC
      LIMIT 5
    `);

    res.json({
      totalVentas: Number(totalVentas),
      totalOrdenes: Number(totalOrdenes),
      totalProductos: Number(totalProductos),
      totalClientes: Number(totalClientes),
      bajoStock: Number(bajoStock),
      tendenciaVentas,
      tendenciaOrdenes,
      tendenciaClientes,
      resumenPeriodo: {
        periodo,
        ventas: Number(ventasResumen),
        ordenes: Number(ordenesResumen),
        ventasTendencia: tendenciaResumenVentas,
        ordenesTendencia: tendenciaResumenOrdenes,
        puntosGrafico
      },
      ventasRecientes,
      topProductos,
      categorias
    });
  } catch (error) {
    console.error('Error al obtener dashboard:', error.message);
    res.status(500).json({ error: 'No se pudieron cargar las métricas del dashboard' });
  }
});

// Conectar cada grupo de rutas a su dirección correspondiente
app.use('/api/categorias', rutasCategorias);
app.use('/api/marcas', rutasMarcas);
app.use('/api/productos', rutasProductos);
app.use('/api/usuarios', rutasUsuarios);
app.use('/api/roles', rutasRoles);
app.use('/api/sucursales', rutasSucursales);
app.use('/api/inventario', rutasInventario);
app.use('/api/ventas', rutasVentas);
app.use('/api/compras', rutasCompras);
app.use('/api/proveedores', rutasProveedores);
app.use('/api/ubicaciones', rutasUbicaciones);

// Iniciar el servidor backend
app.listen(PUERTO, () => {
  console.log(`🚀 Servidor NovaCasa corriendo en http://localhost:${PUERTO}`);
});

export default app;
