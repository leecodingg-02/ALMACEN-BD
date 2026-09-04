// Script para importar un backup de la base de datos MySQL
// Busca el archivo .sql más reciente en la carpeta BDMysql/ y lo importa

import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ruta de mysql (ajusta si tu MySQL está en otra ubicación)
const MYSQL = 'C:\\Program Files\\MySQL\\MySQL Server 8.0\\bin\\mysql.exe';

// Configuración desde .env
const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_USER = process.env.DB_USER || 'root';
const DB_PASSWORD = process.env.DB_PASSWORD || '';
const DB_PORT = process.env.DB_PORT || '3306';

// Buscar el archivo de backup más reciente
const carpetaBD = path.resolve(__dirname, '../BDMysql');
const archivos = fs.readdirSync(carpetaBD)
  .filter((f) => f.startsWith('backup_') && f.endsWith('.sql'))
  .sort()
  .reverse();

if (archivos.length === 0) {
  console.error('❌ No se encontró ningún archivo de backup (backup_*.sql) en la carpeta BDMysql/');
  console.error('   Copia el archivo .sql exportado a la carpeta BDMysql/ y vuelve a intentar.');
  process.exit(1);
}

const archivoBackup = path.join(carpetaBD, archivos[0]);

console.log('🔄 Importando backup de la base de datos...');
console.log(`   Archivo: ${archivoBackup}`);

// Construir el comando mysql
const comando = `"${MYSQL}" -h ${DB_HOST} -P ${DB_PORT} -u ${DB_USER} ${DB_PASSWORD ? `-p${DB_PASSWORD}` : ''} < "${archivoBackup}"`;

exec(comando, (error, stdout, stderr) => {
  if (error) {
    console.error('❌ Error al importar el backup:');
    if (stderr.includes('Access denied')) {
      console.error('👉 La contraseña de MySQL es incorrecta. Revisa el archivo .env (DB_PASSWORD).');
    } else {
      console.error(stderr);
    }
    process.exit(1);
  }

  console.log('🎉 ¡Backup importado con éxito!');
  console.log('💡 Ya puedes iniciar tu servidor con: npm run server');
});