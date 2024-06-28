"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMemberInfoList = exports.getGroupsAndCommunitiesInfo = void 0;
const constants_1 = require("./constants");
const puppeteer_utils_1 = require("./common/puppeteer-utils");
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
            await (0, puppeteer_utils_1.click)(page, groupListItemSelectorById(index), {}); // Get in group
            let groupInfo = await getGroupOrCommunityInfo(page, title); // Scraping in group
            await (0, puppeteer_utils_1.click)(page, mainTabItemSelector, {}); // Get out group
            if (typeof groupInfo == 'boolean')
                continue;
            // Save data
            await (0, media_utils_1.saveJsonFile)((0, constants_1.databasePath)(groupInfo.name), groupInfo.name, groupInfo);
            groupInfoList.push(groupInfo);
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
 * @param title group's title. It is difficult to get from here, so get it from outside.
 * @returns groupInfo
 */
async function getGroupOrCommunityInfo(page, title) {
    const { groupTypeSelector, groupMemberCountSelector, communityMemberCountSelector, groupMemberSelectorById, } = constants_1.selectors;
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
    // Get MemberList
    memberList = await getMemberInfoList(page, type, memberCountSelector);
    console.log('memberList => ', memberList);
    // Get link
    // success = await waitForSelector(page, memberCountSelector, {timeout: 2000, mandatory: true}, async function (success: boolean) {
    //     memberCount = await page.evaluate((success, name, memberCountSelector) => {
    //         let type = success ? 'Community' : 'Group';    
    //         let memberCount = document.querySelector(memberCountSelector)?.textContent || '0';
    //         return memberCount;
    //     }, success, title, memberCountSelector);
    // })
    // if(!success) return false;
    info = {
        memberCount: parseInt(memberCount),
        name: title,
        members: memberList,
        link: '',
        type,
    };
    return info;
}
async function getMemberInfoList(page, type, memberCountSelector) {
    const { groupMemberSelectorById, groupMemberSelector, groupMemberNameSelector, groupMemberBioSelector, groupMemberGenderSelector, groupMemberBirthdaySelector, groupMemberPhoneNumberSelector } = constants_1.selectors;
    await (0, puppeteer_utils_1.click)(page, memberCountSelector, { mandatory: true, timeout: 2000 });
    const members = await page.$$(groupMemberSelector);
    const memberInfoList = [];
    for (let index = 0; index < members.length; index++) {
        if (index < 3)
            continue;
        const member = members[index];
        await member.click();
        let success = await (0, puppeteer_utils_1.waitForSelector)(page, groupMemberNameSelector, { timeout: 2000, mandatory: true });
        if (!success)
            continue;
        await (0, puppeteer_utils_1.waitForSelector)(page, groupMemberBioSelector, {});
        await (0, puppeteer_utils_1.waitForSelector)(page, groupMemberGenderSelector, {});
        // if (type == 'Group') await waitForSelector(page, groupMemberPhoneNumberSelector, {});
        const memberInfo = await page.evaluate((nameSelector, bioSelector, genderSelector, birthdaySelector, phoneNumberSelector) => {
            return {
                name: document.querySelector(nameSelector)?.textContent || '',
                bio: document.querySelector(bioSelector)?.textContent || '',
                gender: document.querySelector(genderSelector)?.textContent || '',
                birthday: document.querySelector(birthdaySelector)?.textContent || '',
                phoneNumber: document.querySelector(phoneNumberSelector)?.textContent || ''
            };
        }, groupMemberNameSelector, groupMemberBioSelector, groupMemberGenderSelector, groupMemberBirthdaySelector, groupMemberPhoneNumberSelector);
        memberInfoList.push(memberInfo);
        await member.click(); // Close member info
    }
    return memberInfoList;
}
exports.getMemberInfoList = getMemberInfoList;
