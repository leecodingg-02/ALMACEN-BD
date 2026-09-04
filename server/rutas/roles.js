// Rutas para ROLES
// Permite consultar los roles y cuántos usuarios tienen asignados

import { Router } from 'express';
import pool from '../conexion.js';

const router = Router();

// Obtener todos los roles con el conteo de usuarios asignados
router.get('/', async (req, res) => {
  try {
    const [roles] = await pool.query(`
      SELECT 
        r.id_rol AS id,
        r.nombre,
        r.descripcion,
        r.color,
        r.estado,
        CASE 
          WHEN r.nombre = 'Administrador' THEN 12
          WHEN r.nombre = 'Supervisor' THEN 8
          WHEN r.nombre = 'Vendedor' THEN 5
          WHEN r.nombre = 'Bodeguero' THEN 4
          ELSE 2
        END AS permisos,
        COUNT(u.id_usu) AS usuarios
      FROM rol r
      LEFT JOIN usuario u ON r.id_rol = u.id_rol
      GROUP BY r.id_rol, r.nombre, r.descripcion, r.color, r.estado
      ORDER BY r.id_rol ASC
    `);
    res.json(roles);
  } catch (error) {
    console.error('Error al obtener roles:', error.message);
    res.status(500).json({ error: 'No se pudieron cargar los roles' });
  }
});

// Crear un nuevo rol
router.post('/', async (req, res) => {
  try {
    const { nombre, descripcion = '', color = '#FFC107', estado = 'Activo' } = req.body;
    const [resultado] = await pool.query(
      'INSERT INTO rol (nombre, descripcion, color, estado) VALUES (?, ?, ?, ?)',
      [nombre, descripcion, color, estado]
    );
    res.status(201).json({ id: resultado.insertId, nombre, descripcion, color, estado, usuarios: 0, permisos: 3 });
  } catch (error) {
    console.error('Error al crear rol:', error.message);
    res.status(500).json({ error: 'No se pudo crear el rol' });
  }
});

// Editar un rol
router.put('/:id', async (req, res) => {
  try {
    const { nombre, descripcion, color, estado } = req.body;
    await pool.query(
      'UPDATE rol SET nombre = ?, descripcion = ?, color = ?, estado = ? WHERE id_rol = ?',
      [nombre, descripcion, color, estado, req.params.id]
    );
    res.json({ id: Number(req.params.id), nombre, descripcion, color, estado });
  } catch (error) {
    console.error('Error al editar rol:', error.message);
    res.status(500).json({ error: 'No se pudo actualizar el rol' });
  }
});

export default router;
