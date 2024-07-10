import fs from "fs"
import { GroupInfo } from "../scrapGroupList";
import { databasePath, selectors } from "../constants";
import { click, waitForSelector } from "./puppeteer-utils";
import { ElementHandle, Page } from "puppeteer";
import mediaScript from "./mediaScript";
import { delay } from "./delay";

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
				console.log('image link => ', link, path);
				var viewSource = await page.goto(link);
				
				if(option && option.blob) await page.waitForSelector(`img[src^='blob']`);
				else await page.waitForSelector(`img`);
				if (!fs.existsSync(path)) {
					fs.mkdirSync(path, { recursive: true });
				}
				const data = fs.writeFileSync(`${path}/${sid.replace('/', ' ')}.png`, await viewSource.buffer());
				console.log('data => ', data);
			}
		}
		catch (ex) { }
		console.log('Image download success');
		
		await page.close();
		resolve(true);
	});
}


export async function saveFile(page: Page, fileEle: ElementHandle<Element>, path: string, fileName: string, option?: any) {
	const {
		groupFileItemDownloadIconSelector,
		groupFileExceptionItemDownloadIconSelector,
		groupFileHoverIconSelector
	} = selectors;
	const client = await page.createCDPSession();
	client.on("Browser.downloadProgress", async function(event: any) {
		console.log('*** ', event.state, '***');
		
		if (event.state === "completed") {
			console.log('downloaded => client!');
		}
	})
	await client.send('Page.setDownloadBehavior', {
		behavior: 'allow',
		downloadPath: path,
	});

	// Click the file download button or div
	await fileEle.hover();
	await delay(2000);
	let count = (await fileEle.$$(groupFileHoverIconSelector)).length;

	if (count == 4) {
		let downloadIconEle = await fileEle.waitForSelector(groupFileExceptionItemDownloadIconSelector, {timeout: 3000})
		
		if(downloadIconEle) {
			try {
				await downloadIconEle.click();
				console.log('clicked 4');
			} catch (error) {
				console.log('clicked 4 error: ', error);
			}
		}
	} else {
		let downloadIconEle = await fileEle.waitForSelector(groupFileItemDownloadIconSelector, {timeout: 3000})

		if(downloadIconEle) {
			try {
				await downloadIconEle.click();
				console.log('clicked 4');
			} catch (error) {
				console.log('clicked 4 error: ', error);
			}
		}
	}

	await delay(1000);
	const filePath = path + '/' + fileName;
	console.log('File path => ' ,filePath);
	
	// Check if the file is downloaded
	while (!fs.existsSync(filePath)) {
		console.log('downloading...', filePath, fs.existsSync(filePath));
		await new Promise(resolve => setTimeout(resolve, 500));
	}

	await new Promise((resolve, reject) => {
		console.log('downloading...');
		
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