// Rutas de tareas

import { Router } from 'express';
import { getTasks, createTask, updateTask, deleteTask } from '../controllers/tasks.controller.js';

export const tasksRoutes = Router();

tasksRoutes.get('/', getTasks);
tasksRoutes.post('/', createTask);
tasksRoutes.patch('/:id', updateTask);
tasksRoutes.delete('/:id', deleteTask);
