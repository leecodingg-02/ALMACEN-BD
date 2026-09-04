// Script para importar la base de datos MySQL
// Ejecuta el archivo BDMysql/BD_almacen_NovaCasa.sql directamente en tu MySQL

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function importarBaseDeDatos() {
  console.log('🔄 Iniciando importación de la base de datos NovaCasa...');

  // Configuración de conexión (sin seleccionar base de datos inicialmente para poder crearla)
  const config = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    port: Number(process.env.DB_PORT) || 3306,
    multipleStatements: true // Permite ejecutar el script completo con múltiples instrucciones
  };

  let conexion;
  try {
    conexion = await mysql.createConnection(config);
    console.log(`✅ Conectado al servidor MySQL (${config.host}:${config.port})`);

    // Ruta al archivo SQL
    const rutaSql = path.resolve(__dirname, '../BDMysql/BD_almacen_NovaCasa.sql');
    if (!fs.existsSync(rutaSql)) {
      throw new Error(`No se encontró el archivo SQL en: ${rutaSql}`);
    }

    console.log('📖 Leyendo archivo SQL...');
    const contenidoSql = fs.readFileSync(rutaSql, 'utf-8');

    console.log('⚙️ Ejecutando sentencias SQL (creando tablas e insertando datos)...');
    await conexion.query(contenidoSql);

    console.log('🎉 ¡Base de datos bd_almacen_1 importada con éxito!');
    console.log('💡 Ya puedes iniciar tu servidor con: npm run server');
  } catch (error) {
    console.error('❌ Error durante la importación:');
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('👉 Error de acceso: La contraseña de MySQL no es correcta.');
      console.error('   Por favor abre el archivo .env y pon tu contraseña en: DB_PASSWORD=tu_clave');
    } else if (error.code === 'ECONNREFUSED') {
      console.error('👉 No se pudo conectar con MySQL en el puerto 3306. Verifica que el servicio MySQL esté iniciado.');
    } else {
      console.error(error.message);
    }
    process.exit(1);
  } finally {
    if (conexion) await conexion.end();
  }
}

importarBaseDeDatos();
