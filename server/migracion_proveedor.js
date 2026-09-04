// Script de migración para agregar contrasena_hash a la tabla proveedor
import bcrypt from 'bcrypt';
import pool from './conexion.js';

async function migrar() {
  console.log('🔄 Comprobando estructura de la tabla proveedor...');
  try {
    const [cols] = await pool.query("SHOW COLUMNS FROM proveedor LIKE 'contrasena_hash'");
    if (cols.length === 0) {
      console.log('➕ Agregando columna contrasena_hash a la tabla proveedor...');
      await pool.query('ALTER TABLE proveedor ADD COLUMN contrasena_hash VARCHAR(255) NULL AFTER direccion');
      console.log('✅ Columna contrasena_hash agregada.');
    } else {
      console.log('ℹ️ La columna contrasena_hash ya existe.');
    }

    const defaultHash = await bcrypt.hash('123456', 10);
    const [resultado] = await pool.query(
      'UPDATE proveedor SET contrasena_hash = ? WHERE contrasena_hash IS NULL OR contrasena_hash = ""',
      [defaultHash]
    );
    console.log(`✅ Proveedores actualizados con contraseña por defecto ('123456'): ${resultado.affectedRows}`);

    const [proveedores] = await pool.query('SELECT id_proveedor, razon_social, nit, contrasena_hash, estado FROM proveedor');
    console.log('📋 Lista de proveedores actual:', proveedores);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error en la migración:', error);
    process.exit(1);
  }
}

migrar();
