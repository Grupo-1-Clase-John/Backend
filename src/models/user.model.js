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

export const getUsers = () => readUsers();

export const userExists = (id) => {
  return readUsers().some(u => String(u.id) === String(id));
};

export const getUserById = (id) => {
  return readUsers().find(u => String(u.id) === String(id)) || null;
};

export const createUser = (data) => {
  const users = readUsers();
  const newId = String(data.id || Date.now());
  if (users.find(u => String(u.id) === newId)) return null;
  const newUser = { ...data, id: newId };
  users.push(newUser);
  writeUsers(users);
  return newUser;
};

export const updateUser = (id, data) => {
  const users = readUsers();
  const index = users.findIndex(u => String(u.id) === String(id));
  if (index === -1) return null;
  users[index] = { ...users[index], ...data, id: users[index].id };
  writeUsers(users);
  return users[index];
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
