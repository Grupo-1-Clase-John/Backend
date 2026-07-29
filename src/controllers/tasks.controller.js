import * as Task from '../models/task.model.js';
import * as User from '../models/user.model.js';

export const getTasks = async (req, res, next) => {
  try {
    res.json({ tasks: await Task.getTasks() });
  } catch (error) {
    next(error);
  }
};

const validateUserIds = async (userIds) => {
  const allUsers = await User.getUsers();
  const validIds = allUsers.map(u => String(u.id));
  const invalid = userIds.filter(id => !validIds.includes(String(id)));
  if (invalid.length > 0) {
    return `Los siguientes usuarios no existen: ${invalid.join(', ')}`;
  }
  return null;
};

export const createTask = async (req, res, next) => {
  try {
    const { title, userIds } = req.body;
    if (!title) {
      return res.status(400).json({ message: 'El título es requerido' });
    }
    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ message: 'Debe asignar al menos un usuario' });
    }
    const error = await validateUserIds(userIds);
    if (error) return res.status(400).json({ message: error });
    const newTask = Task.createTask(req.body);
    res.status(201).json(newTask);
  } catch (error) {
    next(error);
  }
};

const VALID_STATUSES = ['pendiente', 'en-proceso', 'completada'];

export const updateTask = async (req, res, next) => {
  try {
    const { status, userIds } = req.body;

    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({ message: 'Debe enviar al menos un campo para actualizar' });
    }

    if (status !== undefined && !VALID_STATUSES.includes(status)) {
      return res.status(400).json({ message: `Estado inválido. Valores permitidos: ${VALID_STATUSES.join(', ')}` });
    }

    if (userIds !== undefined) {
      if (!Array.isArray(userIds)) {
        return res.status(400).json({ message: 'userIds debe ser un array' });
      }
      if (userIds.length === 0) {
        return res.status(400).json({ message: 'Debe asignar al menos un usuario' });
      }
      const error = await validateUserIds(userIds);
      if (error) return res.status(400).json({ message: error });
    }

    const updated = await Task.updateTask(req.params.id, req.body);
    if (!updated) return res.status(404).json({ message: 'Tarea no encontrada' });
    res.json(updated);
  } catch (error) {
    next(error);
  }
};

export const getTaskById = async (req, res, next) => {
  try {
    const task = await Task.getTaskById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Tarea no encontrada' });
    res.json(task);
  } catch (error) {
    next(error);
  }
};

export const deleteTask = (req, res, next) => {
  try {
    const deleted = Task.deleteTask(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Tarea no encontrada' });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

export const getTasksByUser = async (req, res, next) => {
  try {
    const userId = req.params.userId;
    const user = await User.getUserById(userId);
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

    const status = req.query.status || null;
    const tasks = await Task.getTasksByUser(userId, status);
    res.json({ user, tasks });
  } catch (error) {
    next(error);
  }
};
