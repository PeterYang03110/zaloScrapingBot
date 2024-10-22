import puppeteer from "puppeteer-extra";
import {ClickOptions, WaitForSelectorOptions, ElementHandle, EvaluateFunc, Page} from 'puppeteer'
import { delay } from "./delay";

export interface WaitForSelectorOption extends WaitForSelectorOptions {
    mandatory?: boolean, 
    countLimit?: number,
    timeout?: number,
}

export interface ClickOption extends ClickOptions{
    mandatory?: boolean, 
    countLimit?: number,
    timeout?: number,
}
export interface EvaluateOption {
    mandatory?: boolean, 
    countLimit?: number,
    timeout?: number,
}
export interface GetListItemElementsOption {
    timeout?: number
}
export type Direction = "up" | "down" | "left" | "right";
/**
 * Click selector div
 * @param page current page
 * @param selector selector for div. ex: #mainTab .tab-list
 * @param option If mandatory is false, it will try once, and otherwise it will try by countLimit times.
 * @returns click status. If false, click is failed.
 */
export const waitForSelector = async (page: Page, selector: string, option: WaitForSelectorOption, callback?: Function) : Promise <boolean> => {
    const { mandatory = false, countLimit = 5, timeout = 10000 } = option;
    let success = false;

    if (mandatory == false) {
        try {
            await page.waitForSelector(selector, {
                timeout
            });
            success = true;
        } catch (error) {
            // console.log(`wait for ${selector} error: `, error);
            success = false;
        }
    } else {
        let counter = 0;
        while (true) {
            try {
                await page.waitForSelector(selector, {
                    timeout
                });
                success = true;
                break;
            } catch (error) {
                counter ++;
                if(counter >= countLimit) {
                    // console.log(`wait for ${counter} error: `, error);
                    break;
                }
                success = false;
            }
        } 
    }

    try {
        if(callback) await callback(success);
    } catch (error) {
        success = false;
    }

    return success;
}
/**
 * 
 * @param page Currently working tab
 * @param selector 
 * @param option 
 * @returns 
 */
export const click = async (page: Page, selector: string, option: ClickOption) => {
    const success = await waitForSelector(page, selector, option, async function(success: boolean) {
        if (success) {
            await page.click(selector, option);
        }
    })

    return success;
}

/**
 * Get ListItem Elements in List with Selector
 * @param page current page
 * @param selector ListItem selector
 * @param option load and get options such as timeout...
 * @returns array. If not found, it will return empty array => []
 */
export const getListItemElements = async (page: Page, selector: string, option: GetListItemElementsOption = { timeout: 3000 }) 
    : Promise < Array< ElementHandle<Element> > > => {
    const { timeout } = option;
    
    try {
        await page.waitForSelector(selector, {
            timeout
        })

        const list = await page.$$(selector);
        
        return list;
    } catch (error) {
        return [];
    }

}

export const scroll = async (page: Page, selector: string, scrollDistance: number, direction: Direction, option: WaitForSelectorOption) : Promise<number> => {
    let scrollPos:any;
    
    await waitForSelector(page, selector, option, async function(success: boolean) {
        if(!success) return success;
        console.log('scrolling...');
    })

    scrollPos = await page.evaluate((scrollDistance: number, selector, direction) => {
        const scrollElement = document.querySelector(selector);
        
        if(scrollElement)
        switch (direction) {
            case "up":
                scrollElement.scrollTop -= scrollDistance;
                return scrollElement.scrollTop;

            case "down":
                scrollElement.scrollTop += scrollDistance;
                return scrollElement.scrollTop;
            
            case "left":
                scrollElement.scrollLeft -= scrollDistance;
                return scrollElement.scrollLeft;
            
            case "right":
                scrollElement.scrollLeft += scrollDistance;
                return scrollElement.scrollLeft;

            default:
                break;
        } else {
            return selector;
        }
    }, scrollDistance, selector, direction);
    await delay(1000);
    console.log('scrolling end => ', scrollPos);

    return scrollPos;
}

export const setScroll = async (page: Page, selector: string, scrollPos: number, direction: Direction, option: WaitForSelectorOption) : Promise<number> => {
    let pos:any;
    
    await waitForSelector(page, selector, option, async function(success: boolean) {
        if(!success) return success;
        console.log('scrolling...');
    })

    pos = await page.evaluate((scrollDistance: number, selector, direction) => {
        const scrollElement = document.querySelector(selector);
        
        if(scrollElement)
        switch (direction) {
            case "up":
                scrollElement.scrollTop = scrollDistance;
                return scrollElement.scrollTop;

            case "down":
                scrollElement.scrollTop = scrollDistance;
                return scrollElement.scrollTop;
            
            case "left":
                scrollElement.scrollLeft = scrollDistance;
                return scrollElement.scrollLeft;
            
            case "right":
                scrollElement.scrollLeft = scrollDistance;
                return scrollElement.scrollLeft;

            default:
                break;
        } else {
            return selector;
        }
    }, scrollPos, selector, direction);
    await delay(1000);
    console.log('scrolling end => ', pos);

    return pos;
}

export async function getScroll(page: Page, selector: string, option: WaitForSelectorOption) : Promise<number> {
    let scrollPos:any;
    
    await waitForSelector(page, selector, option, async function(success: boolean) {
        if(!success) return success;
    })

    scrollPos = await page.evaluate((selector: string) => {
        const scrollElement = document.querySelector(selector);
        return scrollElement?.scrollTop || 0;
    }, selector);

    return scrollPos;
}