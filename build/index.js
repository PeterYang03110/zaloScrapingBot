"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.groupListInfo = exports.flag = exports.zaloBrowser = exports.downloadFileListFlag = void 0;
const delay_1 = require("./common/delay");
const new_browser_1 = require("./new-browser");
const constants_1 = require("./constants");
const scrapGroupList_1 = require("./scrapGroupList");
const worker_1 = require("./worker");
const init_1 = require("./init");
exports.downloadFileListFlag = [];
exports.zaloBrowser = {};
exports.flag = {};
exports.groupListInfo = [];
let workers = [
    // 'groupInfo',
    'member',
    // 'media',
    // 'message',
];
(0, worker_1.runParallelScrapers)(workers, workers.length, function (worker) {
    switch (worker) {
        case 'groupInfo':
            start(worker, {
                groupInfo: true
            });
            break;
        case 'member':
            start(worker, {
                member: true
            });
            break;
        case 'media':
            start(worker, {
                media: true
            });
            break;
        case 'message':
            start(worker, {
                message: true
            });
        default:
            break;
    }
});
async function start(worker, option) {
    // Create browserInstance
    console.log('worker console => ', worker);
    const browserInstance = await (0, new_browser_1.newBrowser)();
    const { groupListItemSelector, } = constants_1.selectors;
    if (browserInstance == false) {
        console.log('Failed to create page.');
        return;
    }
    const { mainPage, browser } = browserInstance;
    exports.zaloBrowser[worker] = browser;
    // Wait for login and then see group and communities.
    const isInitialized = await (0, init_1.initialize)(mainPage);
    if (!isInitialized)
        return;
    await (0, init_1.setLanguage)(mainPage, "English");
    await (0, delay_1.delay)(1000);
    console.log('worker => ', worker);
    if (option.message || option.media) {
        while (true) {
            // const groupList = await getListItemElements(mainPage, groupListItemSelector, {timeout: 10000});
            exports.groupListInfo = await (0, scrapGroupList_1.scrapGroupList)(mainPage, worker, option, function (data) {
                exports.downloadFileListFlag = data;
                console.log('download file list => ', exports.downloadFileListFlag);
            });
            // Wait for 1 min.
            await (0, delay_1.delay)(10000);
            console.log('search again');
        }
    }
    else {
        // const groupList = await getListItemElements(mainPage, groupListItemSelector, {timeout: 10000});
        exports.groupListInfo = await (0, scrapGroupList_1.scrapGroupList)(mainPage, worker, option);
    }
}
