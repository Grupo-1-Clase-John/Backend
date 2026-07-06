// Rutas de tareas

import { Router } from 'express';
import { getTasks, getTaskById, createTask, updateTask, deleteTask } from '../controllers/tasks.controller.js';

export const tasksRoutes = Router();

tasksRoutes.get('/', getTasks);
tasksRoutes.get('/:id', getTaskById);
tasksRoutes.post('/', createTask);
tasksRoutes.patch('/:id', updateTask);
tasksRoutes.delete('/:id', deleteTask);



// # Tareas de un usuario	http://localhost:3000/users/1/tasks
// # Listar tareas	http://localhost:3000/tasks
// # Tarea por ID	http://localhost:3000/tasks/2