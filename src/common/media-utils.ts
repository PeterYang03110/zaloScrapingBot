import fs from "fs"
import { GroupInfo } from "../scrapGroupList";
import { databasePath } from "../constants";
import { click } from "./puppeteer-utils";
import { ElementHandle, Page } from "puppeteer";
import mediaScript from "./mediaScript";

export const getJsonFile = async (path: string, fileName: string) : Promise <any> => {
	try {
		if (!fs.existsSync(`${path}`)) {
			return false;
		} 

		let data = fs.readFileSync(`${path}/${fileName}.json`, 'utf-8');
		return JSON.parse(data);
	} catch (err) {
		return false;
	}
}

export const saveJsonFile = async (path: string, fileName: string, data: GroupInfo) : Promise<boolean> => {
    try {
		// Convert the data to a JSON string
		const oldData = await getJsonFile(path, fileName.replace('/', ' '));
		console.log('old data => ', oldData);
		
		let newData = {};
		if(oldData != false) {
			newData = {
				...oldData,
				...data
			}
		} else newData = data;

		const jsonString = JSON.stringify(newData, null, 2);
        // If not exist, create directory
        if (!fs.existsSync(path)) {
            fs.mkdirSync(path, { recursive: true });
        }
        
        // Write the JSON string to a file
        fs.writeFile(`${path}/${fileName.replace('/', ' ')}.json`, jsonString, (err) => {
            if (err) {
                console.error('Error writing file:', err);
                return;
            }
            console.log('JSON data saved to file.');
        })

		return true;
	} catch (err) { console.log(err); return false; }
}

export async function saveImage(browser: any, link: any, path: string, sid: any, option?: any) {
	
	return new Promise(async (resolve) => {
		const page = await browser.newPage();
		await page.evaluate(mediaScript);
		const client = await page.createCDPSession();
		client.on("Browser.downloadProgress", async function(event: any) {
			if (event.state === "completed") {
				console.log('downloaded => client!');
			}
		})
		await client.send('Page.setDownloadBehavior', {
			behavior: 'allow',
			downloadPath: path,
		});
		
		try {
			if (link != null) {
				console.log('image link => ', link);
				var viewSource = await page.goto(link);
				console.log('viewSource => ', await viewSource.buffer());
				
				if(option && option.blob) await page.waitForSelector(`img[src^='blob']`);
				else await page.waitForSelector(`img`);
				if (!fs.existsSync(path)) {
					fs.mkdirSync(path, { recursive: true });
				}
				const data = fs.writeFileSync(`${path}/${sid.replace('/', ' ')}.png`, await viewSource.buffer());
			}
		}
		catch (ex) { }
		console.log('Image download success');
		
		await page.close();
		resolve(true);
	});
}


export async function saveFile(page: Page, fileEle: ElementHandle<Element>, path: string, fileName: string) {
	const client = await page.createCDPSession();
	client.on("Browser.downloadProgress", async function(event: any) {
		if (event.state === "completed") {
			console.log('downloaded => client!');
		}
	})
	await client.send('Page.setDownloadBehavior', {
		behavior: 'allow',
		downloadPath: path
	});

	// Click the file download button or div
	await fileEle.click();
	const filePath = path + '/' + fileName.replace('/', ' ');
	
	// Check if the file is downloaded
	await new Promise((resolve, reject) => {
		const checkFile = setInterval(() => {
			if (fs.existsSync(filePath)) {
				clearInterval(checkFile);
				resolve(true);
			}
		}, 100);
	}).catch(err => {
		return err;
	});

  console.log(`File downloaded to: ${filePath}`);
}