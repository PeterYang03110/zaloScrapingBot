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
        groupListItemTitleSelectorById,
        mainTabItemSelector
    } = selectors;

    let index = 3, groupInfoList = [] as any;
    for (const group of groups) {
        try {
            // Get group or community title
            let title = '';
            await waitForSelector(page, groupListItemTitleSelectorById(index), {timeout: 2000}, async function(success: boolean){
                title = await page.evaluate((success, selector) => {
                    if (success) return document.querySelector(selector)?.textContent || 'No title';
                    else return 'No title';
                }, success, groupListItemTitleSelectorById(index))
            })

            await click(page, groupListItemSelectorById(index), {}); // Get in group
            let groupInfo = await getGroupOrCommunityInfo(page, title); // Scraping in group
            groupInfoList.push(groupInfo);

            // Get out group
            await click(page, mainTabItemSelector, {});            
        } catch (error) {
            console.log('GetGroupsInforError => ', index, error);
            continue;
        }
        index ++;
    }

    console.log('groupInfo => ', groupInfoList);
    return groupInfoList;
}
/**
 * Identify whether it is group or community and then get information a specific group or community. 
 * @param page 
 */
async function getGroupOrCommunityInfo(page: Page, title: string) {
    const {
        groupTypeSelector,
        groupMemberCountSelector,
        communityMemberCountSelector,
    } = selectors;
    let info = {};

    const success = await waitForSelector(page, groupTypeSelector, {timeout: 3000}, async function(success: boolean) {
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
            }
        }, success, title, memberCountSelector);
    })
    console.log('group info => ', info);
    
    if (success || info) return info;
}