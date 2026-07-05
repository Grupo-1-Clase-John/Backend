import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

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

export const getUserById = (id) => {
  return readUsers().find(u => u.id === id) || null;
};

export const createUser = (data) => {
  const users = readUsers();
  const newUser = { id: String(users.length + 1), ...data };
  users.push(newUser);
  writeUsers(users);
  return newUser;
};

export const updateUser = (id, data) => {
  const users = readUsers();
  const index = users.findIndex(u => u.id === id);
  if (index === -1) return null;
  users[index] = { ...users[index], ...data };
  writeUsers(users);
  return users[index];
};

export const deleteUser = (id) => {
  const users = readUsers();
  const index = users.findIndex(u => u.id === id);
  if (index === -1) return false;
  users.splice(index, 1);
  writeUsers(users);
  return true;
};
