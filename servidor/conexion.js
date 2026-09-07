// Conexión a la base de datos MySQL
// Utiliza un grupo (pool) de conexiones para atender múltiples peticiones a la vez

import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';

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

// Comprobar la conexión y auto-migrar campos requeridos al arrancar
async function probarConexion() {
  try {
    const conexion = await pool.getConnection();
    console.log(`Conexión exitosa con MySQL :D — Base de datos: "${process.env.DB_NAME || 'bd_almacen_1'}"`);

    // Asegurar que la tabla proveedor tenga la columna contrasena_hash
    try {
      const [cols] = await conexion.query("SHOW COLUMNS FROM proveedor LIKE 'contrasena_hash'");
      if (cols.length === 0) {
        await conexion.query("ALTER TABLE proveedor ADD COLUMN contrasena_hash VARCHAR(255) NULL AFTER direccion");
        const defaultHash = await bcrypt.hash('123456', 10);
        await conexion.query("UPDATE proveedor SET contrasena_hash = ? WHERE contrasena_hash IS NULL OR contrasena_hash = ''", [defaultHash]);
        console.log(' Esquema verificado: Columna contrasena_hash agregada a la tabla proveedor.');
      }
    } catch {
      // Ignorar si la tabla aún no ha sido creada
    }

    // Asegurar que exista la tabla resena (reseñas de productos)
    try {
      await conexion.query(`
        CREATE TABLE IF NOT EXISTS resena (
          id_resena INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
          id_pro INT NOT NULL,
          id_usu INT NOT NULL,
          calificacion TINYINT NOT NULL,
          comentario VARCHAR(500) NOT NULL,
          fecha DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT fk_resena_producto
            FOREIGN KEY (id_pro) REFERENCES producto(id_pro) ON DELETE CASCADE,
          CONSTRAINT fk_resena_usuario
            FOREIGN KEY (id_usu) REFERENCES usuario(id_usu) ON DELETE CASCADE,
          CONSTRAINT chk_resena_calificacion CHECK (calificacion BETWEEN 1 AND 5),
          CONSTRAINT uq_resena_usuario_producto UNIQUE (id_pro, id_usu)
        )
      `);
      console.log('✅ Esquema verificado: tabla resena disponible.');
    } catch (e) {
      console.warn('⚠️ No se pudo crear/verificar la tabla resena:', e.message);
    }

    conexion.release();
  } catch (error) {
    console.error('X Error al conectar con MySQL:', error.message);
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.warn('💡 Consejo: Revisa la contraseña en tu archivo .env (campo DB_PASSWORD).');
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      console.warn('💡 Consejo: La base de datos aún no existe. Ejecuta en tu terminal: npm run init-db');
    }
  }
}

probarConexion();

export default pool;
