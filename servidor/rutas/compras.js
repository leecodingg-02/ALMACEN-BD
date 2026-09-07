// Rutas para COMPRAS
// Permite consultar y registrar las órdenes de compra a proveedores

import { Router } from 'express';
import pool from '../conexion.js';

const router = Router();

// Obtener todas las compras registradas con nombre del proveedor
router.get('/', async (req, res) => {
  try {
    const [compras] = await pool.query(`
      SELECT 
        c.id_compra AS id,
        DATE_FORMAT(c.fecha_compra, '%Y-%m-%d') AS fecha,
        pr.razon_social AS proveedor,
        c.id_proveedor,
        c.total,
        COALESCE(COUNT(dc.id_detcompra), 1) AS items,
        c.estado,
        COALESCE(c.numero_factura, CONCAT('FC-', LPAD(c.id_compra, 4, '0'))) AS factura,
        c.estado_pago
      FROM compra c
      LEFT JOIN proveedor pr ON c.id_proveedor = pr.id_proveedor
      LEFT JOIN detalle_compra dc ON c.id_compra = dc.id_compra
      GROUP BY c.id_compra, c.fecha_compra, pr.razon_social, c.id_proveedor, c.total, c.estado, c.numero_factura, c.estado_pago
      ORDER BY c.fecha_compra DESC, c.id_compra DESC
    `);
    res.json(compras);
  } catch (error) {
    console.error('Error al obtener compras:', error.message);
    res.status(500).json({ error: 'No se pudieron cargar las compras' });
  }
});

// Registrar una nueva compra (cabecera + detalle). El trigger trg_detalle_compra_after_insert
// suma automáticamente la mercancía al inventario y registra el movimiento.
router.post('/', async (req, res) => {
  const conexion = await pool.getConnection();
  try {
    await conexion.beginTransaction();

    const {
      proveedor,
      id_proveedor,
      id_suc = 1,
      estado = 'Pendiente',
      factura,
      detalles = []
    } = req.body;

    let provId = id_proveedor;

    // Si pasaron el nombre del proveedor en vez de ID, buscarlo o crearlo
    if (!provId && proveedor) {
      const [prov] = await conexion.query(
        'SELECT id_proveedor FROM proveedor WHERE razon_social = ? LIMIT 1',
        [proveedor]
      );
      if (prov.length > 0) {
        provId = prov[0].id_proveedor;
      } else {
        const [nuevoProv] = await conexion.query(
          'INSERT INTO proveedor (razon_social, nit) VALUES (?, ?)',
          [proveedor, `NIT-${Date.now()}`]
        );
        provId = nuevoProv.insertId;
      }
    }

    const listaDetalles = Array.isArray(detalles) ? detalles : [];

    // Calcular el total a partir de los detalles si no se envió explícitamente
    let totalFinal = req.body.total != null && req.body.total !== '' ? Number(req.body.total) : 0;
    if (listaDetalles.length > 0 && (req.body.total == null || req.body.total === '')) {
      totalFinal = listaDetalles.reduce(
        (suma, d) => suma + (Number(d.subtotal) || Number(d.cantidad) * (Number(d.precio) || 0) || 0),
        0
      );
    }

    const numeroFactura = factura || `FC-${Date.now().toString().slice(-4)}`;
    const items = Number(req.body.items) || listaDetalles.length || 1;

    const [resultado] = await conexion.query(`
      INSERT INTO compra (id_proveedor, id_suc, total, subtotal, estado, numero_factura, estado_pago)
      VALUES (?, ?, ?, ?, ?, ?, 'Pendiente')
    `, [provId || 1, id_suc, totalFinal, totalFinal, estado, numeroFactura]);

    const idCompra = resultado.insertId;

    // Insertar el detalle de la compra; cada insert dispara el trigger que suma stock al inventario
    for (const item of listaDetalles) {
      const cantidad = Number(item.cantidad) || 0;
      if (cantidad <= 0) continue;
      const precio = Number(item.precio) || Number(item.precio_unitario) || 0;
      const subtotal = Number(item.subtotal) || cantidad * precio;

      const idPro = await resolverProducto(conexion, { ...item, precio });

      await conexion.query(`
        INSERT INTO detalle_compra (id_compra, id_pro, cantidad, precio_unitario, subtotal)
        VALUES (?, ?, ?, ?, ?)
      `, [idCompra, idPro, cantidad, precio, subtotal]);
    }

    await conexion.commit();

    res.status(201).json({
      id: idCompra,
      fecha: new Date().toISOString().split('T')[0],
      proveedor,
      total: totalFinal,
      items,
      estado,
      factura: numeroFactura
    });
  } catch (error) {
    await conexion.rollback();
    console.error('Error al registrar compra:', error.message);
    res.status(500).json({ error: error.message || 'No se pudo guardar la compra' });
  } finally {
    conexion.release();
  }
});

// Cambiar estado de una compra (Aprobada, Recibida, Cancelada)
router.put('/:id', async (req, res) => {
  try {
    const { estado } = req.body;
    await pool.query('UPDATE compra SET estado = ? WHERE id_compra = ?', [estado, req.params.id]);
    res.json({ mensaje: 'Compra actualizada', estado });
  } catch (error) {
    console.error('Error al actualizar compra:', error.message);
    res.status(500).json({ error: 'No se pudo actualizar la compra' });
  }
});

// Resuelve el id_producto de un detalle de compra: usa el id si viene, o busca por nombre;
// si no existe, crea el producto (asignando categoría y marca por defecto cuando haga falta).
async function resolverProducto(conexion, item) {
  if (item.id_pro || item.id) return item.id_pro || item.id;

  const nombre = (item.nombre || '').trim();
  if (!nombre) throw new Error('Cada ítem debe incluir id_pro o nombre de producto');

  const [existentes] = await conexion.query(
    'SELECT id_pro FROM producto WHERE nombre = ? LIMIT 1',
    [nombre]
  );
  if (existentes.length > 0) return existentes[0].id_pro;

  const idCategoria = await resolverCategoria(conexion, item);
  const idMarca = await resolverMarca(conexion, item);
  const precio = Number(item.precio) || 0;

  const [nuevo] = await conexion.query(
    'INSERT INTO producto (nombre, id_categoria, id_marca, precio, estado) VALUES (?, ?, ?, ?, ?)',
    [nombre, idCategoria, idMarca, precio, 'Activo']
  );
  return nuevo.insertId;
}

async function resolverCategoria(conexion, item) {
  if (item.id_categoria) return item.id_categoria;

  const nombre = (item.categoria || '').trim();
  if (nombre) {
    const [c] = await conexion.query(
      'SELECT id_categoria FROM categoria WHERE nombre = ? LIMIT 1',
      [nombre]
    );
    if (c.length > 0) return c[0].id_categoria;
  }

  const [def] = await conexion.query(
    "SELECT id_categoria FROM categoria WHERE nombre = 'General' LIMIT 1"
  );
  if (def.length > 0) return def[0].id_categoria;

  const [nueva] = await conexion.query(
    "INSERT INTO categoria (nombre, estado) VALUES ('General', 'Activo')"
  );
  return nueva.insertId;
}

async function resolverMarca(conexion, item) {
  if (item.id_marca) return item.id_marca;

  const nombre = (item.marca || '').trim();
  if (nombre) {
    const [m] = await conexion.query(
      'SELECT id_marca FROM marca WHERE nombre = ? LIMIT 1',
      [nombre]
    );
    if (m.length > 0) return m[0].id_marca;
  }

  const [def] = await conexion.query(
    "SELECT id_marca FROM marca WHERE nombre = 'Sin Marca Registrada' LIMIT 1"
  );
  if (def.length > 0) return def[0].id_marca;

  const [nueva] = await conexion.query(
    "INSERT INTO marca (nombre, estado) VALUES ('Sin Marca Registrada', 'Activo')"
  );
  return nueva.insertId;
}

export default router;
