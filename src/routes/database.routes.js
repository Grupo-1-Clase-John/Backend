import { Router } from 'express';
import { getUsers, getUserById, getTasks, getTaskById, updateUser, updateTask } from '../controllers/database.controller.js';

export const databaseRoutes = Router();

databaseRoutes.get('/database/users', getUsers);
databaseRoutes.get('/database/users/:id', getUserById);
databaseRoutes.get('/database/tasks', getTasks);
databaseRoutes.get('/database/tasks/:id', getTaskById);

databaseRoutes.patch('/database/users/:id', updateUser);
databaseRoutes.patch('/database/tasks/:id', updateTask);
