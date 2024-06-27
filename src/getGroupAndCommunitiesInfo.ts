import { ElementHandle, Page } from "puppeteer";
import { selectors } from "./constants";
import { click, waitForSelector } from "./common/puppeteer-utils";
import { delay } from "./common/delay";
/**
 * Get information for Group and Communities such as members, messages ...
 * @param page 
 * @param groups list of Group and Communites
 * @returns 
 */
export const getGroupsAndCommunitiesInfo = async (page: Page, groups: Array< ElementHandle<Element> >) => {
    const {
        groupListItemSelectorById,
        mainTabItemSelector
    } = selectors;
    let index = 0, groupInfo = [] as any;
    for (const group of groups) {
        try {
            // Get in group
            await delay(2000);
            await click(page, groupListItemSelectorById(index + 1), {});
            await delay(2000);
            // Scraping in group
            await getGroupOrCommunityInfo(page);
            // Get out group
            await click(page, mainTabItemSelector, {});
        } catch (error) {
            console.log('GetGroupsInforError => ', index, error);
            continue;            
        }
        index ++;
    }

    console.log('groupInfo => ', groupInfo);
    return groupInfo;
}
/**
 * Identify whether it is group or community and then get information a specific group or community. 
 * @param page 
 */
async function getGroupOrCommunityInfo(page: Page) {
    const {
        groupTypeSelector
    } = selectors;

    const success = await waitForSelector(page, groupTypeSelector, {}, async function() {
        await page.evaluate((groupTypeSelector) => {
            const type = document.querySelector(groupTypeSelector)?.textContent;
            console.log("type => ", type);
        }, groupTypeSelector);
    })
}