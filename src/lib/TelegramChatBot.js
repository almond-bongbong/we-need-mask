process.env.NTBA_FIX_319 = 1;

const TelegramBot = require('node-telegram-bot-api');
const token = process.env.TELEGRAM_KEY;
const bot = new TelegramBot(token, { polling: true });

function TelegramChatBot(chatId) {
  this.chatId = chatId;

  bot.onText(/\/chatId/, (msg) => {
    const chatId = msg.chat.id;
    if (this.chatId === chatId) bot.sendMessage(chatId, `this chat id is '${chatId}'`);
  });

  bot.onText(/\/echo (.+)/, (msg, match) => {
    const chatId = msg.chat.id;
    const resp = match[1];

    bot.sendMessage(chatId, resp);
  });

  bot.on('message', (msg) => {
    const chatId = msg.chat.id;
  });

  this.addOnText = (match, callback) => {
    bot.onText(match, callback);
  };

  this.send = (msg) => {
    bot.sendMessage(this.chatId, msg, { parse_mode: 'HTML' });
  };

  this.sendPhoto = (url) => {
    bot.sendPhoto(this.chatId, url);
  };

  this.getToken = () => {
    return token;
  };

  this.getChatId = () => {
    return chatId;
  };

  this.setChatId = (cId) => {
    chatId = cId;
  };
}

// const telegramBot = chatId => new TelegramChatBot(chatId);
export default TelegramChatBot;
