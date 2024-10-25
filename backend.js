const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const session = require('express-session');
const port = 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));
app.use(session({
    secret: 'THIS_IS_SECRET_SO_SHHHHH',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Change to true if using HTTPS
}));

// List of connected users
let connectedUsers = [];
let chatKeys = {}; // Almacena las claves de chat

// Middleware to check session
const checkSession = (req, res, next) => {
  if (req.session.user) {
    next();
  } else {
    res.redirect('/login');
  }
};

app.get('/', (req, res) => {
  res.redirect('/login');
});

app.get('/login', (req, res) => {
  if (req.session.user) {
    res.redirect('/users');
  } else {
    res.sendFile(__dirname + '/public/login.html');
  }
});

app.post('/login', (req, res) => {
  const { user, password } = req.body;
  // Aquí debería verificar las credenciales contra una base de datos
  // Por ahora, simplemente aceptaremos a cualquier usuario
  if (user && password) {
    req.session.user = user;
    res.cookie('user', user);
    res.redirect('/users');
  } else {
    res.redirect('/login');
  }
});

app.get('/chat', checkSession, (req, res) => {
  res.sendFile(__dirname + '/public/chat.html');
});

app.get('/get-username', checkSession, (req, res) => {
  if (req.session.user) {
    res.json({ username: req.session.user });
  } else {
    res.status(401).json({ error: 'No authenticated user' });
  }
});

app.get('/users', checkSession, (req, res) => {
  res.sendFile(__dirname + '/public/users.html');
});

io.on('connection', (socket) => {
    
    socket.on('login', (username) => {
        console.log('Un usuario se ha conectado. hola', username);
        socket.username = username;
        connectedUsers.push(username);
        io.emit('connectedUsers', connectedUsers);
    });

    socket.on('startChat', (data) => {
        const { user1, user2 } = data; // Obtener el remitente y el destinatario
        const chatId = [user1, user2].sort().join('-'); // Crear un ID único para el chat
        if (chatKeys[chatId]) {
            socket.emit('chatKey', { key: chatKeys[chatId].key }); // Si el chat ya existe, enviar la clave existente al cliente
        } else {
            chatKeys[chatId] = { key: Math.floor(Math.random() * 100000), users: [user1, user2] }; // Si no existe, generar una clave aleatoria y almacenar los usuarios
            socket.emit('chatKey', { key: chatKeys[chatId].key }); // Enviar la clave al cliente
        }
    });

    socket.on('message', (data) => {
        // Emitir el mensaje a todos los clientes conectados
        io.emit('message', data);
    });

    socket.on('disconnect', () => {
        connectedUsers = connectedUsers.filter(user => user !== socket.username);
        io.emit('connectedUsers', connectedUsers);
    });
});

server.listen(port, () => {
  console.log(`Servidor corriendo en el puerto ${port}`);
});
