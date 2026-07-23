import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_PATH = join(__dirname, '../data/tasks.json');

const readTasks = () => {
  if (!existsSync(DATA_PATH)) return [];
  try {
    const tasks = JSON.parse(readFileSync(DATA_PATH, 'utf-8'));
    let migrated = false;
    const result = tasks.map(t => {
      if (t.userId && !t.userIds) {
        migrated = true;
        return { ...t, userIds: [String(t.userId)] };
      }
      return t;
    });
    if (migrated) writeTasks(result);
    return result;
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

export const getTasksByUser = (userId, status) => {
  const normId = String(userId);
  const tasks = readTasks().filter(t => (t.userIds || []).some(id => String(id) === normId));
  if (status) return tasks.filter(t => t.status === status);
  return tasks;
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
    userIds: Array.isArray(data.userIds) ? data.userIds.map(String) : [],
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

  const wasCompleted = tasks[index].status === 'completada';
  const newStatus = data.status;

  tasks[index] = {
    ...tasks[index],
    ...data,
    id: tasks[index].id,
    userIds: Array.isArray(data.userIds) ? data.userIds.map(String) : tasks[index].userIds,
    updatedAt: new Date().toISOString()
  };

  if (newStatus === 'completada') {
    tasks[index].completedAt = new Date().toISOString();
  } else if (newStatus && wasCompleted) {
    tasks[index].completedAt = null;
  }

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
