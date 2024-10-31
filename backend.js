const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const session = require('express-session');
const bcrypt = require('bcrypt');
const db = require('./db/setup');
const port = 3000;
const { bot, sendVerificationCode } = require('./telegram-bot');


app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));
app.use(session({
    secret: 'THIS_IS_SECRET_SO_SHHHHH',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Change to true if using HTTPS
}));

// Registration endpoint
app.post('/register', async (req, res) => {
    const { username, password, email, phone, verificationMethod } = req.body;
    
    try {
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Generate verification code
        const verificationCode = Math.floor(100000 + Math.random() * 900000);
        
        // Store user in database
        db.run('INSERT INTO users (username, email, password, phone) VALUES (?, ?, ?, ?)',
            [username, email, hashedPassword, phone],
            async (err) => {
                if (err) {
                    return res.status(400).json({ error: 'Username or email already exists' });
                }
                
                if (verificationMethod === 'telegram') {
                    // For Telegram verification, phone should be the Telegram chat ID
                    try {
                        await sendVerificationCode(phone, verificationCode);
                        req.session.verificationCode = verificationCode;
                        req.session.pendingUsername = username;
                        res.json({ 
                            success: true, 
                            message: 'Registration successful! Please verify your Telegram account.',
                            redirect: '/auth'
                        });
                    } catch (error) {
                        console.error('Telegram error:', error);
                        res.status(400).json({ 
                            error: 'Failed to send Telegram verification code. Make sure you provided a valid Telegram chat ID.' 
                        });
                    }
                } else {
                    // Original SMS verification logic
                    const response = await fetch('https://textbelt.com/text', {
                        method: 'post',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            phone: phone,
                            message: `Your verification code is: ${verificationCode}`,
                            key: 'textbelt',
                        }),
                    });
                    
                    const data = await response.json();
                    
                    if (data.success) {
                        req.session.verificationCode = verificationCode;
                        req.session.pendingUsername = username;
                        res.json({ 
                            success: true, 
                            message: 'Registration successful! Please verify your phone number.' 
                        });
                    } else {
                        res.status(400).json({ 
                            error: 'Failed to send verification code', 
                            details: data 
                        });
                    }
                }
            });
    } catch (error) {
        console.error('Error during registration:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Verify endpoint
app.post('/verify', (req, res) => {
    const { code } = req.body;
    
    if (code === req.session.verificationCode.toString()) {
        db.run('UPDATE users SET verified = 1 WHERE username = ?',
            [req.session.pendingUsername],
            (err) => {
                if (err) {
                    return res.status(500).json({ error: 'Verification failed' });
                }
                res.json({ success: true });
            });
    } else {
        res.status(400).json({ error: 'Invalid verification code' });
    }
});

// Login endpoint
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    
    db.get('SELECT * FROM users WHERE username = ? AND verified = 1', [username], async (err, user) => {
        if (err) {
            return res.status(500).json({ error: 'Server error' });
        }
        
        if (!user) {
            return res.status(401).json({ error: 'User not found or not verified' });
        }
        
        const validPassword = await bcrypt.compare(password, user.password);
        
        if (validPassword) {
            req.session.user = username;
            res.cookie('user', username);
            res.json({ success: true });
        } else {
            res.status(401).json({ error: 'Invalid password' });
        }
    });
});

// Add route for register page
app.get('/register', (req, res) => {
    res.sendFile(__dirname + '/public/register.html');
});

// Add this route handler for the auth page
app.get('/auth', (req, res) => {
    res.sendFile(__dirname + '/public/auth.html');
});

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
  console.log(`Servidor corriendo en el puerto http://localhost:${port}`);
});
