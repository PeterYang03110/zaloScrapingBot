"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveJsonFile = exports.getJsonFile = void 0;
exports.saveImage = saveImage;
exports.saveFile = saveFile;
const tslib_1 = require("tslib");
const fs_1 = tslib_1.__importDefault(require("fs"));
const constants_1 = require("../constants");
const mediaScript_1 = tslib_1.__importDefault(require("./mediaScript"));
const delay_1 = require("./delay");
const getJsonFile = async (path, fileName) => {
    try {
        if (!fs_1.default.existsSync(`${path}`)) {
            return false;
        }
        let data = fs_1.default.readFileSync(`${path}/${fileName}.json`, 'utf-8');
        return JSON.parse(data);
    }
    catch (err) {
        return false;
    }
};
exports.getJsonFile = getJsonFile;
const saveJsonFile = async (path, fileName, data) => {
    try {
        // Convert the data to a JSON string
        const oldData = await (0, exports.getJsonFile)(path, fileName.replace('/', ' '));
        let newData = {};
        if (oldData != false) {
            newData = {
                ...oldData,
                ...data
            };
        }
        else
            newData = data;
        const jsonString = JSON.stringify(newData, null, 2);
        // If not exist, create directory
        if (!fs_1.default.existsSync(path)) {
            fs_1.default.mkdirSync(path, { recursive: true });
        }
        // Write the JSON string to a file
        fs_1.default.writeFile(`${path}/${fileName.replace('/', ' ')}.json`, jsonString, (err) => {
            if (err) {
                console.error('Error writing file:', err);
                return;
            }
            console.log('JSON data saved to file.');
        });
        return true;
    }
    catch (err) {
        console.log(err);
        return false;
    }
};
exports.saveJsonFile = saveJsonFile;
async function saveImage(browser, link, path, sid, option) {
    return new Promise(async (resolve) => {
        const page = await browser.newPage();
        await page.evaluate(mediaScript_1.default);
        const client = await page.createCDPSession();
        client.on("Browser.downloadProgress", async function (event) {
            if (event.state === "completed") {
                console.log('downloaded => client!');
            }
        });
        await client.send('Page.setDownloadBehavior', {
            behavior: 'allow',
            downloadPath: path,
        });
        try {
            if (link != null) {
                console.log('image link => ', link, path);
                var viewSource = await page.goto(link);
                if (option && option.blob)
                    await page.waitForSelector(`img[src^='blob']`);
                else
                    await page.waitForSelector(`img`);
                if (!fs_1.default.existsSync(path)) {
                    fs_1.default.mkdirSync(path, { recursive: true });
                }
                const data = fs_1.default.writeFileSync(`${path}/${sid.replace('/', ' ')}.png`, await viewSource.buffer());
                console.log('data => ', data);
            }
        }
        catch (ex) { }
        console.log('Image download success');
        await page.close();
        resolve(true);
    });
}
async function saveFile(page, fileEle, path, fileName, option) {
    const { groupFileItemDownloadIconSelector, groupFileExceptionItemDownloadIconSelector, groupFileHoverIconSelector } = constants_1.selectors;
    const client = await page.createCDPSession();
    client.on("Browser.downloadProgress", async function (event) {
        console.log('*** ', event.state, '***');
        if (event.state === "completed") {
            console.log('downloaded => client!');
        }
    });
    await client.send('Page.setDownloadBehavior', {
        behavior: 'allow',
        downloadPath: path,
    });
    // Click the file download button or div
    await fileEle.hover();
    await (0, delay_1.delay)(2000);
    let count = (await fileEle.$$(groupFileHoverIconSelector)).length;
    console.log('count => ', count);
    // await fileEle.click();
    // await delay(2000);
    if (count == 4) {
        let downloadIconEle = await fileEle.waitForSelector(groupFileExceptionItemDownloadIconSelector, { timeout: 3000 });
        // if (downloadIconEle == null) return;
        // 	let downloadIconEle = await fileEle.$(groupFileExceptionItemDownloadIconSelector);
        // 	console.log('', downloadIconEle);
        if (downloadIconEle) {
            try {
                await downloadIconEle.click();
                console.log('clicked 4');
            }
            catch (error) {
                console.log('clicked 4 error: ', error);
            }
        }
        // 	// await click(page, groupFileExceptionItemDownloadIconSelector, {timeout: 2000, mandatory: true})
    }
    else {
        let downloadIconEle = await fileEle.waitForSelector(groupFileItemDownloadIconSelector, { timeout: 3000 });
        // console.log(success);
        // if (success == null) return;
        // 	let downloadIconEle = await fileEle.$(groupFileItemDownloadIconSelector);
        if (downloadIconEle) {
            try {
                await downloadIconEle.click();
                console.log('clicked 4');
            }
            catch (error) {
                console.log('clicked 4 error: ', error);
            }
        }
    }
    await (0, delay_1.delay)(1000);
    const filePath = path + '/' + fileName;
    console.log('File path => ', filePath);
    // Check if the file is downloaded
    while (!fs_1.default.existsSync(filePath)) {
        console.log('downloading...', filePath, fs_1.default.existsSync(filePath));
        await new Promise(resolve => setTimeout(resolve, 500));
    }
    await new Promise((resolve, reject) => {
        console.log('downloading...');
        const checkFile = setInterval(() => {
            if (fs_1.default.existsSync(filePath)) {
                clearInterval(checkFile);
                resolve(true);
            }
        }, 100);
    }).catch(err => {
        return err;
    });
    console.log(`File downloaded to: ${filePath}`);
}
