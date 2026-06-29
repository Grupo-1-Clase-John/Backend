// Crear rutas para los usuarios

import {Router} from 'express';

export const usersRoutes = Router();

// GET /users → Devuelve un mensaje indicando que se listarán los usuarios.

usersRoutes.get('/', (req, res) => {
  res.json({ mensaje: 'Se listarán los usuarios.' });
});

// POST /users → Mensaje indicando que se creará un usuario.

usersRoutes.post('/', (req, res) => {
  res.json({ mensaje: 'Se creará un usuario.' });
});