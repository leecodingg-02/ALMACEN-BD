import pool from '../servidor/conexion.js';

async function updateTriggers() {
  try {
    console.log("Eliminando triggers antiguos...");
    await pool.query('DROP TRIGGER IF EXISTS trg_detalle_venta_after_insert');
    await pool.query('DROP TRIGGER IF EXISTS trg_detalle_venta_after_insert_movimiento');

    console.log("Creando nuevos triggers...");
    await pool.query(`
      CREATE TRIGGER trg_detalle_venta_after_insert
      AFTER INSERT ON detalle_venta
      FOR EACH ROW
      BEGIN
          DECLARE v_estado VARCHAR(20);
          DECLARE v_id_suc INT;
          SELECT estado, id_suc INTO v_estado, v_id_suc FROM venta WHERE id_venta = NEW.id_venta;
          
          IF v_estado = 'Completada' THEN
              INSERT INTO inventario (id_pro, id_suc, cantidad, stock_minimo)
              VALUES (NEW.id_pro, v_id_suc, 0, 0)
              ON DUPLICATE KEY UPDATE cantidad = GREATEST(0, inventario.cantidad - NEW.cantidad);
          END IF;
      END
    `);

    await pool.query(`
      CREATE TRIGGER trg_detalle_venta_after_insert_movimiento
      AFTER INSERT ON detalle_venta
      FOR EACH ROW
      BEGIN
          DECLARE v_estado VARCHAR(20);
          DECLARE v_id_suc INT;
          SELECT estado, id_suc INTO v_estado, v_id_suc FROM venta WHERE id_venta = NEW.id_venta;
          
          IF v_estado = 'Completada' THEN
              INSERT INTO movimiento_inventario (id_pro, id_suc, tipo_movimiento, cantidad, referencia_tipo, referencia_id, observacion)
              VALUES (NEW.id_pro, v_id_suc, 'Venta', NEW.cantidad, 'venta', NEW.id_venta, CONCAT('Venta #', NEW.id_venta));
          END IF;
      END
    `);

    console.log("Triggers actualizados correctamente.");
  } catch (error) {
    console.error("Error actualizando triggers:", error);
  } finally {
    process.exit(0);
  }
}

updateTriggers();
