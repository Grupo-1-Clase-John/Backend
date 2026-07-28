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
