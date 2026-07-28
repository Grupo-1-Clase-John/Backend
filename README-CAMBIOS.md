## ¿Qué se agregó?

Se implementaron **consultas a la base de datos MySQL** para obtener usuarios y tareas. Anteriormente el sistema solo leía archivos JSON, y aunque ya se había agregado la conexión a MySQL (`src/db.js`), los modelos de datos nunca la usaban. Este cambio conecta esa infraestructura con endpoints funcionales.

## ¿Dónde se agregó?

Se crearon **4 archivos nuevos** y se modificó **1 archivo existente**:

### Archivos nuevos 

| Archivo | Rol |
|---------|-----|
| `src/models/user.db.model.js` | Ejecuta consultas SQL (`SELECT`) contra la tabla `users` |
| `src/models/task.db.model.js` | Ejecuta consultas SQL con `JOIN` a `task_assignments` para incluir los usuarios asignados a cada tarea |
| `src/controllers/database.controller.js` | Controladores asíncronos que llaman a los modelos y devuelven respuestas HTTP con códigos 200 (éxito), 404 (no encontrado) y 500 (error de servidor) |
| `src/routes/database.routes.js` | Define las rutas que expone la API |

### Archivo modificado

`src/app.js` — se agregaron únicamente **2 líneas** nuevas:
1. `import { databaseRoutes } from './routes/database.routes.js';`
2. `app.use(databaseRoutes);`

Ninguna línea del código original fue alterada ni eliminada. Las rutas viejas (`/users`, `/tasks`, `/users/:userId/tasks`) siguen funcionando exactamente igual con sus archivos JSON.

## ¿Qué hace cada parte?

### Modelos (`user.db.model.js` y `task.db.model.js`)
Contienen funciones asíncronas que utilizan el pool de conexiones de `src/db.js` para ejecutar consultas SQL directamente en MySQL.
- **`getUsers()`**: `SELECT * FROM users` — trae todos los usuarios de la base de datos.
- **`getUserById(id)`**: `SELECT * FROM users WHERE id = ?` — busca un usuario por su ID, retorna `null` si no existe.
- **`getTasks()`**: `SELECT t.*, GROUP_CONCAT(ta.user_id) AS userIds FROM tasks t LEFT JOIN task_assignments ta ON t.id = ta.task_id GROUP BY t.id` — trae todas las tareas y, mediante un `LEFT JOIN`, también los IDs de los usuarios asignados a cada tarea. Convierte el resultado de `GROUP_CONCAT` (string separado por comas) en un arreglo JavaScript.
- **`getTaskById(id)`**: igual que `getTasks()` pero filtrado por el ID de la tarea.

### Controlador (`database.controller.js`)
Recibe las peticiones del router, llama a los modelos y construye la respuesta HTTP:
- Si la consulta es exitosa → `res.json(...)` con código **200**.
- Si el registro no existe → `res.status(404).json({ message: '...' })`.
- Si hay un error de conexión o consulta → `next(error)` que termina en el middleware global de Express, devolviendo **500**.

### Rutas (`database.routes.js`)
Expone los siguientes endpoints:

| Método | Ruta | Descripción | Códigos HTTP |
|--------|------|-------------|--------------|
| GET | `/database/users` | Todos los usuarios | 200 |
| GET | `/database/users/:id` | Usuario por ID | 200, 404 |
| GET | `/database/tasks` | Todas las tareas | 200 |
| GET | `/database/tasks/:id` | Tarea por ID | 200, 404 |

## ¿Qué parte del requerimiento cumple?

El requerimiento dice:

> *"El sistema debe permitir consultar la información almacenada en la base de datos. Debe ser posible: Obtener todos los registros del sistema. Obtener un registro específico mediante su identificador. Enviar la información al cliente utilizando respuestas HTTP adecuadas."*

Cada punto se cumple así:
1. **Obtener todos los registros** → `GET /database/users` y `GET /database/tasks`
2. **Obtener un registro por ID** → `GET /database/users/:id` y `GET /database/tasks/:id`
3. **Respuestas HTTP adecuadas** → códigos 200, 404 y 500 según el caso, con mensajes descriptivos en el cuerpo JSON

## Cómo usar

```bash
# 1. Copiar y configurar variables de entorno
cp example.env .env
# Editar .env con tus credenciales de MySQL

# 2. Instalar dependencias
npm install

# 3. Crear la base de datos y tablas
npm run migrate

# 4. Iniciar el servidor
npm start

# 5. Probar los endpoints
curl http://localhost:3000/database/users
curl http://localhost:3000/database/users/1
curl http://localhost:3000/database/tasks
curl http://localhost:3000/database/tasks/1
```

## Nota

Este archivo es temporal y puede eliminarse después de revisar los cambios.
