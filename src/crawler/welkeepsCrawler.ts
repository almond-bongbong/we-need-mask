import { Browser } from 'puppeteer';
import TelegramChatBot from '../lib/TelegramChatBot';
import { delay } from '../lib/utils';

const TARGET_URL = 'http://www.welkeepsmall.com/shop/shopbrandCA.html?type=X&xcode=023';

const welkeepsCrawler = (browser: Browser, chatBot: TelegramChatBot) => {
  chatBot.send('웰킵스몰 감시가 시작되었습니다.');
  console.info('Start welkeeps crawler...');

  const job = async () => {
    const page = await browser.newPage();

    try {
      await page.goto(TARGET_URL, { timeout: 3 * 60 * 1000 });

      const links = await page.$$eval('.tb-center', nodes => nodes
          .filter(node => !node.querySelector('.soldout'))
          .map(node => node.querySelector('a')?.getAttribute('href')));

      console.info('Total item count : ', links.length);

      if (links.length > 0) {
        console.info(links);

        links.forEach((link) => {
          chatBot.send(`마스크를 찾았습니다!\nhttp://www.welkeepsmall.com/${link}`);
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      await page.close();
    }
  };

  (function recur() {
    Promise.all([
      delay(5000),
      job(),
    ]).then(recur);
  })();
};

export default welkeepsCrawler;