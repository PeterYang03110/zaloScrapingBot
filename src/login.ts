import { delay } from "./common/delay";
import { readCookieInfo } from './read-cookie';
import sharp = require("sharp");

const webHookUrl = process.env.webHookUrl ? process.env.webHookUrl : "https://webhook.site/1811711f-b5e6-45ed-b053-f50f9ef15501";
async function loginWithCookie(page: any, cookie_info: any, worker: string): Promise<void> {
	try {
		await page.evaluate((cookie_info: any) => {
			Object.keys(cookie_info).map((item) => {
				localStorage.setItem(item, cookie_info[item]);
			})
		}, cookie_info);

		await page.reload();
		try {
			const groupListSelector = ".ListItem.Chat.chat-item-clickable.group.has-ripple";
			await page.waitForSelector(groupListSelector, { timeout: 0 });
		} catch {
			await sendQrCode(page, worker);
		}
	} catch { }
}

async function sendQrCode(page: any, worker: string): Promise<void> {
	new Promise(async (resolve) => {
		const path = `jsonDataBase/CookieData/${worker}-QR-Code.png`;
		let preview_qr_code: Buffer = [] as any;
		let current_qr_code: Buffer = [] as any;
		try {
			while (true) {
				try {
					await page.waitForSelector(".qr-container svg");
					break;
				} catch { }
				await delay(1000);
			}

			await delay(500)
			console.log(`<-----------< ${worker} send QR code image >-----------> \n ${path}`)
			preview_qr_code = await getQRcode(page, path, true);
		} catch { }

		while (true) {
			try {
				await page.waitForSelector("#Main", { timeout: 1000 });
				break;
			} catch { }

			try {
				current_qr_code = await getQRcode(page, path, false);
				const result = await compareQRCodes(preview_qr_code, current_qr_code);
				if (!result) {
					console.log(`<-----------< ${worker} QR Code Changed. Please check again! >----------->`)
					await getQRcode(page, path, true);
				}

				preview_qr_code = await getQRcode(page, path, false);
			} catch (ex) {
				console.log("error: ", ex)
			}
			await delay(1000);
		}
		resolve(true);
	})
}

async function getCookieData(worker: string): Promise<{ success: boolean, cookie_info?: any }> {
	try {
		const cookie = await readCookieInfo();
		const cookie_info = cookie.find((item: any) => {
			return item.workerName === worker
		})

		if (cookie_info === undefined) {
			return { success: false }
		}
		return { success: true, cookie_info }
	} catch (ex) {
		console.log("Get Cookie Data error: ", ex)
		return { success: false };
	}
}

async function getQRcode(page: any, path: any, option: boolean) {
	let qr_code: Buffer = [] as any;
	try {
		const element = await page.$('.qr-container svg');
		const animation = await page.$('.AnimatedSticker.qr-plane.opacity-transition.slow.open.shown');
		if (animation) {
			await page.evaluate((el: any) => el.remove(), animation);
		}
		if (element) {
			const bbox = await element.boundingBox();
			if (element && option) {
				if (bbox) {
					qr_code = await page.screenshot({
						path: path,
						clip: {
							x: bbox.x,
							y: bbox.y,
							width: bbox.width,
							height: bbox.height
						}
					});

					// Set up options for the fetch request
					const options = {
						method: 'POST',
						headers: {
							'Content-Type': 'image/png' // Set content type to JSON
						},
						body: qr_code // Convert JSON data to a string and set it as the request body
					};

					await fetch(`${webHookUrl}`, options);
					console.log(`<-----------< ${webHookUrl}  * Web Hook Url Check! * >----------->`)
				}
			} else {
				if (bbox) {
					qr_code = await page.screenshot({
						clip: {
							x: bbox.x,
							y: bbox.y,
							width: bbox.width,
							height: bbox.height
						}
					});
				}
			}
		}
	} catch (ex) {
		console.log("get QR code error: ", ex);
	}
	return qr_code
}

async function compareQRCodes(qrCodeData1: Buffer, qrCodeData2: Buffer): Promise<boolean> {
	try {
		if (qrCodeData1.length > 0 && qrCodeData2.length > 0) {
			// Decode the buffer data into image pixels
			const pixels1 = await sharp(qrCodeData1).toBuffer({ resolveWithObject: true }).then((data) => data.data);
			const pixels2 = await sharp(qrCodeData2).toBuffer({ resolveWithObject: true }).then((data) => data.data);

			// Compare the pixel data
			if (pixels1.length !== pixels2.length) {
				return false;
			}

			for (let i = 0; i < pixels1.length; i++) {
				if (pixels1[i] !== pixels2[i]) {
					return false;
				}
			}

			return true;
		}
	} catch (error) {
		console.error('Error comparing QR codes:', error);
	}
	return false;
}

export const loginOrCreateQrCode = async (page: any, worker: string): Promise<void> => {
	const { success, cookie_info } = await getCookieData(worker);
	if (success) {
		await loginWithCookie(page, cookie_info, worker);
	} else {
		await sendQrCode(page, worker);
	}
}
