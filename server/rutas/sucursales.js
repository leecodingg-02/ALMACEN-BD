// Rutas para SUCURSALES
// Permite listar y administrar sedes de la empresa y sus gerentes

import { Router } from 'express';
import pool from '../conexion.js';

const router = Router();

// Obtener todas las sucursales con el nombre de su gerente
router.get('/', async (req, res) => {
  try {
    const [sucursales] = await pool.query(`
      SELECT 
        s.id_suc AS id,
        s.nombre,
        s.departamento,
        s.ciudad,
        s.direccion,
        s.telefono,
        CONCAT(u.nombre, ' ', u.apellido) AS gerente,
        s.id_gerente,
        s.estado
      FROM sucursal s
      LEFT JOIN usuario u ON s.id_gerente = u.id_usu
      ORDER BY s.id_suc ASC
    `);
    res.json(sucursales);
  } catch (error) {
    console.error('Error al obtener sucursales:', error.message);
    res.status(500).json({ error: 'No se pudieron cargar las sucursales' });
  }
});

// Crear una sucursal
router.post('/', async (req, res) => {
  try {
    const { nombre, ciudad, direccion, telefono = '', id_gerente = null, estado = 'Activo' } = req.body;
    const [resultado] = await pool.query(
      'INSERT INTO sucursal (nombre, ciudad, direccion, telefono, id_gerente, estado) VALUES (?, ?, ?, ?, ?, ?)',
      [nombre, ciudad, direccion, telefono, id_gerente, estado]
    );
    res.status(201).json({ id: resultado.insertId, nombre, ciudad, direccion, telefono, estado });
  } catch (error) {
    console.error('Error al crear sucursal:', error.message);
    res.status(500).json({ error: 'No se pudo crear la sucursal' });
  }
});

// Editar una sucursal
router.put('/:id', async (req, res) => {
  try {
    const { nombre, ciudad, direccion, telefono, id_gerente, estado } = req.body;
    await pool.query(
      'UPDATE sucursal SET nombre = ?, ciudad = ?, direccion = ?, telefono = ?, id_gerente = ?, estado = ? WHERE id_suc = ?',
      [nombre, ciudad, direccion, telefono, id_gerente || null, estado, req.params.id]
    );
    res.json({ id: Number(req.params.id), nombre, ciudad, direccion, telefono, estado });
  } catch (error) {
    console.error('Error al editar sucursal:', error.message);
    res.status(500).json({ error: 'No se pudo actualizar la sucursal' });
  }
});

export default router;
