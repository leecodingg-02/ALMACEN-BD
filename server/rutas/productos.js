// Rutas para PRODUCTOS
// Incluye JOIN con categoría y marca para mostrar nombres en vez de IDs

import { Router } from 'express';
import pool from '../conexion.js';

const router = Router();

// Obtener todos los productos (con nombre de categoría y marca)
router.get('/', async (req, res) => {
  try {
    const [productos] = await pool.query(`
      SELECT 
        p.id_pro AS id,
        p.nombre,
        p.descripcion,
        p.id_categoria,
        c.nombre AS categoria,
        p.id_marca,
        m.nombre AS marca,
        p.precio,
        p.imagen_url AS imagen,
        p.garantia_dias,
        p.estado,
        p.fecha_creacion
      FROM producto p
      LEFT JOIN categoria c ON p.id_categoria = c.id_categoria
      LEFT JOIN marca m ON p.id_marca = m.id_marca
      ORDER BY p.id_pro
    `);
    res.json(productos);
  } catch (error) {
    console.error('Error al obtener productos:', error.message);
    res.status(500).json({ error: 'No se pudieron cargar los productos' });
  }
});

// Obtener un producto por ID
router.get('/:id', async (req, res) => {
  try {
    const [filas] = await pool.query(`
      SELECT 
        p.id_pro AS id, p.nombre, p.descripcion,
        p.id_categoria, c.nombre AS categoria,
        p.id_marca, m.nombre AS marca,
        p.precio, p.imagen_url AS imagen,
        p.garantia_dias, p.estado, p.fecha_creacion
      FROM producto p
      LEFT JOIN categoria c ON p.id_categoria = c.id_categoria
      LEFT JOIN marca m ON p.id_marca = m.id_marca
      WHERE p.id_pro = ?
    `, [req.params.id]);
    if (filas.length === 0) return res.status(404).json({ error: 'Producto no encontrado' });
    res.json(filas[0]);
  } catch (error) {
    res.status(500).json({ error: 'Error al buscar el producto' });
  }
});

// Crear un nuevo producto
router.post('/', async (req, res) => {
  try {
    const { nombre, descripcion, id_categoria, id_marca, precio, imagen_url, garantia_dias, estado } = req.body;
    const [resultado] = await pool.query(
      `INSERT INTO producto (nombre, descripcion, id_categoria, id_marca, precio, imagen_url, garantia_dias, estado) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [nombre, descripcion || null, id_categoria, id_marca, precio, imagen_url || null, garantia_dias || 0, estado || 'Activo']
    );
    res.status(201).json({ id: resultado.insertId, nombre, precio, estado: estado || 'Activo' });
  } catch (error) {
    console.error('Error al crear producto:', error.message);
    res.status(500).json({ error: 'No se pudo crear el producto' });
  }
});

// Editar un producto
router.put('/:id', async (req, res) => {
  try {
    const { nombre, descripcion, id_categoria, id_marca, precio, imagen_url, garantia_dias, estado } = req.body;
    await pool.query(
      `UPDATE producto SET nombre = ?, descripcion = ?, id_categoria = ?, id_marca = ?, 
       precio = ?, imagen_url = ?, garantia_dias = ?, estado = ? WHERE id_pro = ?`,
      [nombre, descripcion, id_categoria, id_marca, precio, imagen_url, garantia_dias || 0, estado, req.params.id]
    );
    res.json({ id: Number(req.params.id), nombre, precio, estado });
  } catch (error) {
    console.error('Error al editar producto:', error.message);
    res.status(500).json({ error: 'No se pudo editar el producto' });
  }
});

// Eliminar un producto
router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM producto WHERE id_pro = ?', [req.params.id]);
    res.json({ mensaje: 'Producto eliminado' });
  } catch (error) {
    console.error('Error al eliminar producto:', error.message);
    res.status(500).json({ error: 'No se pudo eliminar el producto' });
  }
});

export default router;
