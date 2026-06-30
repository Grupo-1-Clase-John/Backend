// Rutas de tareas

import { Router } from 'express';

export const tasksRoutes = Router();

// GET /tasks → Devuelve un mensaje indicando que se listarán las tareas.

tasksRoutes.get('/', (req, res) => {
  res.json(
    {
      task1: 'Tarea 1',
      task2: 'Tarea 2',
      task3: 'Tarea 3',
      task4: 'Tarea 4',
      task5: 'Tarea 5',
      task6: 'Tarea 6',
      task7: 'Tarea 7',
      task8: 'Tarea 8',
      task9: 'Tarea 9',
      task10: 'Tarea 10'
    }
  );
});

// POST /tasks → Mensaje indicando que se creará una tarea.

tasksRoutes.post('/', (req, res) => {
  res.json(
    {
      mensaje: 'Se creará una tarea.'
    }
  );
});
