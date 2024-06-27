"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getGroupsAndCommunitiesInfo = void 0;
const constants_1 = require("./constants");
const puppeteer_utils_1 = require("./common/puppeteer-utils");
const delay_1 = require("./common/delay");
/**
 * Get information for Group and Communities such as members, messages ...
 * @param page
 * @param groups list of Group and Communites
 * @returns
 */
const getGroupsAndCommunitiesInfo = async (page, groups) => {
    const { groupListItemSelectorById, mainTabItemSelector } = constants_1.selectors;
    let index = 0, groupInfo = [];
    for (const group of groups) {
        try {
            // Get in group
            await (0, delay_1.delay)(2000);
            await (0, puppeteer_utils_1.click)(page, groupListItemSelectorById(index + 1), {});
            await (0, delay_1.delay)(2000);
            // Scraping in group
            await getGroupOrCommunityInfo(page);
            // Get out group
            await (0, puppeteer_utils_1.click)(page, mainTabItemSelector, {});
        }
        catch (error) {
            console.log('GetGroupsInforError => ', index, error);
            continue;
        }
        index++;
    }
    console.log('groupInfo => ', groupInfo);
    return groupInfo;
};
exports.getGroupsAndCommunitiesInfo = getGroupsAndCommunitiesInfo;
/**
 * Identify whether it is group or community and then get information a specific group or community.
 * @param page
 */
async function getGroupOrCommunityInfo(page) {
    const { groupTypeSelector } = constants_1.selectors;
    await (0, puppeteer_utils_1.waitForSelector)(page, groupTypeSelector, {}, async function () {
        await page.evaluate((groupTypeSelector) => {
            const type = document.querySelector(groupTypeSelector)?.textContent;
            console.log("type => ", type);
        }, groupTypeSelector);
    });
}
