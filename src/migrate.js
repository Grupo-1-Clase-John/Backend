import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import mysql from 'mysql2/promise';
import 'dotenv/config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, DB_PORT = '3306' } = process.env;

if (!DB_HOST || !DB_USER || !DB_PASSWORD || !DB_NAME) {
  console.error('Faltan variables de entorno. Crea un archivo .env con DB_HOST, DB_USER, DB_PASSWORD y DB_NAME.');
  process.exit(1);
}

const sqlPath = path.resolve(__dirname, 'data', 'db.sql');
const sql = await fs.readFile(sqlPath, 'utf8');
const normalizedSql = sql.replace(/proyecto_jhon_db/g, DB_NAME);

const connection = await mysql.createConnection({
  host: DB_HOST,
  user: DB_USER,
  password: DB_PASSWORD,
  port: Number(DB_PORT),
  multipleStatements: true
});

try {
  await connection.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\``);
  await connection.query(`USE \`${DB_NAME}\``);
  await connection.query(normalizedSql);
  console.log(`Migración completada correctamente en la base de datos "${DB_NAME}".`);
} catch (error) {
  console.error('Error ejecutando la migración:', error.message);
  process.exit(1);
} finally {
  await connection.end();
}