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

export const deleteUser = (id) => {
  const users = readUsers();
  const index = users.findIndex(u => String(u.id) === String(id));
  if (index === -1) return false;
  users.splice(index, 1);
  writeUsers(users);
  return true;
};
