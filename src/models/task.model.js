import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_PATH = join(__dirname, '../data/tasks.json');

const readTasks = () => {
  if (!existsSync(DATA_PATH)) return [];
  try {
    return JSON.parse(readFileSync(DATA_PATH, 'utf-8'));
  } catch {
    return [];
  }
};

const writeTasks = (tasks) => {
  writeFileSync(DATA_PATH, JSON.stringify(tasks, null, 2), 'utf-8');
};

export const getTasks = () => readTasks();

export const getTaskById = (id) => {
  return readTasks().find(t => String(t.id) === String(id)) || null;
};

export const getTasksByUser = (userId) => {
  return readTasks().filter(t => String(t.userId) === String(userId));
};

export const createTask = (data) => {
  const tasks = readTasks();
  const maxId = tasks.reduce((max, t) => {
    const num = parseInt(t.id, 10);
    return num > max ? num : max;
  }, 0);
  const newTask = {
    ...data,
    id: String(maxId + 1),
    userId: String(data.userId || ''),
    status: data.status || 'pendiente',
    createdAt: new Date().toISOString()
  };
  tasks.push(newTask);
  writeTasks(tasks);
  return newTask;
};

export const updateTask = (id, data) => {
  const tasks = readTasks();
  const index = tasks.findIndex(t => String(t.id) === String(id));
  if (index === -1) return null;
  tasks[index] = {
    ...tasks[index],
    ...data,
    id: tasks[index].id,
    userId: String(data.userId || tasks[index].userId)
  };
  writeTasks(tasks);
  return tasks[index];
};

export const deleteTask = (id) => {
  const tasks = readTasks();
  const index = tasks.findIndex(t => String(t.id) === String(id));
  if (index === -1) return false;
  tasks.splice(index, 1);
  writeTasks(tasks);
  return true;
};
