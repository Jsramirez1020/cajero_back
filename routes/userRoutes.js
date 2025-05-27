// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const db = require('../db'); // Este 'db' es pool.promise()

// Rutas que utilizan los controladores (que ahora son async)
router.post('/', userController.createUser);
router.post('/login', userController.loginUser);
router.get('/', userController.getUsers);
router.get('/:id', userController.getUser);
router.put('/:id', userController.updateUser);
router.delete('/:id', userController.deleteUser);

// Consignar Saldo
router.post('/:id/consignar', async (req, res) => {
  const userId = req.params.id;
  const { monto } = req.body;
  const numericMonto = parseFloat(monto); // Asegurar que monto sea numérico

  if (isNaN(numericMonto) || numericMonto <= 0) {
    return res.status(400).json({ error: 'Monto inválido' });
  }

  try {
    // Ya no se necesita db.promise().execute, solo db.execute
    await db.execute('UPDATE users SET saldo = saldo + ? WHERE id = ?', [numericMonto, userId]);
    res.json({ mensaje: 'Consignación exitosa' });
  } catch (err) {
    console.error(`Error al consignar saldo para usuario ${userId}:`, err);
    res.status(500).json({ error: 'Error interno al consignar saldo' });
  }
});

// Retirar saldo
router.post('/:id/retirar', async (req, res) => {
  const userId = req.params.id;
  const { monto } = req.body;
  const numericMonto = parseFloat(monto);

  console.log(`--- Intento de Retiro ---`);
  console.log(`User ID: ${userId}`);
  console.log(`Monto recibido del request (string): '${monto}'`);
  console.log(`Monto parseado (numericMonto): ${numericMonto}, Tipo: ${typeof numericMonto}`);


  if (isNaN(numericMonto) || numericMonto <= 0) {
    console.log('Error: Monto inválido detectado.');
    return res.status(400).json({ error: 'Monto inválido' });
  }

  try {
    const [rows] = await db.execute('SELECT saldo FROM users WHERE id = ?', [userId]);

    if (!rows.length) {
      console.log(`Error: Usuario con ID ${userId} no encontrado.`);
      return res.status(404).json({ error: 'Usuario no encontrado para retirar' });
    }
    
    const currentSaldo = rows[0].saldo;
    console.log(`Saldo actual en BD (currentSaldo): ${currentSaldo}, Tipo: ${typeof currentSaldo}`);

    // Comparación
    if (currentSaldo < numericMonto) {
      console.log(`Comparación: ${currentSaldo} (saldo) < ${numericMonto} (monto) = VERDADERO. Fondos insuficientes.`);
      return res.status(400).json({ error: 'Fondos insuficientes' });
    } else {
      console.log(`Comparación: ${currentSaldo} (saldo) < ${numericMonto} (monto) = FALSO. Fondos suficientes.`);
    }

    console.log('Procediendo a actualizar el saldo...');
    const [updateResult] = await db.execute('UPDATE users SET saldo = saldo - ? WHERE id = ?', [numericMonto, userId]);
    console.log('Resultado de la actualización en BD:', updateResult);

    if (updateResult.affectedRows > 0) {
        console.log('Saldo actualizado exitosamente en la BD.');
        // Opcional: Volver a consultar el saldo para confirmar
        const [newSaldoRows] = await db.execute('SELECT saldo FROM users WHERE id = ?', [userId]);
        if (newSaldoRows.length > 0) {
            console.log(`Nuevo saldo en BD después del retiro: ${newSaldoRows[0].saldo}`);
        }
        res.json({ mensaje: 'Retiro exitoso' });
    } else {
        console.log('ADVERTENCIA: La actualización del saldo no afectó ninguna fila. El saldo podría no haberse actualizado.');
        res.status(500).json({ error: 'Error al actualizar el saldo, no se afectaron filas.' });
    }
    
  } catch (err) {
    console.error(`Error al retirar saldo para usuario ${userId}:`, err);
    res.status(500).json({ error: 'Error interno al retirar saldo' });
  }
});

//Obtener saldo
router.get('/:id/saldo', async (req, res) => {
  const userId = req.params.id;

  try {
    const [rows] = await db.execute('SELECT saldo FROM users WHERE id = ?', [userId]);

    if (!rows.length) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    res.json({ saldo: rows[0].saldo });
  } catch (err) {
    console.error(`Error al obtener saldo para usuario ${userId}:`, err);
    res.status(500).json({ error: 'Error interno al obtener saldo' });
  }
});

module.exports = router;