import { Page } from "puppeteer";
import { selectors } from "./constants";
import { waitForSelector } from "./common/puppeteer-utils";

export async function getGroupTitleList(page: Page) : Promise<Array<string>> {
    const {
        groupListItemTitleSelector,
    } = selectors;

    let titleList: string[] = [];

    let success = await waitForSelector(page, groupListItemTitleSelector, {timeout: 3000, mandatory: true});
    let groups = await page.$$(groupListItemTitleSelector);
    
    if (!success) return [];

    for (let index = 0; index < groups.length; index ++) {
        // if (index < 3) continue;
        let title = "";
        console.log(groups[index]);
        
        title = await page.evaluate((group) => {
            return group?.textContent
        }, groups[index]) || "";
        
        if (title != "") titleList.push(title);
    }

    return titleList;
}