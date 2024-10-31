require('dotenv').config();

const TelegramBot = require('node-telegram-bot-api');

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { 
    polling: true,
    request: {
        timeout: 30000
    }
});

// Add error handlers
bot.on('polling_error', (error) => {
    console.log('Polling error:', error);
    if (error.code === 'EFATAL') {
        console.log('Fatal polling error occurred. Attempting to reconnect...');
        
        // Stop current polling
        bot.stopPolling()
            .then(() => {
                // Wait 5 seconds before attempting to reconnect
                setTimeout(() => {
                    console.log('Attempting to restart polling...');
                    bot.startPolling()
                        .then(() => console.log('Successfully reconnected!'))
                        .catch(err => console.error('Failed to restart polling:', err));
                }, 5000);
            })
            .catch(err => console.error('Error stopping polling:', err));
    }
});

bot.on('error', (error) => {
    console.log('General bot error:', error.message);
});

// Store temporary user data
const pendingVerifications = new Map();

// Handle /start command
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, `Welcome! Your Chat ID is: ${chatId}\nPlease use this ID when registering on our website.`);
});

// Handle verification requests
function sendVerificationCode(chatId, verificationCode) {
    // Remove any '+' prefix but keep chatId as a string
    const cleanedChatId = chatId.toString().replace('+', '');
    
    // Add more robust error handling
    return bot.sendMessage(cleanedChatId, `Your verification code is: ${verificationCode}`)
        .catch(error => {
            // Log the full error object for debugging
            console.error('Failed to send verification code. Full error:', error);
            
            // Handle specific error types
            if (error.code === 'EFATAL') {
                console.error('Bot connection error - please verify your bot token and internet connection');
            }
            
            if (error.response && error.response.statusCode === 403) {
                console.error('Bot is blocked by the user or chat not found');
            }
            
            throw {
                message: 'Failed to send verification code',
                originalError: error,
                chatId: cleanedChatId
            };
        });
}

module.exports = {
    bot,
    pendingVerifications,
    sendVerificationCode
}; 