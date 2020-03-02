import dotenv from 'dotenv';
dotenv.config();
import puppeteer from 'puppeteer';
import TelegramChatBot from './lib/TelegramChatBot';
import naverStoreCrawler from './crawler/naverStoreCrawler';
import welkeepsCrawler from './crawler/welkeepsCrawler';

const maskRoom: TelegramChatBot = new TelegramChatBot(-1001316847681);

(async () => {
  console.log('Now environment variable NODE_ENV = ', process.env.NODE_ENV);

  const browser = await puppeteer.launch({
    headless: process.env.NODE_ENV === 'production',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    slowMo: 100,
  });

  naverStoreCrawler(browser, maskRoom);
  welkeepsCrawler(browser, maskRoom);
})();
