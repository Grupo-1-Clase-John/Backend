import * as User from '../models/user.model.js';

export const getUsers = (req, res) => {
  res.json({ users: User.getUsers() });
};

export const getUserById = (req, res) => {
  const user = User.getUserById(req.params.id);
  if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });
  res.json(user);
};

export const createUser = (req, res) => {
  const newUser = User.createUser(req.body);
  res.status(201).json(newUser);
};

export const updateUser = (req, res) => {
  const updated = User.updateUser(req.params.id, req.body);
  if (!updated) return res.status(404).json({ message: 'Usuario no encontrado' });
  res.json(updated);
};

export const deleteUser = (req, res) => {
  const deleted = User.deleteUser(req.params.id);
  if (!deleted) return res.status(404).json({ message: 'Usuario no encontrado' });
  res.status(204).send();
};
