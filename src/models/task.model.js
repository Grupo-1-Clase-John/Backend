import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { pool } from '../db.js';

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

export const getTasksByUser = (userId, status) => {
  const normId = String(userId);
  const tasks = readTasks().filter(t => (t.userIds || []).some(id => String(id) === normId));
  if (status) return tasks.filter(t => t.status === status);
  return tasks;
};

export const createTask = async (data) => {
  const { title, description, status = 'pendiente', userIds } = data;
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const [taskResult] = await connection.execute(
      'INSERT INTO tasks (title, description, status) VALUES (?, ?, ?)',
      [title, description || null, status]
    );
    const taskId = taskResult.insertId;

    const uniqueUserIds = [...new Set((userIds || []).map(String))];
    for (const userId of uniqueUserIds) {
      await connection.execute(
        'INSERT INTO task_assignments (task_id, user_id) VALUES (?, ?)',
        [taskId, userId]
      );
    }

    await connection.commit();

    return {
      id: String(taskId),
      title,
      description: description || null,
      status,
      userIds: uniqueUserIds,
      
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
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
    userIds: Array.isArray(data.userIds) ? [...new Set(data.userIds.map(String))] : tasks[index].userIds,
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

export const deleteTask = async (id) => {
  const connection = await pool.getConnection();
  try {
    const [result] = await connection.query('DELETE FROM tasks WHERE id = ?', [id]);
    return result.affectedRows > 0;
  } finally {
    connection.release();
  }
};
