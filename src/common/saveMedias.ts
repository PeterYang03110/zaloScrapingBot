import fs from 'fs';

export async function saveImage(browser: any, param: any, path: string, sid: string) {
	return new Promise(async (resolve) => {
		const page = await browser.newPage();
		try {
			if (param != null) {
				var viewSource = await page.goto(param);
				await page.waitForSelector(`img[src^='blob']`);
				if (!fs.existsSync(path)) {
					fs.mkdirSync(path, { recursive: true });
				}
				fs.writeFile(`${path}/${sid.replace('/', '-')}.png`, await viewSource.buffer(), function (err) {
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
