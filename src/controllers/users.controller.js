import * as User from '../models/user.model.js';

export const getUsers = async (req, res, next) => {
  try {
    res.json({ users: await User.getUsers() });
  } catch (error) {
    next(error);
  }
};

export const getUserById = async (req, res, next) => {
  try {
    const allUsers = await User.getUsers();
    const user = allUsers.find((u) => String(u.id) === String(req.params.id)) || null;

    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

    if (String(user.role).toLowerCase() === 'admin') {
      return res.json({ users: allUsers });
    }

    return res.json(user);
  } catch (error) {
    next(error);
  }
};

export const createUser = async (req, res, next) => {
  try {
    const { name, email } = req.body;
    if (!name || !email) {
      return res.status(400).json({ message: 'Nombre y email son requeridos' });
    }
    const newUser = await User.createUser(req.body);
    res.status(201).json(newUser);
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (req, res, next) => {
  try {
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({ message: 'Debe enviar al menos un campo para actualizar' });
    }
    const updated = await User.updateUser(req.params.id, req.body);
    if (!updated) return res.status(404).json({ message: 'Usuario no encontrado' });
    res.json(updated);
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const deleted = await User.deleteUser(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Usuario no encontrado' });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
