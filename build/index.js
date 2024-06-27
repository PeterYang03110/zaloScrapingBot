"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const new_browser_1 = require("./new-browser");
const puppeteer_utils_1 = require("./common/puppeteer-utils");
const constants_1 = require("./constants");
const getGroupAndCommunitiesInfo_1 = require("./getGroupAndCommunitiesInfo");
async function start() {
    // Create browserInstance
    const browserInstance = await (0, new_browser_1.newBrowser)();
    const { groupListItemInfoSelector: groupListItemSelector, } = constants_1.selectors;
    if (browserInstance == false) {
        console.log('Failed to create page.');
        return;
    }
    const { browser, mainPage } = browserInstance;
    // Wait for login and then see group and communities.
    const isInitialized = await initialize(mainPage);
    if (!isInitialized)
        return;
    const groupList = await (0, puppeteer_utils_1.getListItemElements)(mainPage, groupListItemSelector, { timeout: 10000 });
    await (0, getGroupAndCommunitiesInfo_1.getGroupsAndCommunitiesInfo)(mainPage, groupList);
    console.log(groupList.length);
}
// Wait for login and see group and communities.
async function initialize(mainPage) {
    const { mainTabItemSelector, menuContactSelector, } = constants_1.selectors;
    let success = await (0, puppeteer_utils_1.click)(mainPage, mainTabItemSelector, { timeout: 10000, mandatory: true, countLimit: 10 });
    if (!success)
        return false;
    success = await (0, puppeteer_utils_1.click)(mainPage, menuContactSelector, { timeout: 500, mandatory: true });
    if (success)
        console.log("Login Success!");
    else
        console.log("Login Failed!");
    return success;
}
// const cookieInfo = await readCookieInfo();  
// const token = cookieInfo.filter((item: any) => item.name == 'zpw_sek') || [];
// console.log(token);
// await delay(3000);
// console.log("Cookie set succesfully.");
// await delay(50000);
// Wait for user to manually log in
// console.log("Please log in to Zalo...");
// await delay(50000); // Wait for 5 minutes to log in
// // After login, get cookies
// const cookies = await mainPage.cookies();
// // Save cookies to a file or use them directly
// fs.writeFileSync("zalo-cookies.json", JSON.stringify(cookies, null, 2));
// console.log("Cookies have been saved to zalo-cookies.json");
// await browser.close();
start();
