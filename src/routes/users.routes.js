import { Router } from 'express';
import { getUsers, getUserById, createUser, updateUser, deleteUser } from '../controllers/users.controller.js';
import { getTasksByUser } from '../controllers/tasks.controller.js';

export const usersRoutes = Router();

usersRoutes.get('/', getUsers);
usersRoutes.get('/:id', getUserById);
usersRoutes.post('/', createUser);
usersRoutes.patch('/:id', updateUser);
usersRoutes.delete('/:id', deleteUser);
usersRoutes.get('/:userId/tasks', getTasksByUser);