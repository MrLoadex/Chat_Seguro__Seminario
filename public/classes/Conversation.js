//Esto no esta implementado. Queda para el futuro
//De esta clase solo se usa los metodos de encriptacion
class Conversation {
    constructor() {
        this.user1Name;
        this.user2Name;
        this.messages = [];
    }

    addMessage(message) {
        this.messages.push(message);
    }

    getMessages() {
        return this.messages;
    }

    encryptMessage(key, message) {
        return CryptoJS.AES.encrypt(message, key).toString();
    }

    decryptMessage(key, encryptedMessage) {
        const bytes = CryptoJS.AES.decrypt(encryptedMessage, key);
        return bytes.toString(CryptoJS.enc.Utf8);
    }
}