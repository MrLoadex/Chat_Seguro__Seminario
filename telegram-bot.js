require('dotenv').config();

const TelegramBot = require('node-telegram-bot-api');

class TelegramBotManager {
    constructor() {
        this.bots = new Map();
    }

    async sendVerificationCode(botToken, chatId, verificationCode) {
        try {
            if (!botToken || !chatId) {
                throw new Error('Bot token and chat ID are required');
            }

            let bot = this.bots.get(botToken);
            
            if (!bot) {
                bot = new TelegramBot(botToken, { polling: false });
                this.bots.set(botToken, bot);
            }

            const cleanedChatId = chatId.toString().replace(/[^0-9-]/g, '');
            
            if (!cleanedChatId) {
                throw new Error('Invalid chat ID format');
            }

            console.log('Sending to chat ID:', cleanedChatId);
            return await bot.sendMessage(cleanedChatId, `Your verification code is: ${verificationCode}`);
        } catch (error) {
            console.error('Telegram error:', error);
            throw {
                message: 'Failed to send verification code',
                originalError: error,
                chatId: chatId
            };
        }
    }
}

module.exports = new TelegramBotManager(); 