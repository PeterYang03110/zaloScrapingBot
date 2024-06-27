"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getListItemElements = exports.click = exports.waitForSelector = void 0;
/**
 * Click selector div
 * @param page current page
 * @param selector selector for div. ex: #mainTab .tab-list
 * @param option If mandatory is false, it will try once, and otherwise it will try by countLimit times.
 * @returns click status. If false, click is failed.
 */
const waitForSelector = async (page, selector, option, callback) => {
    const { mandatory = false, countLimit = 5, timeout = 1000 } = option;
    let success = false;
    if (mandatory == false) {
        try {
            await page.waitForSelector(selector, {
                timeout
            });
            success = true;
        }
        catch (error) {
            console.log(`click ${selector} error: `, error);
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
                    console.log(`click error ${counter}: `, error);
                    break;
                }
                success = false;
            }
        }
    }
    if (success) {
        await callback(success);
    }
    return success;
};
exports.waitForSelector = waitForSelector;
const click = async (page, selector, option) => {
    let isSuccess = false;
    await (0, exports.waitForSelector)(page, selector, option, async function (success) {
        isSuccess = success;
        if (success) {
            await page.click(selector, option);
        }
    });
    return isSuccess;
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
