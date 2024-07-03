"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMemberInfo = exports.getMemberListInfo = exports.downloadLinks = exports.downloadFiles = exports.downloadPicturesAndVideos = exports.getGroupListInfo = void 0;
const tslib_1 = require("tslib");
const constants_1 = require("./constants");
const puppeteer_utils_1 = require("./common/puppeteer-utils");
const delay_1 = require("./common/delay");
const media_utils_1 = require("./common/media-utils");
const mediaScript_1 = tslib_1.__importDefault(require("./common/mediaScript"));
const _1 = require(".");
const fs_1 = tslib_1.__importDefault(require("fs"));
/**
 * Get information list for Groups and Communities such as members, messages ...
 * @param page
 * @param groups list of Groups and Communites
 * @returns groupInfoList
 */
const getGroupListInfo = async (page, groups) => {
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
            let groupInfo = await getGroupInfo(page, title); // Scraping in group
            await (0, delay_1.delay)(1000);
            await (0, puppeteer_utils_1.click)(page, mainTabItemSelector, { mandatory: true, timeout: 3000 }); // Get out group
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
exports.getGroupListInfo = getGroupListInfo;
/**
 * Identify whether it is group or community and then get information a specific group or community.
 * @param page
 * @param title group's title. It is difficult to get from here, so get it from outside.
 * @returns groupInfo
 */
async function getGroupInfo(page, title) {
    const { groupTypeSelector, groupMemberCountSelector, communityMemberCountSelector, groupAvatarSelector, groupLinkSelector, groupMemberCountBackSelector, groupMediaViewAllButtonSelector, groupImageSelector, } = constants_1.selectors;
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
    // Get Gruop link
    await (0, puppeteer_utils_1.click)(page, groupAvatarSelector, {});
    await (0, puppeteer_utils_1.waitForSelector)(page, groupLinkSelector, {});
    await (0, delay_1.delay)(2000);
    let groupLink = await page.evaluate((groupLinkSelector) => {
        return document.querySelector(groupLinkSelector)?.textContent || '';
    }, groupLinkSelector);
    await (0, puppeteer_utils_1.waitForSelector)(page, groupImageSelector, {}, async function (success) {
        if (!success)
            return false;
        let link = await page.evaluate((groupImageSelector) => {
            return document.querySelector(groupImageSelector)?.getAttribute("src");
        }, groupImageSelector);
        await (0, media_utils_1.saveImage)(_1.zaloBrowser, link, title, 'Avatar');
    });
    await (0, puppeteer_utils_1.click)(page, groupAvatarSelector, {});
    // Get MemberList
    memberList = await getMemberListInfo(page, type, memberCountSelector);
    if (typeof memberList == "boolean")
        return false;
    console.log('memberList => ', memberList.length, memberList);
    // Get Medias, Files and Links
    await (0, puppeteer_utils_1.click)(page, groupMemberCountBackSelector, { mandatory: true, timeout: 2000, countLimit: 3 });
    // Determin whether Medias, Files, Links are exist or not 
    success = await (0, puppeteer_utils_1.waitForSelector)(page, groupMediaViewAllButtonSelector, { timeout: 3000 });
    if (success) {
        await (0, puppeteer_utils_1.click)(page, groupMediaViewAllButtonSelector, {});
        await downloadPicturesAndVideos(page, (0, constants_1.databasePath)(title) + '/media');
        await downloadFiles(page, (0, constants_1.databasePath)(title) + '/files');
        // await saveLinks(page);
    }
    info = {
        memberCount: parseInt(memberCount),
        name: title,
        members: memberList,
        link: groupLink,
        type,
    };
    return info;
}
async function downloadPicturesAndVideos(page, path) {
    const { groupPhotoesAndVideosTabSelector, groupPhotoesAndVideoPreviewItemSelector, groupPhotoesAndVideoDownloadButtonSelector, groupPhotoesAndVideoNextButtonSelector, groupPhotoesAndVideoItemSelector, } = constants_1.selectors;
    if (!fs_1.default.existsSync(path)) {
        fs_1.default.mkdirSync(path, { recursive: true });
    }
    const downloads = new Map();
    let downloadResolvers = new Set();
    let eofNextFlag = false;
    const waitForDownloadCompletion = () => {
        return new Promise(resolve => downloadResolvers.add(resolve));
    };
    await page.evaluate(mediaScript_1.default);
    const client = await page.createCDPSession();
    client.on("Browser.downloadProgress", async function (event) {
        if (event.state === "completed") {
            console.log('downloaded!');
        }
    });
    client.on('Browser.downloadWillBegin', (event) => {
        if (downloadResolvers.size > 0) {
            downloads.set(event.guid, {
                resolvers: downloadResolvers,
                filename: event.suggestedFilename,
            });
            downloadResolvers = new Set();
        }
    });
    client.on('Browser.downloadProgress', async (event) => {
        const { guid } = event;
        console.log("*** ", event.state, " ***", downloads.get(guid)?.filename);
        if (event.state === 'completed' && downloads.has(guid)) {
            const { resolvers, filename } = downloads.get(guid);
            downloads.delete(guid);
            resolvers.forEach((resolve) => resolve(filename));
            try {
                await page.waitForSelector(groupPhotoesAndVideoNextButtonSelector, { timeout: 10000 });
                await page.click(groupPhotoesAndVideoNextButtonSelector);
            }
            catch (ex) {
                eofNextFlag = true;
            }
        }
    });
    // Get in Media Tabs
    let success = await (0, puppeteer_utils_1.click)(page, groupPhotoesAndVideosTabSelector, {});
    if (!success)
        return null;
    await (0, delay_1.delay)(2000);
    // Get Image list
    await (0, puppeteer_utils_1.waitForSelector)(page, groupPhotoesAndVideoItemSelector, {});
    let links = await page.evaluate((groupPhotoesAndVideoItemSelector) => {
        let imgElements = document.querySelectorAll(groupPhotoesAndVideoItemSelector);
        let links = [];
        imgElements.forEach((imgElement, key) => {
            if (imgElement.getAttribute("src"))
                links.push(imgElement.getAttribute("src")?.toString());
        });
        return links;
    }, groupPhotoesAndVideoItemSelector);
    for (let i = 0; i < links.length; i++) {
        let imageFilename = i;
        if (links[i] == null)
            continue;
        await (0, media_utils_1.saveImage)(_1.zaloBrowser, links[i], path, imageFilename);
    }
    // Click First Image
    // success = await waitForSelector(page, groupPhotoesAndVideoPreviewItemSelector, {});
    // if (!success) return null;
    // const photoEle = await page.$(groupPhotoesAndVideoPreviewItemSelector);
    // if(photoEle) await photoEle.click();
    // else return null;
    // while (true) {
    //     success = await waitForSelector(page, groupPhotoesAndVideoDownloadButtonSelector, {});
    //     if(!success) return null;
    //     const downloadButtonEle = await page.$(groupPhotoesAndVideoDownloadButtonSelector);
    //     if(!downloadButtonEle) return null;
    //     await client.send('Browser.setDownloadBehavior', {
    //         behavior: "allow",
    //         downloadPath: path,
    //         eventsEnabled: true
    //     })
    //     const [filename] = await Promise.all([
    //         waitForDownloadCompletion(),
    //         await downloadButtonEle.click(),
    //     ]);
    //     if (eofNextFlag) break;
    // }
}
exports.downloadPicturesAndVideos = downloadPicturesAndVideos;
async function downloadFiles(page, path) {
    const { groupFilesTabSelector, groupFileItemSelector, //define it
    groupFileViewAllButtonSelector } = constants_1.selectors;
    let success = await (0, puppeteer_utils_1.click)(page, groupFilesTabSelector, {});
    if (!success)
        return null;
    // File search
    success = await (0, puppeteer_utils_1.waitForSelector)(page, groupFileViewAllButtonSelector, { timeout: 5000 });
    if (!success)
        return null;
    let fileViewButtonEle = await page.$(groupFileViewAllButtonSelector);
    if (!fileViewButtonEle)
        return null;
    let fileName = '';
    await fileViewButtonEle.click();
    await (0, puppeteer_utils_1.waitForSelector)(page, groupFileItemSelector, {});
    await (0, media_utils_1.saveFile)(page, groupFileItemSelector, path, fileName);
}
exports.downloadFiles = downloadFiles;
async function downloadLinks(page, path) {
}
exports.downloadLinks = downloadLinks;
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
            if (prevMembers == null && ((index < 3 && type != "Group") || (index < 2 && type == "Group")))
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
            console.log('scroll => ', scrollDist, scrollElement.scrollHeight);
            await (0, puppeteer_utils_1.scroll)(page, memberListScrollSelector, scrollDist, "down", {});
            await (0, delay_1.delay)(5000);
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
