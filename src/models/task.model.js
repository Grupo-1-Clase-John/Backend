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

const mapTask = (row) => ({
  ...row,
  userIds: row.userIds ? row.userIds.split(',').map(String) : []
});

export const getTasks = async () => {
  const [rows] = await pool.query(
    'SELECT t.*, GROUP_CONCAT(ta.user_id) AS userIds FROM tasks t LEFT JOIN task_assignments ta ON t.id = ta.task_id GROUP BY t.id'
  );
  return rows.map(mapTask);
};

export const getTaskById = async (id) => {
  const [rows] = await pool.query(
    'SELECT t.*, GROUP_CONCAT(ta.user_id) AS userIds FROM tasks t LEFT JOIN task_assignments ta ON t.id = ta.task_id WHERE t.id = ? GROUP BY t.id',
    [id]
  );
  return rows[0] ? mapTask(rows[0]) : null;
};

export const getTasksByUser = async (userId, status) => {
  const [rows] = await pool.query(
    'SELECT t.*, GROUP_CONCAT(ta2.user_id) AS userIds FROM tasks t INNER JOIN task_assignments ta ON t.id = ta.task_id AND ta.user_id = ? LEFT JOIN task_assignments ta2 ON t.id = ta2.task_id GROUP BY t.id',
    [userId]
  );
  let tasks = rows.map(mapTask);
  if (status) tasks = tasks.filter(t => t.status === status);
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
    userIds: Array.isArray(data.userIds) ? [...new Set(data.userIds.map(String))] : [],
    status: data.status || 'pendiente',
    createdAt: new Date().toISOString()
  };
  tasks.push(newTask);
  writeTasks(tasks);
  return newTask;
};

export const updateTask = async (id, data) => {
  const { userIds, ...taskFields } = data;
  const fields = [];
  const values = [];

  if (taskFields.title !== undefined) {
    fields.push('title = ?');
    values.push(taskFields.title);
  }
  if (taskFields.description !== undefined) {
    fields.push('description = ?');
    values.push(taskFields.description);
  }
  if (taskFields.status !== undefined) {
    fields.push('status = ?');
    values.push(taskFields.status);
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    let taskExists = true;

    if (fields.length > 0) {
      values.push(id);
      const [result] = await connection.query(`UPDATE tasks SET ${fields.join(', ')} WHERE id = ?`, values);
      if (result.affectedRows === 0) taskExists = false;
    }

    if (userIds !== undefined) {
      await connection.query('DELETE FROM task_assignments WHERE task_id = ?', [id]);
      if (userIds.length > 0) {
        const insertValues = userIds.map(userId => [id, userId]);
        await connection.query('INSERT INTO task_assignments (task_id, user_id) VALUES ?', [insertValues]);
      }
    }

    await connection.commit();

    if (!taskExists) return null;

    return getTaskById(id);
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

export const deleteTask = (id) => {
  const tasks = readTasks();
  const index = tasks.findIndex(t => String(t.id) === String(id));
  if (index === -1) return false;
  tasks.splice(index, 1);
  writeTasks(tasks);
  return true;
};
