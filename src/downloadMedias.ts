import { Page } from "puppeteer";
import { click, waitForSelector } from "./common/puppeteer-utils";
import { databasePath, selectors } from "./constants";
import { WorkerType, zaloBrowser } from ".";
import fs from 'fs'
import mediaScript from "./common/mediaScript";
import { delay } from "./common/delay";
import { saveFile, saveImage, saveJsonFile } from "./common/media-utils";
import { downloadFileListFlag } from ".";

let tempDownloadFileListFlag : Array<any> = downloadFileListFlag;

export async function downloadMedias(page: Page, worker: WorkerType, title: string, type: string, saveCallback?: Function) {
    tempDownloadFileListFlag = downloadFileListFlag || [];
    const {
        groupMemberCountSelector,
        communityMemberCountSelector,
        groupMemberCountBackSelector,
        groupMediaViewAllButtonSelector,
        groupFileViewAllButtonSelector,
        groupLinkViewAllButtonSelector
    } = selectors;

    let memberCountSelector = type == "Group" ? groupMemberCountSelector : communityMemberCountSelector;
    await click(page, memberCountSelector, {mandatory: true, timeout: 2000, countLimit: 3});
    await click(page, groupMemberCountBackSelector, {mandatory: true, timeout: 2000, countLimit: 3});
    // Determin whether Medias, Files, Links are exist or not 
    let startIndex = 3;
    if(await click(page, groupMediaViewAllButtonSelector, {timeout: 1500})) {
        startIndex = 0;
    } else if (await click(page, groupFileViewAllButtonSelector, {timeout: 1000})) {
        startIndex = 1;
    } else if (await click(page, groupLinkViewAllButtonSelector, {timeout: 1000})) {
        startIndex = 2;
    }
    console.log('startIndex => ', startIndex);

    for (let i = startIndex; i < 3; i ++) {
        switch (i) {
            case 0:
                await downloadPicturesAndVideos(page, worker, databasePath(title) + 'media/images', type);
                break;
            case 1:
                await downloadFiles(page, databasePath(title) + 'media/files');
                break;
            case 2: 
                await downloadLinks(page, databasePath(title), title);
                break;
            default:
                break;
        }
    }        
    if (saveCallback) {
        saveCallback(tempDownloadFileListFlag);
    }
}


export async function downloadPicturesAndVideos(page: Page, worker: WorkerType, path: string, type: string, saveCallback?: Function) {
    console.log('downloading images...');
    
    const {
        groupPhotoesItemSelector,
        groupVideosItemSelector
    } = selectors;

    if (!fs.existsSync(path)) {
        fs.mkdirSync(path, { recursive: true });
    }

    const downloads = new Map();
    let downloadResolvers = new Set();

    await page.evaluate(mediaScript);
    const client = await page.createCDPSession();

    client.on("Browser.downloadProgress", async function(event: any) {
        console.log('downloading... ', event.state);
        
        if (event.state === "completed") {
            console.log('downloaded => client!');
        }
    })

    client.on('Browser.downloadWillBegin', (event: any) => {
        if (downloadResolvers.size > 0) {
            downloads.set(event.guid, {
                resolvers: downloadResolvers,
                filename: event.suggestedFilename,
            });
            downloadResolvers = new Set();
        }
    });

    await delay(2000);
    // Get Image list
    await waitForSelector(page, groupPhotoesItemSelector, {});
    
    let links = await page.evaluate((groupPhotoesItemSelector, groupVideosItemSelector) => {
        let imgElements = document.querySelectorAll(groupPhotoesItemSelector);
        let links: any[] = [];
        imgElements.forEach((imgElement, key) => {
            if(imgElement.getAttribute("src")) links.push(imgElement.getAttribute("src")?.toString());
        })
        let videoElements = document.querySelectorAll(groupVideosItemSelector);
        videoElements.forEach((imgElement, key) => {
            if(imgElement.getAttribute("src")) links.push(imgElement.getAttribute("src")?.toString());
        })
        
        return links;
    }, groupPhotoesItemSelector, groupVideosItemSelector);
    
    for (let i  = 0; i < links.length; i ++) {
        let imageFilename = Date.now().toString();
        if(links[i] == null) continue;

    	const filePath = path + '/' + links[i];
        if (tempDownloadFileListFlag.filter(item => item == links[i]).length) continue;
        
        if (type == "Group") await saveImage(zaloBrowser[worker], links[i], path, imageFilename, {blob: true});
        else await saveImage(zaloBrowser[worker], links[i], path, imageFilename);
        tempDownloadFileListFlag.push(links[i]);
    }
}

export async function downloadFiles(page: Page, path: string) {
    console.log('download files...');
    
    const {
        groupFilesTabSelector,
        groupFileItemSelector, //define it
        groupFileItemNameSelector,
    } = selectors;

    let success = await click(page, groupFilesTabSelector, {});
    if (!success) return null;

    await waitForSelector(page, groupFileItemSelector, {});
    let fileElementList = await page.$$(groupFileItemSelector);
    for(let i = 0; i < fileElementList.length; i ++) {
        let fileNameEle = await fileElementList[i].$(groupFileItemNameSelector);
        if (!fileNameEle) continue;

        let fileName = await page.evaluate((fileNameEle) => {
            return fileNameEle.textContent
        }, fileNameEle);

        let isFile = await page.evaluate((fileEle) => {
            return fileEle.id.startsWith('item')
        }, fileElementList[i])
        if (!isFile) continue;

    	const filePath = path + '/' + (fileName || i.toString()).replace('/', ' ');
        if (tempDownloadFileListFlag.filter(item => item == filePath).length) continue;
        await saveFile(page, fileElementList[i], path, fileName || i.toString(), {exception: true});
        tempDownloadFileListFlag.push(filePath);
        console.log('File download success!');
    }
}

export async function downloadLinks(page: Page, path: string, title: string) {
    console.log('get links...');
    
    const {
        groupLinksTabSelector,
        groupLinkItemSelector,
        groupLinkItemTextSelector,
    } = selectors;

    let success = await click(page, groupLinksTabSelector, {});
    if (!success) return null;

    // File search
    // success = await waitForSelector(page, groupFileViewAllButtonSelector, {timeout: 5000});
    // if (!success) return null;

    // let fileViewButtonEle = await page.$(groupFileViewAllButtonSelector);
    // if(!fileViewButtonEle) return null;

    // await fileViewButtonEle.click();
    await waitForSelector(page, groupLinkItemSelector, {});
    let linkElementList = await page.$$(groupLinkItemSelector);

    console.log('link count => ', linkElementList.length);
    
    let links = [];

    for(let i = 0; i < linkElementList.length; i ++) {
        let isLink = await page.evaluate((linkEle) => {
            return linkEle.id.startsWith('item')
        }, linkElementList[i])
        if (!isLink) continue;

        let linkEle = await linkElementList[i].$(groupLinkItemTextSelector)
        if (!linkEle) continue;

        let link = await page.evaluate((linkEle) => {
            return  linkEle.textContent
        }, linkEle)
        links.push(link);
    }

    await saveJsonFile(path, title, {
        name: title,
        links
    })
}
