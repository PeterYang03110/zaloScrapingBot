"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.readCookieInfo = void 0;
const tslib_1 = require("tslib");
const fs_1 = tslib_1.__importDefault(require("fs"));
const readCookieInfo = async () => {
    try {
        const cookie_dir_path = `jsonDataBase/CookieData`;
        if (!fs_1.default.existsSync(cookie_dir_path)) {
            fs_1.default.mkdirSync(cookie_dir_path, { recursive: true });
            fs_1.default.writeFileSync('jsonDataBase/CookieData/cookies.json', '[]', 'utf-8');
        }
        const jsonData = fs_1.default.readFileSync('jsonDataBase/CookieData/cookies.json', 'utf-8');
        return await JSON.parse(jsonData);
    }
    catch (ex) {
        console.log(ex);
    }
};
exports.readCookieInfo = readCookieInfo;
