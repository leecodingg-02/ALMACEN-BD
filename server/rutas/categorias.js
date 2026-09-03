// Rutas para CATEGORÍAS
// Permite ver, crear, editar y eliminar categorías de productos

import { Router } from 'express';
import pool from '../conexion.js';

const router = Router();

// Obtener todas las categorías
router.get('/', async (req, res) => {
  try {
    const [categorias] = await pool.query(
      'SELECT id_categoria AS id, nombre, descripcion, estado FROM categoria ORDER BY id_categoria'
    );
    res.json(categorias);
  } catch (error) {
    console.error('Error al obtener categorías:', error.message);
    res.status(500).json({ error: 'No se pudieron cargar las categorías' });
  }
});

// Obtener una categoría por ID
router.get('/:id', async (req, res) => {
  try {
    const [filas] = await pool.query(
      'SELECT id_categoria AS id, nombre, descripcion, estado FROM categoria WHERE id_categoria = ?',
      [req.params.id]
    );
    if (filas.length === 0) return res.status(404).json({ error: 'Categoría no encontrada' });
    res.json(filas[0]);
  } catch (error) {
    res.status(500).json({ error: 'Error al buscar la categoría' });
  }
});

// Crear una nueva categoría
router.post('/', async (req, res) => {
  try {
    const { nombre, descripcion, estado } = req.body;
    const [resultado] = await pool.query(
      'INSERT INTO categoria (nombre, descripcion, estado) VALUES (?, ?, ?)',
      [nombre, descripcion || null, estado || 'Activo']
    );
    res.status(201).json({ id: resultado.insertId, nombre, descripcion, estado: estado || 'Activo' });
  } catch (error) {
    console.error('Error al crear categoría:', error.message);
    res.status(500).json({ error: 'No se pudo crear la categoría' });
  }
});

// Editar una categoría existente
router.put('/:id', async (req, res) => {
  try {
    const { nombre, descripcion, estado } = req.body;
    await pool.query(
      'UPDATE categoria SET nombre = ?, descripcion = ?, estado = ? WHERE id_categoria = ?',
      [nombre, descripcion, estado, req.params.id]
    );
    res.json({ id: Number(req.params.id), nombre, descripcion, estado });
  } catch (error) {
    console.error('Error al editar categoría:', error.message);
    res.status(500).json({ error: 'No se pudo editar la categoría' });
  }
});

// Eliminar una categoría
router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM categoria WHERE id_categoria = ?', [req.params.id]);
    res.json({ mensaje: 'Categoría eliminada' });
  } catch (error) {
    console.error('Error al eliminar categoría:', error.message);
    res.status(500).json({ error: 'No se pudo eliminar la categoría' });
  }
});

export default router;
