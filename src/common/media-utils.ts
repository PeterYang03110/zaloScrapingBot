import fs from "fs"
import moment from 'moment'
import * as fsExtra from "fs-extra"
import { GroupInfo } from "../scrapGroupList";
import { databasePath, selectors } from "../constants";
import { click, waitForSelector } from "./puppeteer-utils";
import { ElementHandle, Page } from "puppeteer";
import mediaScript from "./mediaScript";
import { delay } from "./delay";
import { convertStringToDateTime } from "./calcDate";

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

export const updateJsonFile = async (path: string, path1: string, fileName: string) : Promise<void> => {
	const oldData = await getJsonFile(path1, fileName.replace('/', ' '));
	const newData = await getJsonFile(path, fileName.replace('/', ' '));

	if (oldData.contents && oldData.contents.length) {
		newData.content = oldData.contents.map((content: any) => {
			let _content = content.subContext
				? {
					context: content.context || '',
					postDate: content.date,
					AuthorName: content.author,
					AuthorId: '',
					subContext: content.subContext,
					reactions: {
						count: 0,
						users: []
					},
					post: {
						images: []
					}
				}
				: {
					context: content.context || '',
					postDate: content.date,
					AuthorName: content.author,
					AuthorId: '',
					subContext: "",
					reactions: {
						count: 0,
						users: []
					},
					post: {
						images: []
					}
				}

			console.log(_content);
			
			return _content
		})
		delete newData.contents
	}
	let now = moment();
	newData.updateDate = now.toString();
	try {
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

		return;
	} catch (error) {
		console.log(error);
	}
}

export const saveJsonFile = async (path: string, fileName: string, data: GroupInfo, option?: any) : Promise<boolean> => {
    try {
		// Convert the data to a JSON string
		const oldData = await getJsonFile(path, fileName.replace('/', ' '));
		
		let newData = data;
		if(oldData != false) {			
			if(oldData.content && oldData.content.length) {
				let lastDate = convertStringToDateTime(oldData.content[0].postDate);
				
				let newContent = newData.content?.filter(content => {					
					return convertStringToDateTime(content.date) > lastDate
				})
				console.log('new content => ', newContent);
				
				newData.content = [...(newContent || []), ...oldData.content]
			}
			let links = oldData.links || [];
			if(oldData.links && oldData.links.length && newData.links) {
				let newDataLinksLength = newData.links.length;
				for (let i = 0; i < newDataLinksLength; i ++) {
					let newDataLink = newData.links[i];
					if (oldData.links.filter((link: any) => link == newDataLink).length) continue;
					links.push(newDataLink);
				}
			}
			newData.links = links;

			newData = {
				...oldData,
				...newData
			}
		} else newData = data;
		newData.updateDate = moment().toString()

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
	
	if (!fs.existsSync(path)) {
		fs.mkdirSync(path, { recursive: true });
	}

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
	const filePath = path + '/' + fileName.replaceAll(' ', ' ').trim();
	
	// Check if the file is downloaded
	while (true) {
		if(isExistFile(path, fileName)) {
			if (fileName.endsWith('.js') || fileName.endsWith('.ts')) {
				fsExtra.rename(filePath, filePath + 'BK', function(err) {
					if (err) throw err;
					console.log('file renamed!');					
				})
			}
			break;
		} else {
			await new Promise(resolve => setTimeout(resolve, 500));
			console.log('downloading...', filePath, isExistFile(path, fileName) );
		}
	}

  	console.log(`File downloaded to: ${filePath}`);
}

function isExistFile(path: string, fileName: string) {
	const files = fs.readdirSync(path);
	
    const downloadedFile = files.filter((file) => {
		return file.trim() == fileName.replaceAll(' ', ' ').trim()
	}); // Adjust the condition

	if (downloadedFile.length) return true;
	return false;
}