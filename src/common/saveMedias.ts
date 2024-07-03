import fs from 'fs';
import { Page } from 'puppeteer';
import { click } from './puppeteer-utils';

export async function saveImage(browser: any, param: any, path: string, sid: any) {
	return new Promise(async (resolve) => {
		const page = await browser.newPage();
		try {
			if (param != null) {
				var viewSource = await page.goto(param);
				await page.waitForSelector(`img[src^='blob']`);
				if (!fs.existsSync(path)) {
					fs.mkdirSync(path, { recursive: true });
				}
				fs.writeFile(`${path}/${sid}.png`, await viewSource.buffer(), function (err) {
					if (err) {
						return console.log(err);
					}
				});
			}
		}
		catch (ex) { }
		await page.close();
		resolve(true);
	});
}
