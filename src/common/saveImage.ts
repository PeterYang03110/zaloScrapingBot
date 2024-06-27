import fs from 'fs';

export async function saveImage(browser: any, param: any, gid: any, sid: any) {
	return new Promise(async (resolve) => {
		const page = await browser.newPage();
		try {
			if (param != null) {
				let dir = `jsonDataBase/GroupAndChannelData/${gid}/media/avatars`;
				var viewSource = await page.goto(param);
				await page.waitForSelector(`img[src^='blob']`);
				if (!fs.existsSync(dir)) {
					fs.mkdirSync(dir, { recursive: true });
				}
				fs.writeFile(`${dir}/${sid}.png`, await viewSource.buffer(), function (err) {
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