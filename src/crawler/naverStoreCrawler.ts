import puppeteer from 'puppeteer';
import TelegramChatBot from '../lib/TelegramChatBot';
import NAVER_STROE, { Store } from '../contstants/naver_store';

const delay = (time: number) => new Promise((resolve) => { setTimeout(resolve, time) });

const naverStoreCrawler = async (chatBot: TelegramChatBot) => {
  chatBot.send('네이버 스토어 감시가 시작되었습니다.');
  console.info('Start naver store crawler...');

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    slowMo: 100,
  });

  const job = async (store: Store) => {
    const page = await browser.newPage();

    try {
      await page.goto(store.link, { timeout: 3 * 60 * 1000 });

      const notGoods = await page.$('.not_goods');
      if (!notGoods) {
        chatBot.send(`구매 가능한 마스크를 찾았습니다.\n${store.name}\n${store.link}`);
      }
    } catch (e) {
      console.error(e);
    } finally {
      await page.close();
    }
  };

  NAVER_STROE.forEach((store) => {
    (function recur() {
      Promise.all([
        delay(10000),
        job(store),
      ]).then(recur);
    })();
  });
};

export default naverStoreCrawler;
