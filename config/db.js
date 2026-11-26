require('dotenv').config();
const mysql = require('mysql2');

const connection = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: Number(process.env.DB_POOL_SIZE) || 10,
    // Fila de espera limitada: sob sobrecarga/ataque, o excesso recebe erro rápido
    // em vez de acumular requisições na memória sem limite (o padrão é 0 = ilimitada).
    queueLimit: 100
});

module.exports = connection.promise();