"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveImage = void 0;
const tslib_1 = require("tslib");
const fs_1 = tslib_1.__importDefault(require("fs"));
async function saveImage(browser, param, gid, sid) {
    return new Promise(async (resolve) => {
        const page = await browser.newPage();
        try {
            if (param != null) {
                let dir = `jsonDataBase/GroupAndChannelData/${gid}/media/avatars`;
                var viewSource = await page.goto(param);
                await page.waitForSelector(`img[src^='blob']`);
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
        await page.close();
        resolve(true);
    });
}
exports.saveImage = saveImage;
