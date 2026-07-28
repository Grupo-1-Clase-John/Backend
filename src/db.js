import mysql from 'mysql2/promise';
import 'dotenv/config';

// Creamos un pool usando las credenciales de Workbench
export const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT) || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Función simple para probar que la conexión funciona
const probarConexion = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('Conexión exitosa a MySQL (Workbench)');
    connection.release(); // Liberamos la conexión de vuelta al pool
  } catch (error) {
    console.error('Error al conectar a la base de datos:', error.message);
  }
}

probarConexion();