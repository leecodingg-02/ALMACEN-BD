// Conexión a la base de datos MySQL
// Utiliza un grupo (pool) de conexiones para atender múltiples peticiones a la vez

import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

// Cargar las variables del archivo .env
dotenv.config();

// Crear el grupo de conexiones a MySQL
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'bd_almacen_1',
  port: Number(process.env.DB_PORT) || 3306,
  waitForConnections: true,  // Espera automáticamente si las conexiones están ocupadas
  connectionLimit: 10,       // Permite hasta 10 conexiones simultáneas
  queueLimit: 0              // Cola de espera ilimitada
});

// Comprobar la conexión al arrancar el servidor
async function probarConexion() {
  try {
    const conexion = await pool.getConnection();
    console.log(`✅ Conexión exitosa con MySQL — Base de datos: "${process.env.DB_NAME || 'bd_almacen_1'}"`);
    conexion.release();
  } catch (error) {
    console.error('❌ Error al conectar con MySQL:', error.message);
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.warn('💡 Consejo: Revisa la contraseña en tu archivo .env (campo DB_PASSWORD).');
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      console.warn('💡 Consejo: La base de datos aún no existe. Ejecuta en tu terminal: npm run init-db');
    }
  }
}

probarConexion();

export default pool;
