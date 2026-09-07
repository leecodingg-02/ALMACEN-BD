// Rutas para SUCURSALES
// Permite listar y administrar sedes de la empresa y sus gerentes

import { Router } from 'express';
import pool from '../conexion.js';

const router = Router();

// Convierte cadenas vacías en null para campos TIME/opcionales (evita errores de MySQL)
const aNull = (valor) => (valor === '' || valor === null || valor === undefined ? null : valor);

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
        s.estado,
        s.hora_apertura_semana,
        s.hora_cierre_semana,
        s.hora_apertura_finde,
        s.hora_cierre_finde
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
    const {
      nombre,
      departamento = null,
      ciudad,
      direccion,
      telefono = '',
      id_gerente = null,
      estado = 'Activo',
      hora_apertura_semana = null,
      hora_cierre_semana = null,
      hora_apertura_finde = null,
      hora_cierre_finde = null
    } = req.body;
    const [resultado] = await pool.query(
      'INSERT INTO sucursal (nombre, departamento, ciudad, direccion, telefono, id_gerente, estado, hora_apertura_semana, hora_cierre_semana, hora_apertura_finde, hora_cierre_finde) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [nombre, aNull(departamento), ciudad, direccion, telefono, id_gerente, estado, aNull(hora_apertura_semana), aNull(hora_cierre_semana), aNull(hora_apertura_finde), aNull(hora_cierre_finde)]
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
    const {
      nombre,
      departamento,
      ciudad,
      direccion,
      telefono,
      id_gerente,
      estado,
      hora_apertura_semana,
      hora_cierre_semana,
      hora_apertura_finde,
      hora_cierre_finde
    } = req.body;
    await pool.query(
      `UPDATE sucursal SET
        nombre = COALESCE(?, nombre),
        departamento = COALESCE(?, departamento),
        ciudad = COALESCE(?, ciudad),
        direccion = COALESCE(?, direccion),
        telefono = COALESCE(?, telefono),
        id_gerente = COALESCE(?, id_gerente),
        estado = COALESCE(?, estado),
        hora_apertura_semana = COALESCE(?, hora_apertura_semana),
        hora_cierre_semana = COALESCE(?, hora_cierre_semana),
        hora_apertura_finde = COALESCE(?, hora_apertura_finde),
        hora_cierre_finde = COALESCE(?, hora_cierre_finde)
      WHERE id_suc = ?`,
      [nombre, aNull(departamento), ciudad, direccion, telefono, id_gerente || null, estado,
       aNull(hora_apertura_semana), aNull(hora_cierre_semana), aNull(hora_apertura_finde), aNull(hora_cierre_finde), req.params.id]
    );
    res.json({ id: Number(req.params.id), nombre, ciudad, direccion, telefono, estado });
  } catch (error) {
    console.error('Error al editar sucursal:', error.message);
    res.status(500).json({ error: 'No se pudo actualizar la sucursal' });
  }
});

export default router;
