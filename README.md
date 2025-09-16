Chat en tiempo real con Express + Socket.IO

Una app de chat simple en tiempo real. Los usuarios se conectan, envían y reciben mensajes al instante, y el sistema notifica conexiones y desconexiones. Se guarda en memoria un historial con los **últimos 10 mensajes** y se muestra a cualquier usuario nuevo.

Cómo funciona la comunicación con sockets
- El servidor crea un `io` de Socket.IO sobre un servidor HTTP de Express y sirve los archivos estáticos desde `public/`.
- Flujo de eventos:
  1. El cliente se conecta (`io()`) y muestra el formulario para unirse.
  2. Al presionar **Entrar**, el cliente emite `user:join` con el nombre.
  3. El servidor:
     - Asocia `socket.id -> username`.
     - Emite a ese socket `chat:history` con los últimos 10 mensajes.
     - Hace `broadcast` de `server:notification` avisando que alguien se conectó.
  4. Al enviar un mensaje, el cliente emite `chat:message <texto>`.
  5. El servidor construye `{ id, user, msg, ts }`, lo agrega al buffer (máx 10) y emite `chat:message` a **todos**.
  6. En `disconnect`, el servidor hace `broadcast` de `server:notification` indicando la salida.

### Eventos y payloads
- Cliente → Servidor
  - `user:join` → `string` (nombre)
  - `chat:message` → `string` (texto)
- Servidor → Cliente
  - `chat:history` → `Array<{ id:string, user:string, msg:string, ts:number }>`
  - `chat:message` → `{ id, user, msg, ts }`
  - `server:notification` → `string`

El historial está en memoria del proceso. Si se reinicia el servidor, se limpia.

## Estructura del proyecto
websocket-chat/
├─ server.js
├─ package.json
└─ public/
├─ index.html
├─ styles.css
└─ client.js

Qué aprendí

WebSockets permiten comunicación bidireccional persistente. Con Socket.IO no es necesario “preguntar” por cambios: el servidor emite eventos cuando ocurren. Manejar un buffer de mensajes (con límite) es útil para onboarding de nuevos usuarios.

Detalles prácticos: sanitizar texto antes de inyectarlo en el DOM, limitar longitud de mensajes, y distinguir emisiones a uno (socket.emit), a todos (io.emit) y a “todos menos yo” (socket.broadcast.emit).

## Evidencias

### Conexión de dos clientes
<img width="921" height="248" alt="image" src="https://github.com/user-attachments/assets/7ec2d079-6b9a-4a20-86cc-8acc121df2bc" />

### Mensajes en tiempo real
<img width="921" height="624" alt="image" src="https://github.com/user-attachments/assets/78b27133-18e9-48d8-9e57-82f084ce970f" />

### Desconexión
<img width="921" height="247" alt="image" src="https://github.com/user-attachments/assets/eb3cba99-97af-426d-b394-0a3040b72ee6" />

### Historial (últimos 10)
<img width="921" height="543" alt="image" src="https://github.com/user-attachments/assets/d0d4df86-fcbd-49f3-a64c-0535b1eaa72d" />



