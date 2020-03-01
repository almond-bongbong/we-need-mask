import dotenv from 'dotenv';
dotenv.config();
import TelegramChatBot from './lib/TelegramChatBot';
import naverStoreCrawler from './crawler/naverStoreCrawler';

const maskRoom: TelegramChatBot = new TelegramChatBot(-1001316847681);

naverStoreCrawler(maskRoom);
