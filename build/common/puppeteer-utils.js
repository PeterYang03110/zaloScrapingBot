"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setScroll = exports.scroll = exports.getListItemElements = exports.click = exports.waitForSelector = void 0;
exports.getScroll = getScroll;
const delay_1 = require("./delay");
/**
 * Click selector div
 * @param page current page
 * @param selector selector for div. ex: #mainTab .tab-list
 * @param option If mandatory is false, it will try once, and otherwise it will try by countLimit times.
 * @returns click status. If false, click is failed.
 */
const waitForSelector = async (page, selector, option, callback) => {
    const { mandatory = false, countLimit = 5, timeout = 10000 } = option;
    let success = false;
    if (mandatory == false) {
        try {
            await page.waitForSelector(selector, {
                timeout
            });
            success = true;
        }
        catch (error) {
            // console.log(`wait for ${selector} error: `, error);
            success = false;
        }
    }
    else {
        let counter = 0;
        while (true) {
            try {
                await page.waitForSelector(selector, {
                    timeout
                });
                success = true;
                break;
            }
            catch (error) {
                counter++;
                if (counter >= countLimit) {
                    // console.log(`wait for ${counter} error: `, error);
                    break;
                }
                success = false;
            }
        }
    }
    try {
        if (callback)
            await callback(success);
    }
    catch (error) {
        success = false;
    }
    return success;
};
exports.waitForSelector = waitForSelector;
/**
 *
 * @param page Currently working tab
 * @param selector
 * @param option
 * @returns
 */
const click = async (page, selector, option) => {
    const success = await (0, exports.waitForSelector)(page, selector, option, async function (success) {
        if (success) {
            await page.click(selector, option);
        }
    });
    return success;
};
exports.click = click;
/**
 * Get ListItem Elements in List with Selector
 * @param page current page
 * @param selector ListItem selector
 * @param option load and get options such as timeout...
 * @returns array. If not found, it will return empty array => []
 */
const getListItemElements = async (page, selector, option = { timeout: 3000 }) => {
    const { timeout } = option;
    try {
        await page.waitForSelector(selector, {
            timeout
        });
        const list = await page.$$(selector);
        return list;
    }
    catch (error) {
        return [];
    }
};
exports.getListItemElements = getListItemElements;
const scroll = async (page, selector, scrollDistance, direction, option) => {
    let scrollPos;
    await (0, exports.waitForSelector)(page, selector, option, async function (success) {
        if (!success)
            return success;
        console.log('scrolling...');
    });
    scrollPos = await page.evaluate((scrollDistance, selector, direction) => {
        const scrollElement = document.querySelector(selector);
        if (scrollElement)
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
            }
        else {
            return selector;
        }
    }, scrollDistance, selector, direction);
    await (0, delay_1.delay)(1000);
    console.log('scrolling end => ', scrollPos);
    return scrollPos;
};
exports.scroll = scroll;
const setScroll = async (page, selector, scrollPos, direction, option) => {
    let pos;
    await (0, exports.waitForSelector)(page, selector, option, async function (success) {
        if (!success)
            return success;
        console.log('scrolling...');
    });
    pos = await page.evaluate((scrollDistance, selector, direction) => {
        const scrollElement = document.querySelector(selector);
        if (scrollElement)
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
            }
        else {
            return selector;
        }
    }, scrollPos, selector, direction);
    await (0, delay_1.delay)(1000);
    console.log('scrolling end => ', pos);
    return pos;
};
exports.setScroll = setScroll;
async function getScroll(page, selector, option) {
    let scrollPos;
    await (0, exports.waitForSelector)(page, selector, option, async function (success) {
        if (!success)
            return success;
    });
    scrollPos = await page.evaluate((selector) => {
        const scrollElement = document.querySelector(selector);
        return scrollElement?.scrollTop || 0;
    }, selector);
    return scrollPos;
}
