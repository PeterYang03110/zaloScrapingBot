"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveJsonFile = exports.getJsonFile = void 0;
exports.saveImage = saveImage;
exports.saveFile = saveFile;
const tslib_1 = require("tslib");
const fs_1 = tslib_1.__importDefault(require("fs"));
const constants_1 = require("../constants");
const mediaScript_1 = tslib_1.__importDefault(require("./mediaScript"));
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
        console.log('old data => ', oldData);
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
        if (event.state === "completed") {
            console.log('downloaded => client!');
        }
    });
    await client.send('Page.setDownloadBehavior', {
        behavior: 'allow',
        downloadPath: path
    });
    // Click the file download button or div
    await fileEle.hover();
    let count = (await fileEle.$$(groupFileHoverIconSelector)).length;
    console.log('count => ', count);
    if (count == 4) {
        let success = await fileEle.waitForSelector(groupFileExceptionItemDownloadIconSelector, { timeout: 3000 });
        console.log(success);
        if (success == null)
            return;
        let downloadIconEle = await fileEle.$(groupFileExceptionItemDownloadIconSelector);
        if (downloadIconEle)
            await downloadIconEle.click();
        // await click(page, groupFileExceptionItemDownloadIconSelector, {timeout: 2000, mandatory: true})
    }
    else {
        let success = await fileEle.waitForSelector(groupFileItemDownloadIconSelector, { timeout: 3000 });
        console.log(success);
        if (success == null)
            return;
        let downloadIconEle = await fileEle.$(groupFileItemDownloadIconSelector);
        if (downloadIconEle)
            await downloadIconEle.click();
    }
    const filePath = path + '/' + fileName.replace('/', ' ');
    // Check if the file is downloaded
    await new Promise((resolve, reject) => {
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
