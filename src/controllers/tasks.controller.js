import * as Task from '../models/task.model.js';
import * as User from '../models/user.model.js';

export const getTasks = (req, res, next) => {
  try {
    res.json({ tasks: Task.getTasks() });
  } catch (error) {
    next(error);
  }
};

export const createTask = (req, res, next) => {
  try {
    const { title, userIds } = req.body;
    if (!title) {
      return res.status(400).json({ message: 'El título es requerido' });
    }
    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ message: 'Debe asignar al menos un usuario' });
    }
    const newTask = Task.createTask(req.body);
    if (!newTask) {
      return res.status(500).json({ message: 'Error al crear la tarea' });
    }
    res.status(201).json(newTask);
  } catch (error) {
    next(error);
  }
};

const VALID_STATUSES = ['pendiente', 'en-proceso', 'completada'];

export const updateTask = (req, res, next) => {
  try {
    const { status, userIds } = req.body;

    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({ message: 'Debe enviar al menos un campo para actualizar' });
    }

    if (status !== undefined && !VALID_STATUSES.includes(status)) {
      return res.status(400).json({ message: `Estado inválido. Valores permitidos: ${VALID_STATUSES.join(', ')}` });
    }

    if (userIds !== undefined && !Array.isArray(userIds)) {
      return res.status(400).json({ message: 'userIds debe ser un array' });
    }

    const updated = Task.updateTask(req.params.id, req.body);
    if (!updated) return res.status(404).json({ message: 'Tarea no encontrada' });
    res.json(updated);
  } catch (error) {
    next(error);
  }
};

export const getTaskById = (req, res, next) => {
  try {
    const task = Task.getTaskById(req.params.id);
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

export const getTasksByUser = (req, res, next) => {
  try {
    const userId = req.params.userId;
    const user = User.getUserById(userId);
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

    const status = req.query.status || null;
    const tasks = Task.getTasksByUser(userId, status);
    res.json({ user, tasks });
  } catch (error) {
    next(error);
  }
};
