"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMemberInfo = exports.getMemberListInfo = exports.downloadPicturesAndVideos = exports.getGroupsAndCommunitiesInfo = void 0;
const constants_1 = require("./constants");
const puppeteer_utils_1 = require("./common/puppeteer-utils");
const delay_1 = require("./common/delay");
const media_utils_1 = require("./common/media-utils");
/**
 * Get information list for Groups and Communities such as members, messages ...
 * @param page
 * @param groups list of Groups and Communites
 * @returns groupInfoList
 */
const getGroupsAndCommunitiesInfo = async (page, groups) => {
    const { groupListItemSelectorById, groupListItemTitleSelectorById, mainTabItemSelector } = constants_1.selectors;
    // first two items are not group or community.
    let index = 3, groupInfoList = [];
    for (const group of groups) {
        try {
            // Get group or community title
            let title = '';
            await (0, puppeteer_utils_1.waitForSelector)(page, groupListItemTitleSelectorById(index), { timeout: 2000, mandatory: true }, async function (success) {
                title = await page.evaluate((success, selector) => {
                    if (success)
                        return document.querySelector(selector)?.textContent || 'No title';
                    else
                        return 'No title';
                }, success, groupListItemTitleSelectorById(index));
            });
            console.log('---------------- Group title => ', index, title, '-----------------------');
            await (0, puppeteer_utils_1.click)(page, groupListItemSelectorById(index), {}); // Get in group
            let groupInfo = await getGroupOrCommunityInfo(page, title); // Scraping in group
            await (0, delay_1.delay)(1000);
            let success = await (0, puppeteer_utils_1.click)(page, mainTabItemSelector, { mandatory: true, timeout: 3000 }); // Get out group
            // If scraping failed, it will return boolean value
            if (typeof groupInfo == 'boolean')
                continue;
            // Save data
            await (0, media_utils_1.saveJsonFile)((0, constants_1.databasePath)(groupInfo.name), groupInfo.name, groupInfo)
                ? groupInfoList.push(groupInfo)
                : null;
        }
        catch (error) {
            console.log('GetGroupsInforError => ', index, error);
            continue;
        }
        index++;
    }
    return groupInfoList;
};
exports.getGroupsAndCommunitiesInfo = getGroupsAndCommunitiesInfo;
/**
 * Identify whether it is group or community and then get information a specific group or community.
 * @param page
 * @param title group's title. It is difficult to get from here, so get it from outside.
 * @returns groupInfo
 */
async function getGroupOrCommunityInfo(page, title) {
    const { groupTypeSelector, groupMemberCountSelector, communityMemberCountSelector, groupAvatarSelector, groupLinkSelector, groupInfoToggleButtonSelector, groupMediaViewAllButtonSelector, } = constants_1.selectors;
    let info;
    let memberCountSelector = "";
    let memberCount = '0';
    let type = '';
    let memberList;
    // Get memberCountSelector
    let success = await (0, puppeteer_utils_1.waitForSelector)(page, groupTypeSelector, { timeout: 5000 }, async function (success) {
        // determine memberCountSelector whether group or community
        memberCountSelector = success
            ? communityMemberCountSelector
            : groupMemberCountSelector;
    });
    // Get Type
    type = success ? 'Community' : 'Group';
    // Get memberCount
    success = await (0, puppeteer_utils_1.waitForSelector)(page, memberCountSelector, { timeout: 2000, mandatory: true }, async function (success) {
        memberCount = await page.evaluate((memberCountSelector) => {
            let memberCount = document.querySelector(memberCountSelector)?.textContent || '0';
            return memberCount;
        }, memberCountSelector);
    });
    if (!success)
        return false;
    // Get link
    await (0, puppeteer_utils_1.click)(page, groupAvatarSelector, {});
    await (0, puppeteer_utils_1.waitForSelector)(page, groupLinkSelector, {});
    await (0, delay_1.delay)(2000);
    let groupLink = await page.evaluate((groupLinkSelector) => {
        return document.querySelector(groupLinkSelector)?.textContent || '';
    }, groupLinkSelector);
    await (0, puppeteer_utils_1.click)(page, groupAvatarSelector, {});
    console.log('link => ', groupLink);
    // Get Medias
    await (0, puppeteer_utils_1.click)(page, groupInfoToggleButtonSelector, { mandatory: true, timeout: 2000, countLimit: 3 });
    success = await (0, puppeteer_utils_1.waitForSelector)(page, groupMediaViewAllButtonSelector, {});
    if (success) {
        await (0, puppeteer_utils_1.click)(page, groupMediaViewAllButtonSelector, {});
        await downloadPicturesAndVideos(page);
        // await downloadFilesAndVideos(page);
        // await saveLinks(page);
    }
    // Get MemberList
    memberList = await getMemberListInfo(page, type, memberCountSelector);
    if (typeof memberList == "boolean")
        return false;
    console.log('memberList => ', memberList.length, memberList);
    info = {
        memberCount: parseInt(memberCount),
        name: title,
        members: memberList,
        link: groupLink,
        type,
    };
    return info;
}
async function downloadPicturesAndVideos(page) {
    const { groupPhotoesAndVideosTabSelector, groupPhotoesAndVideoPreviewItemSelector, groupPhotoesAndVideoDownloadButtonSelector, } = constants_1.selectors;
    let success = await (0, puppeteer_utils_1.click)(page, groupPhotoesAndVideosTabSelector, {});
    if (!success)
        return null;
    success = await (0, puppeteer_utils_1.waitForSelector)(page, groupPhotoesAndVideoPreviewItemSelector, {});
    if (!success)
        return null;
    const photoEle = await page.$(groupPhotoesAndVideoPreviewItemSelector);
    if (photoEle)
        await photoEle.click();
    else
        return null;
    success = await (0, puppeteer_utils_1.waitForSelector)(page, groupPhotoesAndVideoDownloadButtonSelector, {});
    if (!success)
        return null;
    const buttonEle = await page.$(groupPhotoesAndVideoDownloadButtonSelector);
    if (buttonEle)
        await buttonEle.click();
    else
        return null;
}
exports.downloadPicturesAndVideos = downloadPicturesAndVideos;
async function getMemberListInfo(page, type, memberCountSelector) {
    const { groupMemberSelector, memberListScrollSelector, } = constants_1.selectors;
    await (0, puppeteer_utils_1.click)(page, memberCountSelector, { mandatory: true, timeout: 2000 });
    let _members = [];
    await (0, puppeteer_utils_1.waitForSelector)(page, groupMemberSelector, { mandatory: true, countLimit: 10 }, async function (success) {
        if (!success)
            return false;
        _members = await page.evaluate((memberInfoSelector) => {
            const membersList = document.querySelectorAll(memberInfoSelector) || [];
            return membersList;
        }, groupMemberSelector);
    });
    let prevMembers = null;
    const memberInfoList = [];
    console.log('--------------------- member count -------------------\n', _members);
    while (true) {
        let success = await (0, puppeteer_utils_1.waitForSelector)(page, groupMemberSelector, {});
        if (!success)
            break;
        let members = await page.$$(groupMemberSelector);
        let memberString = JSON.stringify(members.sort());
        let memberCount = prevMembers == null ? 18 : 15;
        memberCount = Math.min(members.length, memberCount);
        if (prevMembers == memberString)
            break;
        for (let index = 0; index < memberCount; index++) {
            if (prevMembers == null && index < 3)
                continue;
            console.log('index => ', index);
            // get a member
            if (!members[index])
                continue;
            let memberInfo = await (0, exports.getMemberInfo)(page, members[index]);
            await (0, delay_1.delay)(300);
            await members[index].click(); // Close member info    
            if (!memberInfo)
                continue;
            memberInfoList.push(memberInfo);
        }
        await (0, puppeteer_utils_1.waitForSelector)(page, memberListScrollSelector, {});
        let scrollElement = await page.evaluate((memberListScrollSelector) => {
            let scrollElement = document.querySelector(memberListScrollSelector);
            return scrollElement;
        }, memberListScrollSelector);
        let scrollDist = 0;
        if (scrollElement) {
            console.log('Scroll Height => ', scrollElement.scrollHeight);
            scrollDist = scrollElement.scrollHeight / (memberCount / 13);
            await (0, delay_1.delay)(5000);
            console.log('scroll => ', scrollDist, scrollElement.scrollHeight);
            await (0, puppeteer_utils_1.scroll)(page, memberListScrollSelector, scrollDist, "down", {});
        }
        prevMembers = memberString;
    }
    console.log('member scanning finished!');
    return memberInfoList;
}
exports.getMemberListInfo = getMemberListInfo;
const getMemberInfo = async (page, member) => {
    const { groupMemberSelectorById, groupMemberNameSelector, groupMemberInfoListItemTitleSelector, groupMemberInfoListItemContentSelector, memberListScrollSelector, } = constants_1.selectors;
    await (0, puppeteer_utils_1.waitForSelector)(page, groupMemberSelectorById(4), {
        mandatory: true,
        countLimit: 10,
        timeout: 1000
    });
    // const member = members[index];
    await (0, delay_1.delay)(500);
    if (!member)
        return null;
    await member.click();
    let success = await (0, puppeteer_utils_1.waitForSelector)(page, groupMemberNameSelector, { timeout: 2000, mandatory: true });
    if (!success)
        return null;
    // Wait for member information modal
    success = await (0, puppeteer_utils_1.waitForSelector)(page, groupMemberInfoListItemTitleSelector, { timeout: 2000 })
        && await (0, puppeteer_utils_1.waitForSelector)(page, groupMemberInfoListItemContentSelector, { timeout: 2000 });
    if (!success) {
        console.log('This is you. So, I will skip!');
        // await delay(300);
        // await member.click(); // Close member info
        return null;
    }
    const { keyList = [], contentList = [], name } = await page.evaluate((groupMemberInfoListItemTitleSelector, groupMemberInfoListItemContentSelector, groupMemberNameSelector) => {
        let keyList = Array.from(document.querySelectorAll(groupMemberInfoListItemTitleSelector)).map((item, index) => {
            return item.textContent || "unknown";
        });
        let contentList = Array.from(document.querySelectorAll(groupMemberInfoListItemContentSelector)).map((item, index) => {
            return item.textContent || "undefined";
        });
        let name = document.querySelector(groupMemberNameSelector)?.textContent || 'undefined';
        return {
            keyList,
            contentList,
            name
        };
    }, groupMemberInfoListItemTitleSelector, groupMemberInfoListItemContentSelector, groupMemberNameSelector);
    let memberInfo = { name };
    keyList.map((key, index) => {
        if (typeof key == "string")
            memberInfo[key] = contentList[index];
    });
    // await scroll(page, memberListScrollSelector, 50, "down", {});
    return memberInfo;
};
exports.getMemberInfo = getMemberInfo;
