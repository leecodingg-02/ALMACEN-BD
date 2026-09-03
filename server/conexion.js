// Conexión a la base de datos MySQL
// Usa un "pool" para manejar varias conexiones al mismo tiempo

import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

// Cargar las variables del archivo .env
dotenv.config();

// Crear el pool de conexiones
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'bd_almacen_1',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,  // Espera si no hay conexiones libres
  connectionLimit: 10,       // Máximo 10 conexiones a la vez
  queueLimit: 0              // Sin límite de espera en cola
});

// Verificar que la conexión funcione al iniciar
async function probarConexion() {
  try {
    const conexion = await pool.getConnection();
    console.log('✅ Conectado a MySQL — Base de datos:', process.env.DB_NAME);
    conexion.release(); // Liberar la conexión
  } catch (error) {
    console.error('❌ Error al conectar con MySQL:', error.message);
  }
}

probarConexion();

export default pool;
