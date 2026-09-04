// Rutas para USUARIOS
// Permite autenticación, gestión de personal, perfil, direcciones y favoritos desde MySQL

import { Router } from 'express';
import bcrypt from 'bcrypt';
import pool from '../conexion.js';

const router = Router();

// Iniciar sesión con correo y contraseña desde la base de datos
router.post('/login', async (req, res) => {
  try {
    const { correo, contrasena } = req.body;

    if (!correo || !contrasena) {
      return res.status(400).json({ error: 'Correo y contraseña requeridos' });
    }

    const [filas] = await pool.query(`
      SELECT 
        u.id_usu, u.tipo_doc, u.num_ident, u.nombre, u.apellido,
        CONCAT(u.nombre, ' ', u.apellido) AS nombreCompleto,
        u.correo, u.telefono, u.id_rol, r.nombre AS rol,
        u.id_suc, u.estado, u.contrasena_hash,
        u.alto_contraste, u.tamano_fuente, u.notificaciones_email
      FROM usuario u
      LEFT JOIN rol r ON u.id_rol = r.id_rol
      WHERE u.correo = ?
    `, [correo.trim()]);

    if (filas.length === 0) {
      return res.status(401).json({ error: 'Correo o contraseña incorrectos' });
    }

    const usuario = filas[0];

    // Verificar la contraseña con bcrypt
    // Si el hash no empieza con $2 (bcrypt), se compara en texto plano (compatibilidad con datos antiguos)
    let contrasenaValida = false;
    if (usuario.contrasena_hash?.startsWith('$2')) {
      contrasenaValida = await bcrypt.compare(contrasena, usuario.contrasena_hash);
    } else {
      // Compatibilidad con contraseñas antiguas guardadas en texto plano
      contrasenaValida = usuario.contrasena_hash === contrasena;
    }

    if (!contrasenaValida) {
      return res.status(401).json({ error: 'Correo o contraseña incorrectos' });
    }

    if (usuario.estado !== 'Activo') {
      return res.status(403).json({ error: 'Tu cuenta se encuentra suspendida o inactiva' });
    }

    // No devolver el hash de la contraseña por seguridad
    delete usuario.contrasena_hash;

    res.json(usuario);
  } catch (error) {
    console.error('Error en login:', error.message);
    res.status(500).json({ error: 'Error al iniciar sesión en el servidor' });
  }
});

// Obtener todos los usuarios (para el panel de administración)
router.get('/', async (req, res) => {
  try {
    const [usuarios] = await pool.query(`
      SELECT 
        u.id_usu AS id,
        CONCAT(u.nombre, ' ', u.apellido) AS nombre,
        u.nombre AS primerNombre,
        u.apellido,
        u.correo,
        u.telefono,
        u.tipo_doc,
        u.num_ident,
        r.nombre AS rol,
        u.id_rol,
        s.nombre AS sucursal,
        u.id_suc,
        u.estado,
        DATE_FORMAT(u.fecha_registro, '%Y-%m-%d') AS fechaRegistro
      FROM usuario u
      LEFT JOIN rol r ON u.id_rol = r.id_rol
      LEFT JOIN sucursal s ON u.id_suc = s.id_suc
      ORDER BY u.id_usu ASC
    `);
    res.json(usuarios);
  } catch (error) {
    console.error('Error al obtener usuarios:', error.message);
    res.status(500).json({ error: 'No se pudieron cargar los usuarios' });
  }
});

// Obtener los datos del usuario actual (perfil, direcciones y favoritos)
router.get('/perfil/:id', async (req, res) => {
  try {
    const idUsuario = req.params.id;

    // Buscar información básica del usuario
    const [filas] = await pool.query(`
      SELECT 
        u.id_usu, u.tipo_doc, u.num_ident, u.nombre, u.apellido,
        u.telefono, u.correo, u.estado, u.id_rol,
        u.alto_contraste, u.tamano_fuente, u.notificaciones_email
      FROM usuario u
      WHERE u.id_usu = ?
    `, [idUsuario]);

    if (filas.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const usuario = filas[0];

    // Buscar sus direcciones guardadas en la tabla ubicacion
    const [direcciones] = await pool.query(`
      SELECT id_ubi, departamento, ciudad, direccion, complemento, barrio, es_principal
      FROM ubicacion
      WHERE id_usu = ?
      ORDER BY es_principal DESC, id_ubi ASC
    `, [idUsuario]);

    // Buscar sus productos favoritos en la tabla favorito
    const [favoritos] = await pool.query(`
      SELECT id_pro FROM favorito WHERE id_usu = ?
    `, [idUsuario]);

    res.json({
      ...usuario,
      direcciones,
      favoritos: favoritos.map((f) => f.id_pro)
    });
  } catch (error) {
    console.error('Error al obtener perfil:', error.message);
    res.status(500).json({ error: 'Error al consultar el perfil' });
  }
});

// Obtener sólo las direcciones de un usuario
router.get('/:id/direcciones', async (req, res) => {
  try {
    const [direcciones] = await pool.query(`
      SELECT id_ubi, departamento, ciudad, direccion, complemento, barrio, es_principal
      FROM ubicacion
      WHERE id_usu = ?
      ORDER BY es_principal DESC, id_ubi ASC
    `, [req.params.id]);
    res.json(direcciones);
  } catch (error) {
    console.error('Error al obtener direcciones:', error.message);
    res.status(500).json({ error: 'Error al obtener direcciones' });
  }
});

// Obtener sólo los favoritos de un usuario
router.get('/:id/favoritos', async (req, res) => {
  try {
    const [favoritos] = await pool.query(`
      SELECT id_pro FROM favorito WHERE id_usu = ?
    `, [req.params.id]);
    res.json(favoritos.map((f) => f.id_pro));
  } catch (error) {
    console.error('Error al obtener favoritos:', error.message);
    res.status(500).json({ error: 'Error al obtener favoritos' });
  }
});

// Obtener las órdenes de un usuario específico
router.get('/:id/pedidos', async (req, res) => {
  try {
    const [ventas] = await pool.query(`
      SELECT 
        v.id_venta,
        v.id_venta AS id,
        CONCAT('ORD-', v.id_venta) AS idOrden,
        DATE_FORMAT(v.fecha_venta, '%Y-%m-%d %H:%i') AS fecha_venta,
        v.total,
        v.estado,
        COALESCE(pg.metodo, 'Tarjeta') AS metodo
      FROM venta v
      LEFT JOIN pago pg ON v.id_venta = pg.id_venta
      WHERE v.id_cli = ?
      ORDER BY v.fecha_venta DESC
    `, [req.params.id]);

    // Obtener detalles de cada venta
    for (const v of ventas) {
      const [detalles] = await pool.query(`
        SELECT dv.id_pro, p.nombre, p.imagen_url AS imagen, dv.cantidad, dv.precio_unitario, dv.subtotal
        FROM detalle_venta dv
        LEFT JOIN producto p ON dv.id_pro = p.id_pro
        WHERE dv.id_venta = ?
      `, [v.id_venta]);
      v.detalles = detalles;
    }

    res.json(ventas);
  } catch (error) {
    console.error('Error al obtener pedidos de usuario:', error.message);
    res.status(500).json({ error: 'Error al obtener pedidos' });
  }
});

// Crear un nuevo usuario (Registro de cuenta)
router.post('/', async (req, res) => {
  try {
    const {
      nombre,
      apellido = '',
      correo,
      telefono = null,
      tipo_doc = 'C.C',
      num_ident = `ID-${Date.now().toString().slice(-6)}`,
      contrasena = '123456',
      id_rol = 2, // Por defecto Cliente
      id_suc = null,
      estado = 'Activo'
    } = req.body;

    let nom = nombre;
    let ape = apellido;
    if (!ape && nombre.includes(' ')) {
      const partes = nombre.trim().split(' ');
      nom = partes[0];
      ape = partes.slice(1).join(' ');
    }

    // Verificar si el correo ya está registrado
    const [existente] = await pool.query('SELECT id_usu FROM usuario WHERE correo = ?', [correo]);
    if (existente.length > 0) {
      return res.status(400).json({ error: 'Este correo electrónico ya está registrado' });
    }

    // Hashear la contraseña antes de guardarla en la base de datos
    const contrasenaHash = await bcrypt.hash(contrasena, 10);

    const [resultado] = await pool.query(`
      INSERT INTO usuario (tipo_doc, num_ident, nombre, apellido, correo, telefono, contrasena_hash, id_rol, id_suc, estado)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [tipo_doc, num_ident, nom, ape, correo, telefono, contrasenaHash, id_rol, id_suc, estado]);

    res.status(201).json({
      id: resultado.insertId,
      id_usu: resultado.insertId,
      nombre: nom,
      apellido: ape,
      correo,
      telefono,
      tipo_doc,
      num_ident,
      id_rol,
      estado
    });
  } catch (error) {
    console.error('Error al crear usuario:', error.message);
    res.status(500).json({ error: 'No se pudo crear el usuario' });
  }
});

// Actualizar datos de un usuario
router.put('/:id', async (req, res) => {
  try {
    const { nombre, apellido, correo, telefono, estado, id_rol, id_suc, alto_contraste, tamano_fuente, notificaciones_email } = req.body;

    let nom = nombre;
    let ape = apellido;
    if (nombre && !apellido && nombre.includes(' ')) {
      const partes = nombre.trim().split(' ');
      nom = partes[0];
      ape = partes.slice(1).join(' ');
    }

    await pool.query(`
      UPDATE usuario SET
        nombre = COALESCE(?, nombre),
        apellido = COALESCE(?, apellido),
        correo = COALESCE(?, correo),
        telefono = COALESCE(?, telefono),
        estado = COALESCE(?, estado),
        id_rol = COALESCE(?, id_rol),
        id_suc = COALESCE(?, id_suc),
        alto_contraste = COALESCE(?, alto_contraste),
        tamano_fuente = COALESCE(?, tamano_fuente),
        notificaciones_email = COALESCE(?, notificaciones_email)
      WHERE id_usu = ?
    `, [nom, ape, correo, telefono, estado, id_rol, id_suc, alto_contraste, tamano_fuente, notificaciones_email, req.params.id]);

    res.json({ mensaje: 'Usuario actualizado con éxito', id: Number(req.params.id) });
  } catch (error) {
    console.error('Error al actualizar usuario:', error.message);
    res.status(500).json({ error: 'No se pudo actualizar el usuario' });
  }
});

// Guardar o agregar una dirección para un usuario
router.post('/:id/direcciones', async (req, res) => {
  try {
    const idUsuario = req.params.id;
    const { departamento, ciudad, direccion, complemento = '', barrio = '', es_principal = false } = req.body;

    if (es_principal) {
      await pool.query('UPDATE ubicacion SET es_principal = FALSE WHERE id_usu = ?', [idUsuario]);
    }

    const [resDir] = await pool.query(`
      INSERT INTO ubicacion (id_usu, departamento, ciudad, direccion, complemento, barrio, es_principal)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [idUsuario, departamento, ciudad, direccion, complemento, barrio, es_principal]);

    res.status(201).json({ id_ubi: resDir.insertId, departamento, ciudad, direccion, es_principal });
  } catch (error) {
    console.error('Error al agregar dirección:', error.message);
    res.status(500).json({ error: 'No se pudo guardar la dirección' });
  }
});

// Eliminar una dirección de usuario
router.delete('/direcciones/:idUbi', async (req, res) => {
  try {
    await pool.query('DELETE FROM ubicacion WHERE id_ubi = ?', [req.params.idUbi]);
    res.json({ mensaje: 'Dirección eliminada' });
  } catch (error) {
    console.error('Error al eliminar dirección:', error.message);
    res.status(500).json({ error: 'No se pudo eliminar la dirección' });
  }
});

// Alternar favorito (agregar si no existe, quitar si ya existe)
router.post('/:id/favoritos', async (req, res) => {
  try {
    const idUsuario = req.params.id;
    const { id_pro } = req.body;

    const [existe] = await pool.query('SELECT * FROM favorito WHERE id_usu = ? AND id_pro = ?', [idUsuario, id_pro]);

    if (existe.length > 0) {
      await pool.query('DELETE FROM favorito WHERE id_usu = ? AND id_pro = ?', [idUsuario, id_pro]);
      res.json({ accion: 'eliminado', id_pro });
    } else {
      await pool.query('INSERT INTO favorito (id_usu, id_pro) VALUES (?, ?)', [idUsuario, id_pro]);
      res.json({ accion: 'agregado', id_pro });
    }
  } catch (error) {
    console.error('Error al alternar favorito:', error.message);
    res.status(500).json({ error: 'No se pudo actualizar el favorito' });
  }
});

export default router;
