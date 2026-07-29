import * as User from '../models/user.model.js';

export const getUsers = (req, res, next) => {
  try {
    res.json({ users: User.getUsers() });
  } catch (error) {
    next(error);
  }
};

export const getUserById = (req, res, next) => {
  try {
    const allUsers = User.getUsers();
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

export const updateUser = (req, res, next) => {
  try {
    const updated = User.updateUser(req.params.id, req.body);
    if (!updated) return res.status(404).json({ message: 'Usuario no encontrado' });
    res.json(updated);
  } catch (error) {
    next(error);
  }
};

export const deleteUser = (req, res, next) => {
  try {
    const deleted = User.deleteUser(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Usuario no encontrado' });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
