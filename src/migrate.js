import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import mysql from 'mysql2/promise';
import 'dotenv/config';

// Extraer variables del .env (DB_PORT por defecto 3306)
const { DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, DB_PORT = '3306' } = process.env;

// Validar que existan las variables obligatorias
if (!DB_HOST || !DB_USER || !DB_PASSWORD || !DB_NAME) {
  console.error('Faltan variables de entorno. Revisa tu archivo .env');
  process.exit(1);
}

// Leer el archivo db.sql 
const rutaSQL = join(dirname(fileURLToPath(import.meta.url)), 'data', 'db.sql');
const sql = await readFile(rutaSQL, 'utf8');

// Conexión directa a MySQL ( para migración única)
const conexion = await mysql.createConnection({
  host: DB_HOST,
  user: DB_USER,
  password: DB_PASSWORD,
  port: Number(DB_PORT),
  multipleStatements: true
});

try {
  await conexion.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\``);
  await conexion.query(`USE \`${DB_NAME}\``);
  await conexion.query(sql); // Ejecuta todo el db.sql (tablas + datos)
  console.log(`Migración completada en "${DB_NAME}".`);
} catch (error) {
  console.error('Error en migración:', error.message);
  process.exit(1);
} finally {
  await conexion.end(); // Siempre cerrar la conexión
}
