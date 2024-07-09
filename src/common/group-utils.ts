import { ElementHandle, Page } from "puppeteer";
import { waitForSelector } from "./puppeteer-utils";

export async function getElementByTextFilter(page: Page, listItemSelector: string, textFilter: string) : Promise <ElementHandle<Element>[]> {
    let success = await waitForSelector(page, listItemSelector, {});
    if (!success) return [];

    let eleList = await page.$$(listItemSelector);
    let res: ElementHandle<Element>[] = [];

    for (let i = 0; i < eleList.length; i ++) {
        let isMatch = await page.evaluate((ele, textFilter) => ele.textContent == textFilter, eleList[i], textFilter)
        if (isMatch) res.push(eleList[i])
    }

    return res;
}