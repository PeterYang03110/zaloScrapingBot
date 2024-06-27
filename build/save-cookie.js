"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveCookie = void 0;
const tslib_1 = require("tslib");
const fs_1 = tslib_1.__importDefault(require("fs"));
const read_cookie_1 = require("./read-cookie");
const saveCookie = async (page, worker) => {
    try {
        const cookie = await (0, read_cookie_1.readCookieInfo)();
        const workerIndex = cookie.findIndex((item, index) => {
            return item.workerName === worker;
        });
        const cookie_info = await page.evaluate((worker) => {
            const data = {};
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key?.includes("auth") || key?.includes("hash")) {
                    const value = localStorage.getItem(key);
                    data[key] = value;
                }
            }
            return Object.assign({ workerName: worker }, data);
        }, worker);
        if (workerIndex !== -1) {
            cookie[workerIndex] = cookie_info;
        }
        else {
            cookie.push(cookie_info);
        }
        fs_1.default.writeFile(`jsonDataBase/CookieData/cookies.json`, JSON.stringify(cookie, null, 4), (err) => {
            if (err) {
                return;
            }
            console.log("Cookie saved to json!");
        });
    }
    catch (ex) {
        console.log(ex);
    }
};
exports.saveCookie = saveCookie;
