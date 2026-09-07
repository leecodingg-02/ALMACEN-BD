// Rutas para VENTAS y PEDIDOS
// Permite listar órdenes para el administrador y registrar compras desde la tienda

import { Router } from 'express';
import pool from '../conexion.js';

const router = Router();

// Obtener todas las ventas para el panel de administración
router.get('/', async (req, res) => {
  try {
    const [ventas] = await pool.query(`
      SELECT 
        v.id_venta AS id,
        DATE_FORMAT(v.fecha_venta, '%Y-%m-%d') AS fecha,
        COALESCE(CONCAT(u.nombre, ' ', u.apellido), 'Cliente Mostrador') AS cliente,
        v.total,
        COALESCE(COUNT(dv.id_detventa), 1) AS items,
        v.estado,
        COALESCE(pg.metodo, 'Efectivo') AS metodo
      FROM venta v
      LEFT JOIN usuario u ON v.id_cli = u.id_usu
      LEFT JOIN detalle_venta dv ON v.id_venta = dv.id_venta
      LEFT JOIN pago pg ON v.id_venta = pg.id_venta
      GROUP BY v.id_venta, v.fecha_venta, u.nombre, u.apellido, v.total, v.estado, pg.metodo
      ORDER BY v.fecha_venta DESC, v.id_venta DESC
    `);
    res.json(ventas);
  } catch (error) {
    console.error('Error al obtener ventas:', error.message);
    res.status(500).json({ error: 'No se pudieron cargar las ventas' });
  }
});

// Obtener detalle de una venta por ID
router.get('/:id', async (req, res) => {
  try {
    const [venta] = await pool.query(`
      SELECT 
        v.id_venta AS id,
        DATE_FORMAT(v.fecha_venta, '%Y-%m-%d %H:%i') AS fecha,
        COALESCE(CONCAT(u.nombre, ' ', u.apellido), 'Cliente Mostrador') AS cliente,
        v.subtotal, v.impuesto, v.descuento, v.total, v.estado,
        pg.metodo, pg.estado AS estado_pago
      FROM venta v
      LEFT JOIN usuario u ON v.id_cli = u.id_usu
      LEFT JOIN pago pg ON v.id_venta = pg.id_venta
      WHERE v.id_venta = ?
    `, [req.params.id]);

    if (venta.length === 0) return res.status(404).json({ error: 'Venta no encontrada' });

    const [detalles] = await pool.query(`
      SELECT 
        dv.id_detventa, dv.id_pro, p.nombre AS producto,
        dv.cantidad, dv.precio_unitario, dv.subtotal
      FROM detalle_venta dv
      JOIN producto p ON dv.id_pro = p.id_pro
      WHERE dv.id_venta = ?
    `, [req.params.id]);

    res.json({ ...venta[0], detalles });
  } catch (error) {
    console.error('Error al obtener detalle de venta:', error.message);
    res.status(500).json({ error: 'Error al consultar la orden' });
  }
});

// Crear una nueva venta (desde el Checkout de la tienda o Admin)
router.post('/', async (req, res) => {
  const conexion = await pool.getConnection();
  try {
    await conexion.beginTransaction();

    let {
      id_cli = null,
      id_suc = 1,
      total,
      subtotal = total,
      impuesto = 0,
      descuento = 0,
      metodo = 'Tarjeta',
      estado = 'Completada',
      detalles = []
    } = req.body;

    const metodosPendientes = ['Nequi', 'Daviplata', 'Contra entrega'];
    if (metodosPendientes.some(m => metodo.toLowerCase().includes(m.toLowerCase()))) {
      estado = 'Pendiente';
    }

    // Validar que el usuario esté autenticado con cuenta registrada
    if (!id_cli) {
      await conexion.rollback();
      return res.status(401).json({
        error: 'Necesitas iniciar sesión con una cuenta registrada para realizar una compra'
      });
    }

    // 1. Insertar cabecera de la venta
    const [resVenta] = await conexion.query(`
      INSERT INTO venta (id_cli, id_suc, subtotal, impuesto, descuento, total, estado)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [id_cli, id_suc, subtotal, impuesto, descuento, total, estado]);

    const idVenta = resVenta.insertId;

    // 2. Insertar los productos comprados (detalle_venta)
    for (const item of detalles) {
      const idPro = item.id_pro || item.id;
      const cantidad = item.cantidad || 1;
      const precio = item.precio_unitario || item.precio || 0;
      const itemSubtotal = item.subtotal || (cantidad * precio);

      await conexion.query(`
        INSERT INTO detalle_venta (id_venta, id_pro, cantidad, precio_unitario, subtotal)
        VALUES (?, ?, ?, ?, ?)
      `, [idVenta, idPro, cantidad, precio, itemSubtotal]);

      // El descuento de inventario lo hace el trigger trg_detalle_venta_after_insert
    }

    // 3. Registrar el pago
    await conexion.query(`
      INSERT INTO pago (id_venta, metodo, monto, estado, fecha_confirmacion)
      VALUES (?, ?, ?, ?, NOW())
    `, [idVenta, metodo, total, estado === 'Completada' ? 'Aprobado' : 'Pendiente']);

    await conexion.commit();

    res.status(201).json({
      mensaje: 'Venta registrada exitosamente',
      id_venta: idVenta,
      idOrden: `ORD-${idVenta}`,
      total
    });
  } catch (error) {
    await conexion.rollback();
    console.error('Error al registrar venta:', error.message);
    res.status(500).json({ error: 'No se pudo completar la venta en la base de datos' });
  } finally {
    conexion.release();
  }
});

// Cambiar estado de una venta (Completada, Pendiente, Cancelada)
router.put('/:id/estado', async (req, res) => {
  const conexion = await pool.getConnection();
  try {
    await conexion.beginTransaction();

    const { estado } = req.body;
    const idVenta = req.params.id;

    // Obtener estado actual
    const [ventaActual] = await conexion.query('SELECT estado, id_suc FROM venta WHERE id_venta = ?', [idVenta]);
    if (ventaActual.length === 0) {
      await conexion.rollback();
      return res.status(404).json({ error: 'Venta no encontrada' });
    }

    const estadoAnterior = ventaActual[0].estado;
    const idSuc = ventaActual[0].id_suc;

    await conexion.query('UPDATE venta SET estado = ? WHERE id_venta = ?', [estado, idVenta]);
    await conexion.query('UPDATE pago SET estado = ? WHERE id_venta = ?', [estado === 'Completada' ? 'Aprobado' : 'Pendiente', idVenta]);

    // Si pasa de Pendiente a Completada, deducir el inventario manualmente
    if (estadoAnterior === 'Pendiente' && estado === 'Completada') {
      const [detalles] = await conexion.query('SELECT id_pro, cantidad FROM detalle_venta WHERE id_venta = ?', [idVenta]);
      for (const item of detalles) {
        // Reducir inventario
        await conexion.query(\`
          INSERT INTO inventario (id_pro, id_suc, cantidad, stock_minimo)
          VALUES (?, ?, 0, 0)
          ON DUPLICATE KEY UPDATE cantidad = GREATEST(0, inventario.cantidad - ?)
        \`, [item.id_pro, idSuc, item.cantidad]);

        // Registrar movimiento
        await conexion.query(\`
          INSERT INTO movimiento_inventario (id_pro, id_suc, tipo_movimiento, cantidad, referencia_tipo, referencia_id, observacion)
          VALUES (?, ?, 'Venta', ?, 'venta', ?, ?)
        \`, [item.id_pro, idSuc, item.cantidad, idVenta, \`Venta #\${idVenta}\`]);
      }
    }

    await conexion.commit();
    res.json({ mensaje: 'Estado actualizado', estado });
  } catch (error) {
    await conexion.rollback();
    console.error('Error al cambiar estado:', error.message);
    res.status(500).json({ error: 'No se pudo actualizar el estado de la venta' });
  } finally {
    conexion.release();
  }
});

export default router;
