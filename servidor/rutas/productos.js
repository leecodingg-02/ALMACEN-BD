// Rutas para PRODUCTOS
// Consulta y administra productos con categoría, marca y stock de inventario

import { Router } from 'express';
import pool from '../conexion.js';

const router = Router();

// Obtener todos los productos con categoría, marca y cálculo de stock total
router.get('/', async (req, res) => {
  try {
    const [productos] = await pool.query(`
      SELECT 
        p.id_pro AS id,
        p.nombre,
        p.nombre AS titulo,
        p.descripcion,
        p.id_categoria,
        COALESCE(c.nombre, 'Sin Categoría') AS categoria,
        p.id_marca,
        COALESCE(m.nombre, 'Sin Marca') AS marca,
        CAST(p.precio AS DECIMAL(10,2)) AS precio,
        p.imagen_url AS imagen,
        p.garantia_dias,
        p.estado,
        COALESCE(SUM(i.cantidad), 10) AS stock,
        DATE_FORMAT(p.fecha_creacion, '%Y-%m-%d') AS fecha_creacion
      FROM producto p
      LEFT JOIN categoria c ON p.id_categoria = c.id_categoria
      LEFT JOIN marca m ON p.id_marca = m.id_marca
      LEFT JOIN inventario i ON p.id_pro = i.id_pro
      GROUP BY p.id_pro, p.nombre, p.descripcion, p.id_categoria, c.nombre, p.id_marca, m.nombre, p.precio, p.imagen_url, p.garantia_dias, p.estado, p.fecha_creacion
      ORDER BY p.id_pro ASC
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
        p.id_pro AS id, p.nombre, p.nombre AS titulo, p.descripcion,
        p.id_categoria, c.nombre AS categoria,
        p.id_marca, m.nombre AS marca,
        CAST(p.precio AS DECIMAL(10,2)) AS precio,
        p.imagen_url AS imagen,
        p.garantia_dias, p.estado,
        COALESCE(SUM(i.cantidad), 10) AS stock
      FROM producto p
      LEFT JOIN categoria c ON p.id_categoria = c.id_categoria
      LEFT JOIN marca m ON p.id_marca = m.id_marca
      LEFT JOIN inventario i ON p.id_pro = i.id_pro
      WHERE p.id_pro = ?
      GROUP BY p.id_pro, p.nombre, p.descripcion, p.id_categoria, c.nombre, p.id_marca, m.nombre, p.precio, p.imagen_url, p.garantia_dias, p.estado
    `, [req.params.id]);

    if (filas.length === 0) return res.status(404).json({ error: 'Producto no encontrado' });
    res.json(filas[0]);
  } catch (error) {
    console.error('Error al buscar producto:', error.message);
    res.status(500).json({ error: 'Error al buscar el producto' });
  }
});

// Crear un nuevo producto
router.post('/', async (req, res) => {
  try {
    const { nombre, descripcion = '', categoria, id_categoria, marca, id_marca, precio, imagen = '', imagen_url, garantia_dias = 0, stock = 10, estado = 'Activo' } = req.body;

    let catId = id_categoria;
    let marcaId = id_marca;

    // Resolver ID de categoría si se envió por nombre
    if (!catId && categoria) {
      const [c] = await pool.query('SELECT id_categoria FROM categoria WHERE nombre = ? LIMIT 1', [categoria]);
      catId = c.length > 0 ? c[0].id_categoria : 1;
    }

    // Resolver ID de marca si se envió por nombre
    if (!marcaId && marca) {
      const [m] = await pool.query('SELECT id_marca FROM marca WHERE nombre = ? LIMIT 1', [marca]);
      marcaId = m.length > 0 ? m[0].id_marca : 1;
    }

    const [resultado] = await pool.query(
      `INSERT INTO producto (nombre, descripcion, id_categoria, id_marca, precio, imagen_url, garantia_dias, estado) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [nombre, descripcion || null, catId || 1, marcaId || 1, precio, imagen || imagen_url || null, garantia_dias || 0, estado || 'Activo']
    );

    const idPro = resultado.insertId;

    // Registrar stock inicial en inventario para la sede principal
    if (stock > 0) {
      await pool.query(
        'INSERT INTO inventario (id_pro, id_suc, cantidad, stock_minimo) VALUES (?, 1, ?, 5) ON DUPLICATE KEY UPDATE cantidad = VALUES(cantidad)',
        [idPro, stock]
      );
    }

    res.status(201).json({ id: idPro, nombre, titulo: nombre, categoria, marca, precio, stock, estado });
  } catch (error) {
    console.error('Error al crear producto:', error.message);
    res.status(500).json({ error: 'No se pudo crear el producto' });
  }
});

// Editar un producto
router.put('/:id', async (req, res) => {
  try {
    const { nombre, descripcion, categoria, id_categoria, marca, id_marca, precio, imagen, imagen_url, garantia_dias, stock, estado } = req.body;

    let catId = id_categoria;
    let marcaId = id_marca;

    if (!catId && categoria) {
      const [c] = await pool.query('SELECT id_categoria FROM categoria WHERE nombre = ? LIMIT 1', [categoria]);
      if (c.length > 0) catId = c[0].id_categoria;
    }

    if (!marcaId && marca) {
      const [m] = await pool.query('SELECT id_marca FROM marca WHERE nombre = ? LIMIT 1', [marca]);
      if (m.length > 0) marcaId = m[0].id_marca;
    }

    await pool.query(
      `UPDATE producto SET 
        nombre = COALESCE(?, nombre),
        descripcion = COALESCE(?, descripcion),
        id_categoria = COALESCE(?, id_categoria),
        id_marca = COALESCE(?, id_marca),
        precio = COALESCE(?, precio),
        imagen_url = COALESCE(?, imagen_url),
        garantia_dias = COALESCE(?, garantia_dias),
        estado = COALESCE(?, estado)
       WHERE id_pro = ?`,
      [nombre, descripcion, catId, marcaId, precio, imagen || imagen_url, garantia_dias, estado, req.params.id]
    );

    if (stock !== undefined) {
      await pool.query(
        'INSERT INTO inventario (id_pro, id_suc, cantidad, stock_minimo) VALUES (?, 1, ?, 5) ON DUPLICATE KEY UPDATE cantidad = VALUES(cantidad)',
        [req.params.id, stock]
      );
    }

    res.json({ id: Number(req.params.id), nombre, precio, estado });
  } catch (error) {
    console.error('Error al editar producto:', error.message);
    res.status(500).json({ error: 'No se pudo editar el producto' });
  }
});

// Eliminar un producto
router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM inventario WHERE id_pro = ?', [req.params.id]);
    await pool.query('DELETE FROM producto WHERE id_pro = ?', [req.params.id]);
    res.json({ mensaje: 'Producto eliminado' });
  } catch (error) {
    console.error('Error al eliminar producto:', error.message);
    res.status(500).json({ error: 'No se pudo eliminar el producto' });
  }
});

export default router;
