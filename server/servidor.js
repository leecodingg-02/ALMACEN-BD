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

// Permitir conexiones desde cualquier puerto local de desarrollo (Vite)
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:4173', 'http://localhost:3000', 'http://127.0.0.1:5173'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
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

// Resumen del Dashboard administrativo
app.get('/api/dashboard', async (req, res) => {
  try {
    const [[{ totalVentas }]] = await pool.query('SELECT COALESCE(SUM(total), 0) AS totalVentas FROM venta WHERE estado != "Cancelada"');
    const [[{ totalOrdenes }]] = await pool.query('SELECT COUNT(*) AS totalOrdenes FROM venta');
    const [[{ totalProductos }]] = await pool.query('SELECT COUNT(*) AS totalProductos FROM producto WHERE estado = "Activo"');
    const [[{ bajoStock }]] = await pool.query('SELECT COUNT(*) AS bajoStock FROM inventario WHERE cantidad <= stock_minimo');

    const [ventasRecientes] = await pool.query(`
      SELECT 
        v.id_venta AS id,
        DATE_FORMAT(v.fecha_venta, '%Y-%m-%d') AS fecha,
        COALESCE(CONCAT(u.nombre, ' ', u.apellido), 'Cliente Mostrador') AS cliente,
        v.total,
        v.estado
      FROM venta v
      LEFT JOIN usuario u ON v.id_cli = u.id_usu
      ORDER BY v.fecha_venta DESC, v.id_venta DESC
      LIMIT 5
    `);

    res.json({
      totalVentas: Number(totalVentas),
      totalOrdenes: Number(totalOrdenes),
      totalProductos: Number(totalProductos),
      bajoStock: Number(bajoStock),
      ventasRecientes
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
