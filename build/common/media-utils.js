"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveFile = exports.saveImage = exports.saveJsonFile = void 0;
const tslib_1 = require("tslib");
const fs_1 = tslib_1.__importDefault(require("fs"));
const constants_1 = require("../constants");
const puppeteer_utils_1 = require("./puppeteer-utils");
const saveJsonFile = async (path, filename, data) => {
    try {
        // Convert the data to a JSON string
        const jsonString = JSON.stringify(data, null, 2);
        // If not exist, create directory
        if (!fs_1.default.existsSync(path)) {
            fs_1.default.mkdirSync(path, { recursive: true });
        }
        // Write the JSON string to a file
        fs_1.default.writeFile(`${path}/${filename}.json`, jsonString, (err) => {
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
async function saveImage(browser, link, gid, sid) {
    return new Promise(async (resolve) => {
        const page = await browser.newPage();
        try {
            if (link != null) {
                let dir = (0, constants_1.databasePath)(gid) + '/avatars';
                var viewSource = await page.goto(link);
                console.log('viewSource => ', await viewSource.buffer());
                await page.waitForSelector(`img`);
                if (!fs_1.default.existsSync(dir)) {
                    fs_1.default.mkdirSync(dir, { recursive: true });
                }
                fs_1.default.writeFile(`${dir}/${sid}.png`, await viewSource.buffer(), function (err) {
                    if (err) {
                        return console.log(err);
                    }
                });
            }
        }
        catch (ex) { }
        console.log('Image download success');
        await page.close();
        resolve(true);
    });
}
exports.saveImage = saveImage;
async function saveFile(page, selector, path, fileName) {
    const client = await page.createCDPSession();
    await client.send('Page.setDownloadBehavior', {
        behavior: 'allow',
        downloadPath: path
    });
    // Navigate to the page with the file download button or div
    // Click the file download button or div
    await (0, puppeteer_utils_1.click)(page, selector, {});
    // Wait for the file download to complete
    // Note: Puppeteer does not have direct support for download events; we need to wait for the download file to appear in the folder
    const filePath = path + '/' + fileName;
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
exports.saveFile = saveFile;
