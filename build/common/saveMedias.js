"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveImage = void 0;
const tslib_1 = require("tslib");
const fs_1 = tslib_1.__importDefault(require("fs"));
async function saveImage(browser, param, path, sid) {
    return new Promise(async (resolve) => {
        const page = await browser.newPage();
        try {
            if (param != null) {
                var viewSource = await page.goto(param);
                await page.waitForSelector(`img[src^='blob']`);
                if (!fs_1.default.existsSync(path)) {
                    fs_1.default.mkdirSync(path, { recursive: true });
                }
                fs_1.default.writeFile(`${path}/${sid}.png`, await viewSource.buffer(), function (err) {
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
exports.saveImage = saveImage;
