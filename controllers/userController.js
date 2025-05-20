const db = require('../db');

// Crear usuario
exports.createUser = (req, res) => {
  const { nombre, identificacion, usuario, edad, correo, password } = req.body;
  const query = 'INSERT INTO users (nombre, identificacion, usuario, edad, correo, password) VALUES (?, ?, ?, ?, ?, ?)';
  db.query(query, [nombre, identificacion, usuario, edad, correo, password], (err, result) => {
    if (err) return res.status(500).json({ error: err });
    res.status(201).json({ id: result.insertId, nombre });
  });
};

// Obtener todos los usuarios
exports.getUsers = (req, res) => {
  db.query('SELECT * FROM users', (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
};

// Obtener un usuario
exports.getUser = (req, res) => {
  db.query('SELECT * FROM users WHERE id = ?', [req.params.id], (err, results) => {
    if (err) return res.status(500).json({ error: err });
    if (results.length === 0) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json(results[0]);
  });
};

// Obtener usuario por correo y contraseña (para login)
exports.loginUser = (req, res) => {
  const { correo, password } = req.body;
  const query = 'SELECT * FROM users WHERE correo = ? AND password = ?';
  db.query(query, [correo, password], (err, results) => {
    if (err) return res.status(500).json({ error: err });
    if (results.length === 0) return res.status(401).json({ error: 'Credenciales incorrectas' });
    
    const user = results[0];
    res.json({
      id: user.id,
      nombre: user.nombre,
      saldo: user.saldo, // 👈 importante
    });
  });
};


// Actualizar usuario
exports.updateUser = (req, res) => {
  const { nombre, identificacion, usuario, edad, correo, password } = req.body;
  const query = 'UPDATE users SET nombre=?, identificacion=?, usuario=?, edad=?, correo=?, password=? WHERE id=?';
  db.query(query, [nombre, identificacion, usuario, edad, correo, password, req.params.id], (err, result) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ message: 'Usuario actualizado' });
  });
};

// Eliminar usuario
exports.deleteUser = (req, res) => {
  db.query('DELETE FROM users WHERE id = ?', [req.params.id], (err, result) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ message: 'Usuario eliminado' });
  });
};
