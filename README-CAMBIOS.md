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

## Segunda implementación — Actualizar registros (UPDATE)

### Requerimiento

> *"El sistema debe permitir modificar información previamente almacenada en la base de datos. La funcionalidad debe: Identificar el registro que se desea modificar. Actualizar los datos correspondientes. Confirmar que la operación fue realizada correctamente."*

### ¿Qué se agregó?

Se añadió la funcionalidad de **actualización (UPDATE)** a los modelos, controladores y rutas existentes de MySQL. No se crearon archivos nuevos; se modificaron únicamente los 4 archivos que ya existían de la implementación anterior (todos creados por mí, ninguno de los compañeros).

### Cambios por archivo

**`src/models/user.db.model.js`**
- Se agregó la función `updateUser(id, data)`.
- Construye dinámicamente la cláusula `SET` del `UPDATE` incluyendo solo los campos que vienen en `data` (`name`, `email`, `role`).
- Si no se envía ningún campo válido, retorna `null`.
- Si el `id` no existe en la base de datos (`affectedRows === 0`), retorna `null`.
- Si la actualización fue exitosa, retorna el registro completo llamando a `getUserById(id)`.

**`src/models/task.db.model.js`**
- Se agregó la función `updateTask(id, data)`.
- Separa `userIds` del resto de campos para tratarlos por separado.
- **Campos de la tarea** (`title`, `description`, `status`): construye el `SET` dinámicamente igual que en usuarios.
- **`userIds`**: si viene en `data`, se ejecuta:
  1. `DELETE FROM task_assignments WHERE task_id = ?` — elimina las relaciones existentes.
  2. `INSERT INTO task_assignments (task_id, user_id) VALUES ?` — inserta las nuevas relaciones.
- Toda la operación se ejecuta dentro de una **transacción** (`BEGIN`, `COMMIT`, `ROLLBACK`) para asegurar que si algo falla, la base de datos queda en un estado consistente.
- Si solo se actualizan `userIds` y la tarea no existe, retorna `null`.
- Si la actualización fue exitosa, retorna la tarea completa con sus usuarios asignados llamando a `getTaskById(id)`.

**`src/controllers/database.controller.js`**
- Se agregaron dos controladores: `updateUser` y `updateTask`.
- Validan que el body no esté vacío → si lo está, responden `400`.
- Llaman al modelo correspondiente.
- Si el modelo retorna `null` (registro no encontrado) → responden `404`.
- Si la actualización es exitosa → responden `200` con el registro actualizado.
- Si hay un error de conexión o consulta → `next(error)` deriva al middleware global que responde `500`.

**`src/routes/database.routes.js`**
- Se importaron `updateUser` y `updateTask` desde el controlador.
- Se agregaron dos rutas nuevas:

| Método | Ruta | Descripción | Códigos HTTP |
|--------|------|-------------|--------------|
| PATCH | `/database/users/:id` | Actualizar usuario parcialmente | 200, 400, 404 |
| PATCH | `/database/tasks/:id` | Actualizar tarea parcialmente (incluye usuarios asignados) | 200, 400, 404 |

### Cumplimiento del requerimiento

1. **Identificar el registro** → el `:id` en la URL identifica qué registro modificar.
2. **Actualizar los datos** → la función `updateUser` / `updateTask` ejecuta el `UPDATE` SQL con los campos recibidos.
3. **Confirmar la operación** → se retorna el registro actualizado con código `200` (éxito), o `404` si no se encontró, o `400` si no se enviaron datos.

### Ejemplos de uso

```bash
# Actualizar solo el nombre de un usuario
curl -X PATCH http://localhost:3000/database/users/1 \
  -H "Content-Type: application/json" \
  -d '{"name": "Nuevo Nombre"}'

# Actualizar estado de una tarea
curl -X PATCH http://localhost:3000/database/tasks/1 \
  -H "Content-Type: application/json" \
  -d '{"status": "completada"}'

# Actualizar título y usuarios asignados de una tarea
curl -X PATCH http://localhost:3000/database/tasks/1 \
  -H "Content-Type: application/json" \
  -d '{"title": "Nuevo título", "userIds": [1, 2, 3]}'

# Error: body vacío
curl -X PATCH http://localhost:3000/database/users/1 \
  -H "Content-Type: application/json" \
  -d '{}'
# → 400: Debe enviar al menos un campo para actualizar

# Error: ID inexistente
curl -X PATCH http://localhost:3000/database/users/999 \
  -H "Content-Type: application/json" \
  -d '{"name": "Test"}'
# → 404: Usuario no encontrado
```

### Notas técnicas
- Las rutas usan `PATCH` (no `PUT`) porque permiten actualización parcial de campos, consistente con las rutas JSON originales de los compañeros.
- La actualización de `userIds` en tareas reemplaza completamente la lista de asignaciones (no agrega ni quita uno por uno).
- Las transacciones en `updateTask` garantizan que si falla la actualización de las asignaciones, los cambios en la tarea también se revierten.

## Uso

```bash
cp example.env .env

npm install
npm run migrate
npm start

# endpoints
curl http://localhost:3000/database/users
curl http://localhost:3000/database/users/1
curl http://localhost:3000/database/tasks
curl http://localhost:3000/database/tasks/1
```

## A

Este archivo temporal