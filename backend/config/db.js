const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: '127.0.0.1',
  port: 3306,
  user: 'bhanu2003',
  password: 'Bhanu@2003',
  database: 'project',
  waitForConnections: true,
  connectionLimit: 10
});

module.exports = pool;