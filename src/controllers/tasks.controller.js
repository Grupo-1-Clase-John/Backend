import * as Task from '../models/task.model.js';

export const getTasks = (req, res, next) => {
  try {
    res.json({ tasks: Task.getTasks() });
  } catch (error) {
    next(error);
  }
};

export const createTask = (req, res, next) => {
  try {
    const { title, userId } = req.body;
    if (!title) {
      return res.status(400).json({ message: 'El título es requerido' });
    }
    if (!userId) {
      return res.status(400).json({ message: 'El userId es requerido' });
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

export const updateTask = (req, res, next) => {
  try {
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
    const userTasks = Task.getTasksByUser(req.params.userId);
    res.json(userTasks);
  } catch (error) {
    next(error);
  }
};
