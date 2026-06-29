// Rutas de tareas

import {Router} from 'express';

export const tasksRoutes = Router();

// GET /tasks → Devuelve un mensaje indicando que se listarán las tareas.

tasksRoutes.get('/', (req, res) => {
  res.json({ mensaje: 'Se listarán las tareas.' });
});

// POST /tasks → Mensaje indicando que se creará una tarea.

tasksRoutes.post('/', (req, res) => {
  res.json({ mensaje: 'Se creará una tarea.' });
});
