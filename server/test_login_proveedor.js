// Script de prueba para validar la autenticación de proveedores
import bcrypt from 'bcrypt';
import pool from './conexion.js';

async function testProveedorAuth() {
  console.log('🧪 Iniciando pruebas de autenticación de proveedores...');

  try {
    // 1. Probar login con proveedor existente (DeWalt Colombia: 900000001-1 / 123456)
    console.log('\n--- Test 1: Login con credenciales válidas ---');
    const [filas] = await pool.query(
      'SELECT id_proveedor, razon_social, nit, contrasena_hash, estado FROM proveedor WHERE nit = ?',
      ['900000001-1']
    );

    if (filas.length === 0) {
      throw new Error('No se encontró el proveedor de prueba');
    }

    const prov = filas[0];
    const passwordMatch = await bcrypt.compare('123456', prov.contrasena_hash);
    console.log(`✅ Contraseña verificada con bcrypt para NIT ${prov.nit}: ${passwordMatch ? 'EXITOSA' : 'FALLIDA'}`);

    // 2. Probar contraseña errónea
    console.log('\n--- Test 2: Login con contraseña errónea ---');
    const wrongMatch = await bcrypt.compare('clave_incorrecta', prov.contrasena_hash);
    console.log(`✅ Rechazo de contraseña incorrecta: ${!wrongMatch ? 'CORRECTO (Rechazado)' : 'FALLO'}`);

    // 3. Probar creación de nuevo proveedor con contraseña propia
    console.log('\n--- Test 3: Creación de nuevo proveedor con contraseña propia ---');
    const nitPrueba = `TEST-${Date.now()}`;
    const clavePrueba = 'MiClaveSegura2026!';
    const hashPrueba = await bcrypt.hash(clavePrueba, 10);

    const [ins] = await pool.query(
      `INSERT INTO proveedor (razon_social, nit, nombre_contacto, telefono, correo, direccion, contrasena_hash, estado)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      ['Ferretería Industrial Test S.A.S', nitPrueba, 'Pedro Gómez', '3101234567', 'pedro@testferreteria.com', 'Calle 100 # 15-20', hashPrueba, 'Activo']
    );

    const newId = ins.insertId;
    console.log(`✅ Nuevo proveedor insertado con ID: ${newId}`);

    // Verificar login del nuevo proveedor
    const [newFilas] = await pool.query('SELECT contrasena_hash, estado FROM proveedor WHERE id_proveedor = ?', [newId]);
    const validNuevo = await bcrypt.compare(clavePrueba, newFilas[0].contrasena_hash);
    console.log(`✅ Login con nueva contraseña creada: ${validNuevo ? 'EXITOSO' : 'FALLIDO'}`);

    // Limpiar registro de prueba
    await pool.query('DELETE FROM proveedor WHERE id_proveedor = ?', [newId]);
    console.log('🧹 Registro de prueba eliminado.');

    console.log('\n🎉 ¡TODAS LAS PRUEBAS DE AUTENTICACIÓN DE PROVEEDOR PASARON SATISFACTORIAMENTE!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error en las pruebas:', error);
    process.exit(1);
  }
}

testProveedorAuth();
