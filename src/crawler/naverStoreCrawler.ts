import { Browser } from 'puppeteer';
import TelegramChatBot from '../lib/TelegramChatBot';
import NAVER_STROE, { Store } from '../contstants/naver_store';
import { delay } from '../lib/utils';

const naverStoreCrawler = async (browser: Browser, chatBot: TelegramChatBot) => {
  chatBot.send('네이버 스토어 감시가 시작되었습니다.');
  console.info('Start naver store crawler...');

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
        delay(5000),
        job(store),
      ]).then(recur);
    })();
  });
};

export default naverStoreCrawler;
