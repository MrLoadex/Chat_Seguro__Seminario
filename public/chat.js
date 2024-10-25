const socket = io();
const conversation = new Conversation();
let username = '';
let chatKey = '';

// Get the username from the server
fetch('/get-username')
  .then(response => response.json())
  .then(data => {
    username = data.username;
    console.log('Connected user:', username);
    
    // Iniciar el chat con ambos usuarios
    socket.emit('startChat', { user1: username, user2: chatUser });
  });

// Get the user to chat with
const urlParams = new URLSearchParams(window.location.search);
const chatUser = urlParams.get('user');

socket.on('chatKey', (data) => {
    chatKey = data.key.toString(); // Almacenar la clave de chat
    console.log('Clave de chat recibida:', chatKey);
});

document.getElementById('send').addEventListener('click', () => {
    const message = document.getElementById('message').value;
    if (message !== '' && chatKey) {
        // Enviar el mensaje con remitente, destinatario y mensaje
        const encryptedMessage = conversation.encryptMessage(chatKey, message);
        
        // Emitir el evento con tres parámetros
        socket.emit('message', {
            sender: username,
            recipient: chatUser,
            message: encryptedMessage
        });
        
        document.getElementById('message').value = '';
    }
});

socket.on('message', (data) => {
    console.log('Mensaje recibido:', data);
    
    /*
    ░░░░░░░░░░░░░░░░░░░░░░█████████
    ░░███████░░░░░░░░░░███▒▒▒▒▒▒▒▒███
    ░░█▒▒▒▒▒▒█░░░░░░░███▒▒▒▒▒▒▒▒▒▒▒▒▒███
    ░░░█▒▒▒▒▒▒█░░░░██▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒██
    ░░░░█▒▒▒▒▒█░░░██▒▒▒▒▒██▒▒▒▒▒▒██▒▒▒▒▒███
    ░░░░░█▒▒▒█░░░█▒▒▒▒▒▒████▒▒▒▒████▒▒▒▒▒▒██
    ░░░█████████████▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒██
    ░░░█▒▒▒▒▒▒▒▒▒▒▒▒█▒▒▒▒▒▒▒▒▒█▒▒▒▒▒▒▒▒▒▒▒██
    ░██▒▒▒▒▒▒▒▒▒▒▒▒▒█▒▒▒██▒▒▒▒▒▒▒▒▒▒██▒▒▒▒██
    ██▒▒▒███████████▒▒▒▒▒██▒▒▒▒▒▒▒▒██▒▒▒▒▒██
    █▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒█▒▒▒▒▒▒████████▒▒▒▒▒▒▒██
    ██▒▒▒▒▒▒▒▒▒▒▒▒▒▒█▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒██
    ░█▒▒▒███████████▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒██
    ░██▒▒▒▒▒▒▒▒▒▒████▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒█
    ░░████████████░░░█████████████████ 
    */
   // Se que esto deberia hacerlo el servidor, pero ...'estoy cansado jefe'... y la entrega es mañana
   // Comprobar si el mensaje es para esta conversación
    if ((data.recipient === username && data.sender === chatUser) ||data.recipient === chatUser && data.sender === username) {
        const decryptedMessage = conversation.decryptMessage(chatKey, data.message);
        
        const messages = document.getElementById('messages');
        const newMessage = document.createElement('div');
        newMessage.textContent = `${data.sender} to ${data.recipient}: ${decryptedMessage}`;
        messages.appendChild(newMessage);
    }
});