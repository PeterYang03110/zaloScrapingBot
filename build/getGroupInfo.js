"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getGroupInfo = getGroupInfo;
const constants_1 = require("./constants");
const puppeteer_utils_1 = require("./common/puppeteer-utils");
const delay_1 = require("./common/delay");
const media_utils_1 = require("./common/media-utils");
const _1 = require(".");
async function getGroupInfo(page, worker, title) {
    // await updateJsonFile(databasePath(title), databasePath1(title), title);
    // return false;
    const { groupTypeSelector, groupMemberCountSelector, communityMemberCountSelector, groupAvatarSelector, groupLinkSelector, groupImageSelector, } = constants_1.selectors;
    let memberCountSelector = "";
    let memberCount = '0';
    let type = '';
    let success = await (0, puppeteer_utils_1.waitForSelector)(page, groupTypeSelector, { timeout: 5000 }, async function (success) {
        // determine memberCountSelector whether group or community
        memberCountSelector = success
            ? communityMemberCountSelector
            : groupMemberCountSelector;
    });
    // Get Type
    type = success ? 'Community' : 'Group';
    // Show modal
    await (0, puppeteer_utils_1.click)(page, groupAvatarSelector, {});
    // Get Link
    await (0, puppeteer_utils_1.waitForSelector)(page, groupLinkSelector, { timeout: 3000, countLimit: 5, mandatory: true });
    await (0, puppeteer_utils_1.click)(page, groupLinkSelector, {});
    await (0, delay_1.delay)(5000);
    let groupLink = await page.evaluate((groupLinkSelector) => {
        return document.querySelector(groupLinkSelector)?.textContent || '';
    }, groupLinkSelector);
    // Get Avatar
    await (0, puppeteer_utils_1.waitForSelector)(page, groupImageSelector, {}, async function (success) {
        if (!success)
            return false;
        let link = await page.evaluate((groupImageSelector) => {
            return document.querySelector(groupImageSelector)?.getAttribute("src");
        }, groupImageSelector);
        await (0, media_utils_1.saveImage)(_1.zaloBrowser[worker], link, (0, constants_1.databasePath)(title) + '/media/cover', 'Avatar');
    });
    // Close modal
    await (0, puppeteer_utils_1.click)(page, groupAvatarSelector, {});
    // Get MemberCount
    success = await (0, puppeteer_utils_1.waitForSelector)(page, memberCountSelector, { timeout: 2000, mandatory: true }, async function (success) {
        memberCount = await page.evaluate((memberCountSelector) => {
            let memberCount = document.querySelector(memberCountSelector)?.textContent || '0';
            return memberCount;
        }, memberCountSelector);
    });
    if (!success)
        return false;
    let info = {
        type,
        name: title,
        id: groupLink,
        status: memberCount,
        allow_status: 'active',
        description: '',
        sid: '',
    };
    await (0, media_utils_1.saveJsonFile)((0, constants_1.databasePath)(title), title, info);
    return info;
}
