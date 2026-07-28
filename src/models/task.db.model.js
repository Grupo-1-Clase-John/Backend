import { pool } from '../db.js';

export const getTasks = async () => {
  const [rows] = await pool.query(`
    SELECT t.*, GROUP_CONCAT(ta.user_id) AS userIds
    FROM tasks t
    LEFT JOIN task_assignments ta ON t.id = ta.task_id
    GROUP BY t.id
  `);
  return rows.map(row => ({
    ...row,
    userIds: row.userIds ? row.userIds.split(',').map(String) : []
  }));
};

export const getTaskById = async (id) => {
  const [rows] = await pool.query(`
    SELECT t.*, GROUP_CONCAT(ta.user_id) AS userIds
    FROM tasks t
    LEFT JOIN task_assignments ta ON t.id = ta.task_id
    WHERE t.id = ?
    GROUP BY t.id
  `, [id]);
  if (!rows[0]) return null;
  const task = rows[0];
  task.userIds = task.userIds ? task.userIds.split(',').map(String) : [];
  return task;
};
