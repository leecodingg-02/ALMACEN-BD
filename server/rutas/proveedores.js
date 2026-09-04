// Rutas para PROVEEDORES
// Permite listar y gestionar los proveedores de mercancía

import { Router } from 'express';
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

export default router;
