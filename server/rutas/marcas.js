// Rutas para MARCAS
// Permite ver, crear, editar y eliminar marcas de productos

import { Router } from 'express';
import pool from '../conexion.js';

const router = Router();

// Obtener todas las marcas
router.get('/', async (req, res) => {
  try {
    const [marcas] = await pool.query(
      'SELECT id_marca AS id, nombre, pais, contacto, estado FROM marca ORDER BY id_marca'
    );
    res.json(marcas);
  } catch (error) {
    console.error('Error al obtener marcas:', error.message);
    res.status(500).json({ error: 'No se pudieron cargar las marcas' });
  }
});

// Obtener una marca por ID
router.get('/:id', async (req, res) => {
  try {
    const [filas] = await pool.query(
      'SELECT id_marca AS id, nombre, pais, contacto, estado FROM marca WHERE id_marca = ?',
      [req.params.id]
    );
    if (filas.length === 0) return res.status(404).json({ error: 'Marca no encontrada' });
    res.json(filas[0]);
  } catch (error) {
    res.status(500).json({ error: 'Error al buscar la marca' });
  }
});

// Crear una nueva marca
router.post('/', async (req, res) => {
  try {
    const { nombre, pais, contacto, estado } = req.body;
    const [resultado] = await pool.query(
      'INSERT INTO marca (nombre, pais, contacto, estado) VALUES (?, ?, ?, ?)',
      [nombre, pais || null, contacto || null, estado || 'Activo']
    );
    res.status(201).json({ id: resultado.insertId, nombre, pais, contacto, estado: estado || 'Activo' });
  } catch (error) {
    console.error('Error al crear marca:', error.message);
    res.status(500).json({ error: 'No se pudo crear la marca' });
  }
});

// Editar una marca
router.put('/:id', async (req, res) => {
  try {
    const { nombre, pais, contacto, estado } = req.body;
    await pool.query(
      'UPDATE marca SET nombre = ?, pais = ?, contacto = ?, estado = ? WHERE id_marca = ?',
      [nombre, pais, contacto, estado, req.params.id]
    );
    res.json({ id: Number(req.params.id), nombre, pais, contacto, estado });
  } catch (error) {
    console.error('Error al editar marca:', error.message);
    res.status(500).json({ error: 'No se pudo editar la marca' });
  }
});

// Eliminar una marca
router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM marca WHERE id_marca = ?', [req.params.id]);
    res.json({ mensaje: 'Marca eliminada' });
  } catch (error) {
    console.error('Error al eliminar marca:', error.message);
    res.status(500).json({ error: 'No se pudo eliminar la marca' });
  }
});

export default router;
