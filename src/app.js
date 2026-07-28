import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { usersRoutes } from './routes/users.routes.js';
import { tasksRoutes } from './routes/tasks.routes.js';
import { databaseRoutes } from './routes/database.routes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json(
    {
      saludo: 'Hola, compañeros. ¡El servidor está funcionando correctamente!'
    }
  );
});

app.use('/tasks', tasksRoutes);
app.use('/users', usersRoutes);
app.use(databaseRoutes);

app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(500).json({ message: 'Error interno del servidor' });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
