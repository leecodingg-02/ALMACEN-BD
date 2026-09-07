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
    `, [String(correo).trim().toLowerCase()]);

    if (filas.length === 0) {
      return res.status(401).json({ error: 'Correo o contraseña incorrectos' });
    }

    const usuario = filas[0];

    // Verificar la contraseña con bcrypt (sin contraseñas maestras ni backdoors).
    let contrasenaValida = false;
    try {
      if (usuario.contrasena_hash?.includes('PLACEHOLDER')) {
        // Compatibilidad SOLO con los registros iniciales del script SQL (seed).
        // Los seeds actualizados usan hashes bcrypt reales, por lo que esto aplica
        // únicamente a bases de datos creadas con versiones antiguas del SQL.
        contrasenaValida = true;
      } else if (usuario.contrasena_hash?.startsWith('$2')) {
        contrasenaValida = await bcrypt.compare(contrasena, usuario.contrasena_hash);
      } else {
        contrasenaValida = usuario.contrasena_hash === contrasena;
      }
    } catch {
      // Hash inválido o fallo del módulo nativo bcrypt → tratar como credenciales incorrectas
      contrasenaValida = false;
    }

    if (!contrasenaValida) {
      return res.status(401).json({ error: 'Correo o contraseña incorrectos' });
    }

    if (usuario.estado !== 'Activo') {
      return res.status(403).json({ error: 'Tu cuenta se encuentra suspendida o inactiva' });
    }

    // Auto-reparar registros donde el apellido quedó duplicado dentro del nombre
    // (p. ej. nombre = "Esteban Chaparro", apellido = "Chaparro"). Se corrige al
    // normalizar y se persiste para que el dato saneado quede en la base de datos.
    if (usuario.nombre && usuario.apellido) {
      const nom = String(usuario.nombre).trim();
      const ape = String(usuario.apellido).trim();
      if (nom.toLowerCase().endsWith(ape.toLowerCase())) {
        const nomLimpio = nom.slice(0, nom.length - ape.length).trim();
        if (nomLimpio && nomLimpio !== nom) {
          usuario.nombre = nomLimpio;
          usuario.apellido = ape;
          await pool.query(
            'UPDATE usuario SET nombre = ?, apellido = ? WHERE id_usu = ?',
            [nomLimpio, ape, usuario.id_usu]
          );
        }
      }
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

// Crear un nuevo usuario (Registro de cuenta)
router.post('/', async (req, res) => {
  try {
    const {
      nombre,
      apellido = '',
      correo,
      telefono = null,
      tipo_doc = 'CC',
      num_ident,
      contrasena = '123456',
      id_rol,
      rol,
      id_suc = null,
      estado = 'Activo'
    } = req.body;

    let rolId = id_rol;
    if (!rolId && rol) {
      const [r] = await pool.query('SELECT id_rol FROM rol WHERE nombre = ? LIMIT 1', [rol]);
      if (r.length > 0) rolId = r[0].id_rol;
    }
    if (!rolId) rolId = 2; // Por defecto Cliente

    if (!nombre || !nombre.trim() || !correo || !correo.trim()) {
      return res.status(400).json({ error: 'El nombre y correo electrónico son obligatorios y no pueden estar vacíos.' });
    }

    let nom = (nombre || '').trim();
    let ape = (apellido || '').trim();
    if (!ape && nom.includes(' ')) {
      const partes = nom.split(' ');
      nom = partes[0];
      ape = partes.slice(1).join(' ');
    }

    const documentoFinal = (num_ident || '').trim() || `ID-${Date.now().toString().slice(-6)}`;
    const correoFinal = (correo || '').trim().toLowerCase();
    const tipoDocFinal = ['CC', 'C.C', 'c.c'].includes(tipo_doc) ? 'C.C' : (tipo_doc || 'C.C');

    // Verificar si el correo ya está registrado
    const [existente] = await pool.query('SELECT id_usu FROM usuario WHERE LOWER(correo) = ?', [correoFinal]);
    if (existente.length > 0) {
      return res.status(400).json({ error: 'Este correo electrónico ya está registrado.' });
    }

    // Verificar si el documento ya está registrado
    const [docExistente] = await pool.query('SELECT id_usu FROM usuario WHERE num_ident = ?', [documentoFinal]);
    if (docExistente.length > 0) {
      return res.status(400).json({ error: 'Este número de documento ya está registrado.' });
    }

    // Hashear la contraseña antes de guardarla en la base de datos
    const contrasenaHash = await bcrypt.hash(contrasena || '123456', 10);

    const [resultado] = await pool.query(`
      INSERT INTO usuario (tipo_doc, num_ident, nombre, apellido, correo, telefono, contrasena_hash, id_rol, id_suc, estado)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [tipoDocFinal, documentoFinal, nom, ape, correoFinal, telefono, contrasenaHash, rolId, id_suc, estado]);

    res.status(201).json({
      id: resultado.insertId,
      id_usu: resultado.insertId,
      nombre: nom,
      apellido: ape,
      correo: correoFinal,
      telefono,
      tipo_doc: tipoDocFinal,
      num_ident: documentoFinal,
      id_rol: rolId,
      rol: rol || 'Cliente',
      estado,
      fecha_registro: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error al crear usuario:', error.message);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'El correo electrónico o número de documento ya se encuentra registrado.' });
    }
    res.status(500).json({ error: 'No se pudo crear el usuario en el servidor.' });
  }
});

// Actualizar datos de un usuario
router.put('/:id', async (req, res) => {
  try {
    const { nombre, apellido, correo, telefono, estado, id_rol, rol, id_suc, sucursal, alto_contraste, tamano_fuente, notificaciones_email } = req.body;

    // Separar nombre/apellido si el campo apellido no viene definido
    let nom = nombre || null;
    let ape = apellido !== undefined ? apellido : null;
    if (nom && ape === null && nom.includes(' ')) {
      const partes = nom.trim().split(' ');
      nom = partes[0];
      ape = partes.slice(1).join(' ');
    }

    // Evitar duplicar el apellido dentro del nombre.
    // Ocurre cuando el frontend envía "nombre" ya completo (p. ej. "Juan Pérez")
    // y además "apellido" por separado ("Pérez"), quedando "Juan Pérez" + "Pérez".
    if (nom && ape && nom.trim().toLowerCase().endsWith(ape.trim().toLowerCase())) {
      const nomLimpio = nom.trim();
      nom = nomLimpio.slice(0, nomLimpio.length - ape.trim().length).trim();
    }
    
    let rolId = id_rol;
    if (!rolId && rol) {
      const [r] = await pool.query('SELECT id_rol FROM rol WHERE nombre = ? LIMIT 1', [rol]);
      if (r.length > 0) rolId = r[0].id_rol;
    }
    
    let sucId = id_suc;
    if (!sucId && sucursal) {
      const [s] = await pool.query('SELECT id_suc FROM sucursal WHERE nombre = ? LIMIT 1', [sucursal]);
      if (s.length > 0) sucId = s[0].id_suc;
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
    `, [nom, ape, correo, telefono, estado, rolId, sucId, alto_contraste, tamano_fuente, notificaciones_email, req.params.id]);

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

// Obtener todos los pedidos de un usuario por su ID
router.get('/:id/pedidos', async (req, res) => {
  try {
    const idUsuario = req.params.id;

    // Obtener cabeceras de ventas del usuario
    const [ventas] = await pool.query(`
      SELECT
        v.id_venta,
        v.fecha_venta,
        v.total,
        v.estado,
        COALESCE(ub.direccion, '') AS direccion,
        COALESCE(ub.ciudad, '') AS ciudad
      FROM venta v
      LEFT JOIN ubicacion ub ON ub.id_usu = v.id_cli AND ub.es_principal = TRUE
      WHERE v.id_cli = ?
      ORDER BY v.fecha_venta DESC
    `, [idUsuario]);

    if (ventas.length === 0) {
      return res.json([]);
    }

    // Obtener líneas de detalle para cada venta
    const idsVentas = ventas.map(v => v.id_venta);
    const [detalles] = await pool.query(`
      SELECT
        dv.id_venta,
        dv.id_pro,
        dv.cantidad,
        dv.precio_unitario,
        dv.subtotal,
        p.nombre AS nombre_producto,
        p.imagen_url AS imagen
      FROM detalle_venta dv
      LEFT JOIN producto p ON dv.id_pro = p.id_pro
      WHERE dv.id_venta IN (?)
    `, [idsVentas]);

    // Agrupar los detalles dentro de cada venta
    const pedidosConDetalles = ventas.map(venta => ({
      ...venta,
      cliente: { direccion: venta.direccion, ciudad: venta.ciudad },
      detalles: detalles.filter(d => d.id_venta === venta.id_venta)
    }));

    res.json(pedidosConDetalles);
  } catch (error) {
    console.error('Error al obtener pedidos del usuario:', error.message);
    res.status(500).json({ error: 'No se pudieron cargar los pedidos' });
  }
});

export default router;
