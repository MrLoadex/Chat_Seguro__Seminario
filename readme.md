# API Chat

## Descripción

API Chat es una aplicación web que permite a los usuarios conectarse y chatear entre sí en tiempo real. Utiliza WebSockets a través de Socket.IO para la comunicación en tiempo real y Express.js para el manejo del servidor.

## Funcionalidades

- **Registro de usuarios**: Los usuarios pueden iniciar sesión con un nombre de usuario y una contraseña.
- **Lista de usuarios conectados**: Muestra una lista de usuarios que están actualmente conectados.
- **Chat en tiempo real**: Los usuarios pueden enviar y recibir mensajes en tiempo real.
- **Cifrado de mensajes**: Los mensajes se cifran antes de ser enviados para mayor seguridad.

## Estructura del Proyecto

- `public/`: Contiene los archivos HTML, CSS y JavaScript que se sirven al cliente.
- `backend.js`: Archivo principal del servidor que maneja las conexiones y la lógica del chat.
- `classes/`: Contiene la clase `Conversation` que maneja la lógica de los mensajes y su cifrado.

## Cómo usar la aplicación

1. **Instalación**:
   - Clona el repositorio en tu máquina local.
   - Navega al directorio del proyecto y ejecuta `npm install` para instalar las dependencias.

2. **Ejecutar el servidor**:
   - Ejecuta `node backend.js` para iniciar el servidor. Por defecto, se ejecutará en el puerto 3000.

3. **Acceder a la aplicación**:
   - Abre tu navegador y ve a `http://localhost:3000/login` para acceder a la página de inicio de sesión.
   - Ingresa un nombre de usuario y una contraseña (cualquier combinación funcionará para pruebas).
   - Una vez que inicies sesión, serás redirigido a la página de usuarios conectados.

4. **Iniciar un chat**:
   - Haz clic en el nombre de un usuario en la lista para abrir una nueva ventana de chat.
   - Envía mensajes y recibe respuestas en tiempo real.

## Dependencias

- `express`: Framework para construir aplicaciones web.
- `express-session`: Middleware para manejar sesiones de usuario.
- `socket.io`: Biblioteca para la comunicación en tiempo real.
- `crypto-js`: Biblioteca para cifrado de mensajes.

## Contribuciones

Las contribuciones son bienvenidas. Si deseas mejorar la aplicación, siéntete libre de hacer un fork del repositorio y enviar un pull request.
