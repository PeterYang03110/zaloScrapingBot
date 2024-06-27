"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getGroupsAndCommunitiesInfo = void 0;
const constants_1 = require("./constants");
const puppeteer_utils_1 = require("./common/puppeteer-utils");
/**
 * Get information for Group and Communities such as members, messages ...
 * @param page
 * @param groups list of Group and Communites
 * @returns
 */
const getGroupsAndCommunitiesInfo = async (page, groups) => {
    const { groupListItemSelectorById, groupListItemTitleSelectorById, mainTabItemSelector } = constants_1.selectors;
    let index = 3, groupInfoList = [];
    for (const group of groups) {
        try {
            // Get group or community title
            let title = '';
            await (0, puppeteer_utils_1.waitForSelector)(page, groupListItemTitleSelectorById(index), { timeout: 2000 }, async function (success) {
                title = await page.evaluate((success, selector) => {
                    if (success)
                        return document.querySelector(selector)?.textContent || 'No title';
                    else
                        return 'No title';
                }, success, groupListItemTitleSelectorById(index));
            });
            await (0, puppeteer_utils_1.click)(page, groupListItemSelectorById(index), {}); // Get in group
            let groupInfo = await getGroupOrCommunityInfo(page, title); // Scraping in group
            groupInfoList.push(groupInfo);
            // Get out group
            await (0, puppeteer_utils_1.click)(page, mainTabItemSelector, {});
        }
        catch (error) {
            console.log('GetGroupsInforError => ', index, error);
            continue;
        }
        index++;
    }
    console.log('groupInfo => ', groupInfoList);
    return groupInfoList;
};
exports.getGroupsAndCommunitiesInfo = getGroupsAndCommunitiesInfo;
/**
 * Identify whether it is group or community and then get information a specific group or community.
 * @param page
 */
async function getGroupOrCommunityInfo(page, title) {
    const { groupTypeSelector, groupMemberCountSelector, communityMemberCountSelector, } = constants_1.selectors;
    let info = {};
    const success = await (0, puppeteer_utils_1.waitForSelector)(page, groupTypeSelector, { timeout: 3000 }, async function (success) {
        console.log('success => ', success);
        // determine memberCountSelector whether group or community
        let memberCountSelector = success
            ? communityMemberCountSelector
            : groupMemberCountSelector;
        console.log('member count => ', memberCountSelector, await page.$(memberCountSelector));
        // Get group info
        info = await page.evaluate((success, title, memberCountSelector) => {
            let type = success ? 'Community' : 'Group';
            let memberCount = document.querySelector(memberCountSelector)?.textContent || '0';
            return {
                type,
                title,
                memberCount: parseInt(memberCount)
            };
        }, success, title, memberCountSelector);
    });
    console.log('group info => ', info);
    if (success || info)
        return info;
}
