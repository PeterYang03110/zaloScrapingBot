import { Page } from "puppeteer";
import { getScroll, scroll, waitForSelector } from "./common/puppeteer-utils";
import { databasePath, selectors } from "./constants";
import { saveJsonFile } from "./common/media-utils";
import { delay } from "./common/delay";
import { stringToDate } from "./common/calcDate";

export async function getGroupMessage(page: Page, title: string, type: string) {
    const {
        groupMessageBlockSelectorByDate,
        groupMessageDateSelector,
        groupMessageSelector,
        groupMessageBlockSelectorByAuthor,
        groupMessageQuoteTextSelector,
        messageListScrollSelector
    } = selectors
    await waitForSelector(page, groupMessageBlockSelectorByDate, {});
    console.log('get messages...');

    while (true) {
        await scroll(page, messageListScrollSelector, 10000, "up", {})
        const scrollPos = await getScroll(page, messageListScrollSelector, {});
        await delay(3000);
        console.log('scrollPos => ', scrollPos);
        if(scrollPos == 0) break;
    }
    
    let messageBLocksByDate = await page.$$(groupMessageBlockSelectorByDate);
    messageBLocksByDate = messageBLocksByDate.reverse();
    
    let messages = [];
    
    for (let messageBlockByDate of messageBLocksByDate) {
        let messageBlocksByAuthor = (await messageBlockByDate.$$(groupMessageBlockSelectorByAuthor)).reverse();

        for (let messageBlockByAuthor of messageBlocksByAuthor) {
            let date = await page.evaluate((dateSelector) => {
                return document.querySelector(dateSelector)?.textContent;
            }, groupMessageDateSelector);
            
            let day = stringToDate(date?.trim() || "Today");
            console.log(date, day);

            let messageElesByAuthor = (await messageBlockByAuthor.$$(groupMessageSelector)).reverse();
            
            let lastDate = null;
            let messageAuthor = null;
            // Get Author
            let messageAuthorEle = await messageBlockByAuthor.$('div-13');

            let classNames = (await messageBlockByAuthor.getProperty("className")).toString().split(' ');
            if (classNames.filter((className) => className == 'me').length) {
                messageAuthor = 'me';
            } else {
                messageAuthor = await page.evaluate((messageAuthorEle) => {
                    return messageAuthorEle?.textContent;
                }, messageAuthorEle)
            }
    
            for (let messageEle of messageElesByAuthor) {              
                let messageContentEle = await messageEle.$('span-15');
                let messageDateEle = await messageEle.$('span-13');
                let messageQuoteEle = await messageEle.$(groupMessageQuoteTextSelector);
                let messageContent = null;
                let messageSubContent = null;
                let messageDate = null;
                let existSubContent = false;
                // Get Main Content
                if (messageQuoteEle) {                    
                    messageContent = await page.evaluate((messageQuoteEle) => {
                        return messageQuoteEle.textContent;
                    }, messageQuoteEle);
                    existSubContent = true;
                }
                    
                // Get Content
                if (!messageContentEle) {
                    if (!existSubContent) messageContent = "";
                    else messageSubContent = "";
                } else {
                    let content = await page.evaluate((messageContentEle) => {
                        return messageContentEle.textContent;
                    }, messageContentEle)
                    existSubContent ? messageSubContent = content :  messageContent = content;
                }
    
                // Get Date
                if (!messageDateEle) messageDate = lastDate;
                else {
                    messageDate = await page.evaluate((messageDateEle) => {
                        return messageDateEle.textContent;
                    }, messageDateEle);
                    lastDate = messageDate;
                }
    
                messages.push(existSubContent ? {
                    context: messageContent,
                    postDate: day + ' ' + messageDate,
                    AuthorName: messageAuthor,
                    AuthorId: '',
                    subContext: messageSubContent,
                    reactions: {
                        count: 0,
                        users: []
                    },
                    post: {
                        images: []
                    }
                } : {
                    context: messageContent,
                    postDate: day + ' ' + messageDate,
                    AuthorName: messageAuthor,
                    AuthorId: '',
                    subContext: '',
                    reactions: {
                        count: 0,
                        users: []
                    },
                    post: {
                        images: []
                    }
                })    
            }
        }
    }
    
    await saveJsonFile(databasePath(title), title, {
        content: messages,
        type,
        name: title
    });
}