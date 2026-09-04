// Script para exportar la base de datos MySQL con todos los datos actuales
// Genera un archivo .sql que puedes llevar a otro computador e importar

import { exec } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ruta de mysqldump (ajusta si tu MySQL está en otra ubicación)
const MYSQLDUMP = 'C:\\Program Files\\MySQL\\MySQL Server 8.0\\bin\\mysqldump.exe';

// Configuración desde .env
const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_USER = process.env.DB_USER || 'root';
const DB_PASSWORD = process.env.DB_PASSWORD || '';
const DB_NAME = process.env.DB_NAME || 'bd_almacen_1';
const DB_PORT = process.env.DB_PORT || '3306';

// Nombre del archivo de salida (con fecha)
const fecha = new Date().toISOString().slice(0, 10).replace(/-/g, '');
const archivoSalida = path.resolve(__dirname, `../BDMysql/backup_${DB_NAME}_${fecha}.sql`);

console.log('🔄 Exportando la base de datos...');
console.log(`   Base de datos: ${DB_NAME}`);
console.log(`   Archivo de salida: ${archivoSalida}`);

// Construir el comando mysqldump
const comando = `"${MYSQLDUMP}" -h ${DB_HOST} -P ${DB_PORT} -u ${DB_USER} ${DB_PASSWORD ? `-p${DB_PASSWORD}` : ''} --databases ${DB_NAME} --routines --triggers --events > "${archivoSalida}"`;

exec(comando, (error, stdout, stderr) => {
  if (error) {
    console.error('❌ Error al exportar la base de datos:');
    if (stderr.includes('Access denied')) {
      console.error('👉 La contraseña de MySQL es incorrecta. Revisa el archivo .env (DB_PASSWORD).');
    } else if (stderr.includes('Unknown database')) {
      console.error(`👉 La base de datos "${DB_NAME}" no existe.`);
    } else {
      console.error(stderr);
    }
    process.exit(1);
  }

  console.log('🎉 ¡Base de datos exportada con éxito!');
  console.log(`📁 Archivo generado: ${archivoSalida}`);
  console.log('');
  console.log('💡 Para importarla en otro computador, copia este archivo .sql');
  console.log('   y ejecuta: npm run importar-backup');
});