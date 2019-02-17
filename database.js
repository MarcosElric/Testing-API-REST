const mysql = require("mysql");
let pool = mysql.createPool({
  connectionLimit: 10,
  host: "db4free.net",
  user: "believe_user",
  password: "believe_password",
  database: "believe_app"
});

pool.getConnection((err, connection) => {
  if (err) {
    if (err.code === "PROTOCOL_CONNECTION_LOST") {
      console.error("Database connection was closed.");
    }
    if (err.code === "ER_CON_COUNT_ERROR") {
      console.error("Database has too many connections.");
    }
    if (err.code === "ECONNREFUSED") {
      console.error("Database connection was refused.");
    }
  }
  if (connection) connection.release();
  return;
});

module.exports = pool;
