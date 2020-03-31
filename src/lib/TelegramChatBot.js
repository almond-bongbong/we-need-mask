process.env.NTBA_FIX_319 = 1;

const TelegramBot = require('node-telegram-bot-api');
const token = process.env.TELEGRAM_KEY;

class TelegramChatBot {
  constructor(chatId) {
    this.chatId = chatId;
    this.bot = new TelegramBot(token, { polling: true });

    this.bot.onText(/\/chatId/, (msg) => {
      const chatId = msg.chat.id;
      if (this.chatId === chatId) this.bot.sendMessage(chatId, `this chat id is '${chatId}'`);
    });

    this.bot.onText(/\/echo (.+)/, (msg, match) => {
      const chatId = msg.chat.id;
      const resp = match[1];

      this.bot.sendMessage(chatId, resp);
    });

    this.bot.on('message', (msg) => {
      const chatId = msg.chat.id;
    });
  }

  addOnText = (match, callback) => {
    this.bot.onText(match, callback);
  };

  send = (msg) => {
    this.bot.sendMessage(this.chatId, msg, { parse_mode: 'HTML' });
  };

  sendPhoto = (url) => {
    this.bot.sendPhoto(this.chatId, url);
  };

  getToken = () => {
    return token;
  };

  getChatId = () => {
    return this.chatId;
  };

  setChatId = (cId) => {
    this.chatId = cId;
  };
}

// const telegramBot = chatId => new TelegramChatBot(chatId);
export default TelegramChatBot;
