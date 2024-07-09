import { Page } from "puppeteer";
import { databasePath, selectors } from "./constants";
import { click, waitForSelector } from "./common/puppeteer-utils";
import { GroupInfo } from "./scrapGroupList";
import { delay } from "./common/delay";
import { saveImage, saveJsonFile } from "./common/media-utils";
import { WorkerType, zaloBrowser } from ".";

export async function getGroupInfo(page: Page, worker: WorkerType, title: string) {
    const {
        groupTypeSelector,
        groupMemberCountSelector,
        communityMemberCountSelector,
        groupAvatarSelector,
        groupLinkSelector,
        groupImageSelector,
    } = selectors;

    let memberCountSelector: string = "";
    let memberCount = '0';
    let type = '';

    let success = await waitForSelector(page, groupTypeSelector, {timeout: 5000}, async function(success: boolean) {       
        // determine memberCountSelector whether group or community
        memberCountSelector = success
                            ? communityMemberCountSelector
                            : groupMemberCountSelector;
    })
    
    // Get Type
    type = success ? 'Community' : 'Group';

    // Show modal
    await click(page, groupAvatarSelector, {});
    // Get Link
    await waitForSelector(page, groupLinkSelector, {timeout: 3000, countLimit: 5, mandatory: true});
    await click(page, groupLinkSelector, {});
    await delay(2000);
    let groupLink = await page.evaluate((groupLinkSelector) => {
        return document.querySelector(groupLinkSelector)?.textContent || '';
    }, groupLinkSelector)
    
    // Get Avatar
    await waitForSelector(page, groupImageSelector, {}, async function (success: boolean) {
        if (!success) return false;
        let link = await page.evaluate((groupImageSelector) => {
            return document.querySelector(groupImageSelector)?.getAttribute("src");
        }, groupImageSelector);
        await saveImage(zaloBrowser[worker], link, title, 'Avatar');
    });
    // Close modal
    await click(page, groupAvatarSelector, {});
    // Get MemberCount
    success = await waitForSelector(page, memberCountSelector, {timeout: 2000, mandatory: true}, async function (success: boolean) {
        memberCount = await page.evaluate((memberCountSelector) => {
            let memberCount = document.querySelector(memberCountSelector)?.textContent || '0';
            
            return memberCount;
        }, memberCountSelector);
    })
    if(!success) return false;
        
    let info: GroupInfo = {
        type,
        name: title,
        link: groupLink,
        memberCount: parseInt(memberCount)
    };

    await saveJsonFile(databasePath(title), title, info)

    return info;
}