// db.js
const mysql = require('mysql2');



const pool = mysql.createPool({
  host: process.env.DB_HOST,       // Usa la variable de entorno
  user: process.env.DB_USER,       // Usa la variable de entorno
  password: process.env.DB_PASSWORD, // Usa la variable de entorno
  database: process.env.DB_NAME,     // Usa la variable de entorno
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = pool.promise();