// Servidor principal de NovaCasa
// Aquí se configura Express, cors y se conectan todas las rutas

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

// Importar las rutas de cada sección
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

const app = express();
const PUERTO = process.env.PUERTO_SERVIDOR || 3001;

// Permitir que el frontend (Vite en puerto 5173) se comunique con este servidor
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:4173'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
}));

// Permitir recibir datos en formato JSON
app.use(express.json());

// Ruta de prueba para verificar que el servidor está activo
app.get('/api', (req, res) => {
  res.json({ mensaje: '🏠 API NovaCasa funcionando correctamente' });
});

// Conectar cada grupo de rutas a su dirección
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

// Iniciar el servidor
app.listen(PUERTO, () => {
  console.log(`🚀 Servidor NovaCasa corriendo en http://localhost:${PUERTO}`);
});
