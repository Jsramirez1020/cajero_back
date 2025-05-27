// controllers/userController.js
const db = require('../db'); // Este 'db' es pool.promise()

// --- NOTA DE SEGURIDAD IMPORTANTE ---
// El siguiente código maneja contraseñas en texto plano.
// ¡ESTO ES ALTAMENTE INSEGURO PARA UNA APLICACIÓN REAL!
// En producción, DEBES usar hashing de contraseñas (ej. bcrypt)
// para almacenar y verificar contraseñas.
// ------------------------------------

// Crear usuario
exports.createUser = async (req, res) => {
  const { nombre, identificacion, usuario, edad, correo, password } = req.body;
  // NOTA DE SEGURIDAD: La contraseña debe ser "hasheada" ANTES de guardarla.
  // Asumimos que los nuevos usuarios empiezan con saldo 0.
  const query = 'INSERT INTO users (nombre, identificacion, usuario, edad, correo, password, saldo) VALUES (?, ?, ?, ?, ?, ?, 0)';
  try {
    const [result] = await db.execute(query, [nombre, identificacion, usuario, edad, correo, password]);
    res.status(201).json({ id: result.insertId, nombre, mensaje: 'Usuario creado exitosamente' });
  } catch (err) {
    console.error('Error al crear usuario:', err);
    res.status(500).json({ error: 'Error interno al crear el usuario' });
  }
};

// Obtener todos los usuarios
exports.getUsers = async (req, res) => {
  // Selecciona campos específicos para evitar enviar información sensible como la contraseña.
  const query = 'SELECT id, nombre, identificacion, usuario, edad, correo, saldo FROM users';
  try {
    const [results] = await db.execute(query);
    res.json(results);
  } catch (err) {
    console.error('Error al obtener usuarios:', err);
    res.status(500).json({ error: 'Error interno al obtener los usuarios' });
  }
};

// Obtener un usuario por ID
exports.getUser = async (req, res) => {
  const userId = req.params.id;
  const query = 'SELECT id, nombre, identificacion, usuario, edad, correo, saldo FROM users WHERE id = ?';
  try {
    const [results] = await db.execute(query, [userId]);
    if (results.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    res.json(results[0]);
  } catch (err) {
    console.error(`Error al obtener usuario ${userId}:`, err);
    res.status(500).json({ error: 'Error interno al obtener el usuario' });
  }
};

// Login de usuario
exports.loginUser = async (req, res) => {
  const { correo, password } = req.body;
  // NOTA DE SEGURIDAD: Comparar contraseñas en texto plano es inseguro.
  // Aquí se recupera la contraseña para una comparación directa (NO RECOMENDADO).
  // Idealmente, recuperarías el hash y usarías bcrypt.compare().
  const query = 'SELECT id, nombre, saldo, password FROM users WHERE correo = ?';
  try {
    const [results] = await db.execute(query, [correo]);
    if (results.length === 0) {
      return res.status(401).json({ error: 'Credenciales incorrectas (usuario no existe)' });
    }
    
    const user = results[0];

    // Comparación directa de contraseña (INSEGURO - SOLO PARA EJEMPLO DIDÁCTICO)
    if (password !== user.password) {
      return res.status(401).json({ error: 'Credenciales incorrectas (contraseña no coincide)' });
    }

    // Si la contraseña coincide, enviar datos del usuario (sin la contraseña)
    res.json({
      id: user.id,
      nombre: user.nombre,
      saldo: user.saldo,
      mensaje: 'Login exitoso'
    });
  } catch (err) {
    console.error('Error en login:', err);
    res.status(500).json({ error: 'Error interno durante el login' });
  }
};

// Actualizar usuario
exports.updateUser = async (req, res) => {
  const userId = req.params.id;
  const { nombre, identificacion, usuario, edad, correo, password } = req.body;
  // NOTA DE SEGURIDAD: Si se actualiza la contraseña, también debería ser "hasheada".
  const query = 'UPDATE users SET nombre=?, identificacion=?, usuario=?, edad=?, correo=?, password=? WHERE id=?';
  try {
    const [result] = await db.execute(query, [nombre, identificacion, usuario, edad, correo, password, userId]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado para actualizar' });
    }
    res.json({ message: 'Usuario actualizado exitosamente' });
  } catch (err) {
    console.error(`Error al actualizar usuario ${userId}:`, err);
    res.status(500).json({ error: 'Error interno al actualizar el usuario' });
  }
};

// Eliminar usuario
exports.deleteUser = async (req, res) => {
  const userId = req.params.id;
  const query = 'DELETE FROM users WHERE id = ?';
  try {
    const [result] = await db.execute(query, [userId]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado para eliminar' });
    }
    res.json({ message: 'Usuario eliminado exitosamente' });
  } catch (err) {
    console.error(`Error al eliminar usuario ${userId}:`, err);
    res.status(500).json({ error: 'Error interno al eliminar el usuario' });
  }
};