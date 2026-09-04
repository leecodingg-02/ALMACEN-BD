// Rutas para PROVEEDORES
// Permite listar y gestionar los proveedores de mercancía

import { Router } from 'express';
import bcrypt from 'bcrypt';
import pool from '../conexion.js';

const router = Router();

// Obtener todos los proveedores
router.get('/', async (req, res) => {
  try {
    const [proveedores] = await pool.query(`
      SELECT 
        id_proveedor AS id,
        razon_social AS nombre,
        nit,
        nombre_contacto,
        telefono,
        correo,
        direccion,
        estado
      FROM proveedor
      ORDER BY id_proveedor ASC
    `);
    res.json(proveedores);
  } catch (error) {
    console.error('Error al obtener proveedores:', error.message);
    res.status(500).json({ error: 'No se pudieron cargar los proveedores' });
  }
});

// Crear un proveedor
router.post('/', async (req, res) => {
  try {
    const { razon_social, nit, nombre_contacto, telefono, correo, direccion, estado = 'Activo' } = req.body;
    const [resultado] = await pool.query(`
      INSERT INTO proveedor (razon_social, nit, nombre_contacto, telefono, correo, direccion, estado)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [razon_social, nit || `NIT-${Date.now()}`, nombre_contacto || null, telefono || null, correo || null, direccion || null, estado]);

    res.status(201).json({ id: resultado.insertId, razon_social, estado });
  } catch (error) {
    console.error('Error al crear proveedor:', error.message);
    res.status(500).json({ error: 'No se pudo crear el proveedor' });
  }
});

// Iniciar sesión de proveedor con NIT y contraseña (tabla proveedor)
router.post('/login', async (req, res) => {
  try {
    const { nit, contrasena } = req.body;

    if (!nit || !contrasena) {
      return res.status(400).json({ error: 'NIT y contraseña requeridos' });
    }

    const [filas] = await pool.query(
      `SELECT id_proveedor, razon_social, nit, nombre_contacto, telefono, correo,
              direccion, estado, contrasena_hash
       FROM proveedor
       WHERE nit = ?
       LIMIT 1`,
      [String(nit).trim()]
    );

    if (filas.length === 0) {
      return res.status(401).json({ error: 'NIT o contraseña incorrectos' });
    }

    const proveedor = filas[0];

    // Verificar contraseña: bcrypt si el hash empieza con $2, o texto plano (compatibilidad)
    let contrasenaValida = false;
    if (proveedor.contrasena_hash?.startsWith('$2')) {
      contrasenaValida = await bcrypt.compare(contrasena, proveedor.contrasena_hash);
    } else {
      contrasenaValida = proveedor.contrasena_hash === contrasena;
    }

    if (!contrasenaValida) {
      return res.status(401).json({ error: 'NIT o contraseña incorrectos' });
    }

    if (proveedor.estado !== 'Activo') {
      return res.status(403).json({ error: 'Este proveedor se encuentra inactivo' });
    }

    // No devolver el hash de la contraseña por seguridad
    delete proveedor.contrasena_hash;

    res.json({
      id_proveedor: proveedor.id_proveedor,
      razon_social: proveedor.razon_social,
      nombre: proveedor.razon_social,
      nit: proveedor.nit,
      nombre_contacto: proveedor.nombre_contacto,
      telefono: proveedor.telefono,
      correo: proveedor.correo,
      direccion: proveedor.direccion,
      estado: proveedor.estado,
    });
  } catch (error) {
    console.error('Error en login de proveedor:', error.message);
    res.status(500).json({ error: 'Error al iniciar sesión del proveedor' });
  }
});

export default router;
