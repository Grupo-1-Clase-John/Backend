// Crear rutas para los usuarios

import { Router } from 'express';

export const usersRoutes = Router();

// GET /users → Devuelve un mensaje indicando que se listarán los usuarios.

usersRoutes.get('/', (req, res) => {
  res.json(
    {
      user1: 'Ana',
      user2: 'Juan',
      user3: 'Pedro',
      user4: 'María',
      user5: 'Luis',
      user6: 'Sofía',
      user7: 'Carlos',
      user8: 'Lucía',
      user9: 'Javier',
      user10: 'Valentina'
    }
  );
});

// POST /users → Mensaje indicando que se creará un usuario.

usersRoutes.post('/', (req, res) => {
  res.json(
    {
      mensaje: 'Se creará un usuario.'
    }
  );
});