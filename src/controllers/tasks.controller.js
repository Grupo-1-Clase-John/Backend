import * as Task from '../models/task.model.js';

export const getTasks = (req, res) => {
  res.json({ tasks: Task.getTasks() });
};

export const createTask = (req, res) => {
  const newTask = Task.createTask(req.body);
  res.status(201).json(newTask);
};

export const updateTask = (req, res) => {
  const updated = Task.updateTask(req.params.id, req.body);
  if (!updated) return res.status(404).json({ message: 'Tarea no encontrada' });
  res.json(updated);
};

export const deleteTask = (req, res) => {
  const deleted = Task.deleteTask(req.params.id);
  if (!deleted) return res.status(404).json({ message: 'Tarea no encontrada' });
  res.status(204).send();
};

export const getTasksByUser = (req, res) => {
  const userTasks = Task.getTasksByUser(req.params.userId);
  res.json(userTasks);
};
