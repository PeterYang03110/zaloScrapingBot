import puppeteer from 'puppeteer-extra';
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import {Page, Browser} from 'puppeteer'
import { delay } from './common/delay';
import path from 'path';

puppeteer.use(StealthPlugin());

export const newBrowser = async (): Promise<{browser: Browser, mainPage: Page} | false> => {
	try {
		console.log('Creating new page...');

		const browser = await puppeteer.launch({
			headless: false,
			ignoreDefaultArgs: ['--disable-extensions'],
			args: [
				'--no-sandbox',
				'--disable-setuid-sandbox',
				'--disable-gpu',
				'--disable-dev-shm-usage',
				'--disable-setuid-sandbox',
				'--no-first-run',
				'--no-zygote',
				// '--single-process',
				'--disable-features=site-per-process',
				'--disable-accelerated-2d-canvas',
			],
		});
		const mainPage = (await browser.pages())[0];

		await mainPage.evaluate(() => {
			Object.defineProperty(navigator, 'webdriver', { get: () => false });
		});

		await mainPage.setUserAgent('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36');

		// Set the viewport size
		await mainPage.setViewport({
			width: 1600,
			height: 900
		});

		mainPage.setDefaultTimeout(0);
		console.log("Waiting for login, please login with camera");
		
		await mainPage.goto("https://chat.zalo.me/", {
			waitUntil: "networkidle0"
		});
		
		return { browser, mainPage }
	} catch (err) {
		console.log("err => ", err);
		return false;
	}
}