import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { pool } from '../db.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_PATH = join(__dirname, '../data/users.json');

const readUsers = () => {
  if (!existsSync(DATA_PATH)) return [];
  try {
    return JSON.parse(readFileSync(DATA_PATH, 'utf-8'));
  } catch {
    return [];
  }
};

const writeUsers = (users) => {
  writeFileSync(DATA_PATH, JSON.stringify(users, null, 2), 'utf-8');
};

export const getUsers = async () => {
  const [rows] = await pool.query('SELECT * FROM users');
  return rows;
};

export const getUserById = async (id) => {
  const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
  return rows[0] || null;
};

export const userExists = async (id) => {
  const [rows] = await pool.query('SELECT COUNT(*) AS count FROM users WHERE id = ?', [id]);
  return rows[0].count > 0;
};

export const createUser = async (data) => {
  const { name, email, role = 'user' } = data;
  const [result] = await pool.execute(
    'INSERT INTO users (name, email, role) VALUES (?, ?, ?)',
    [name, email, role]
  );
  return { id: String(result.insertId), name, email, role };
};

export const updateUser = async (id, data) => {
  const fields = [];
  const values = [];

  if (data.name !== undefined) {
    fields.push('name = ?');
    values.push(data.name);
  }
  if (data.email !== undefined) {
    fields.push('email = ?');
    values.push(data.email);
  }
  if (data.role !== undefined) {
    fields.push('role = ?');
    values.push(data.role);
  }

  if (fields.length === 0) return null;

  values.push(id);
  const [result] = await pool.query(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`, values);

  if (result.affectedRows === 0) return null;

  return getUserById(id);
};

export const deleteUser = async (id) => {
  const connection = await pool.getConnection();
  try {
    const [result] = await connection.query('DELETE FROM users WHERE id = ?', [id]);
    return result.affectedRows > 0;
  } finally {
    connection.release();
  }
};
