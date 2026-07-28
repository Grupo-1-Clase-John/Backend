-- Base de datos y tablas para el proyecto Backend
-- Script simplificado para MySQL / MariaDB

CREATE DATABASE IF NOT EXISTS proyecto_jhon_db;
USE proyecto_jhon_db;

-- Asegura que si la tabla existe se elimina antes de crearla
DROP TABLE IF EXISTS task_assignments;
DROP TABLE IF EXISTS tasks;
DROP TABLE IF EXISTS users;

-- Tabla de usuarios
CREATE TABLE users (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(200) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'user'
);

-- Tabla de tareas
CREATE TABLE tasks (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'pendiente'
);

-- Tabla de relación tarea-usuario
CREATE TABLE task_assignments (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  task_id INT NOT NULL,
  user_id INT NOT NULL,
  UNIQUE KEY ux_task_user (task_id, user_id),
  FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- Datos de ejemplo para usuarios
INSERT INTO users (id, name, email, role)
VALUES
  (1, 'Miguel Flórez', 'miguelfv10@hotmail.com', 'admin'),
  (2, 'Oscar Solano', 'mao090997@gmail.com', 'user'),
  (3, 'Sara Rojas', 'saresro04@gmail.com', 'user'),
  (4, 'Juan Pérez', 'juan.perez@mail.com', 'user'),
  (5, 'Laura Martínez', 'laura.martinez@mail.com', 'user'),
  (6, 'Pedro Sánchez', 'pedro.sanchez@mail.com', 'user'),
  (7, 'Sofía Ramírez', 'sofia.ramirez@mail.com', 'user'),
  (9, 'Valentina Cruz', 'valentina.cruz@mail.com', 'user'),
  (10, 'Diego Herrera', 'diego.herrera@mail.com', 'user'),
  (11, 'rosa carmenza', 'Rosa.Carmenza@correo.com', 'user'),
  (12, 'Juan Perez', 'juan.perez@mail.com', 'user');

-- Datos de ejemplo para tareas
INSERT INTO tasks (id, title, description, status)
VALUES
  (1, 'Revisar correo de wsp', 'Organizar bandeja de entrada y responder mensajes', 'en-proceso'),
  (2, 'Preparar presentación', 'Crear diapositivas para la reunión del viernes', 'pendiente'),
  (3, 'Actualizar el css', 'darle una metodologss y script', 'completada'),
  (4, 'Enviar informe mensual', 'Compilar datos y enviar al jefe de área', 'completada'),
  (5, 'comprar', 'comprar una casa', 'completada'),
  (6, 'fffffff', 'ddddddddd', 'pendiente'),
  (7, 'Test', 'test', 'pendiente'),
  (8, 'Nueva tarea', NULL, 'pendiente'),
  (9, 'ponerse', 'los zapatos', 'completada'),
  (10, 'lavar la casa', 'ordenar a detalle todo, y ya saben todos en equipo', 'en-proceso'),
  (11, 'lavar la casa', 'estar atento', 'pendiente'),
  (12, 'ffdfdfdfd', 'dffdfdfdfd', 'en-proceso'),
  (13, '232', '34343', 'en-proceso'),
  (14, 'sdsdsd', 'dsdsddsd', 'pendiente'),
  (15, '1', '22', 'pendiente'),
  (16, 'sdsd', 'dsd', 'completada'),
  (17, '3434', '343', 'pendiente');
-- Relaciones entre tareas y usuarios
INSERT INTO task_assignments (task_id, user_id)
VALUES
  (1, 6),
  (2, 5),
  (3, 9),
  (4, 4),
  (5, 11),
  (6, 2),
  (7, 1),
  (8, 3),
  (9, 6),
  (10, 2),
  (11, 3),
  (11, 4),
  (12, 9),
  (12, 11),
  (12, 12),
  (13, 1),
  (14, 2),
  (15, 3),
  (16, 3),
  (17, 4);
