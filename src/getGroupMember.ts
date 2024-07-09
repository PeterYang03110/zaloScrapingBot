import { ElementHandle, Page } from "puppeteer";
import { MemberInfo } from "./scrapGroupList";
import { databasePath, selectors } from "./constants";
import { click, scroll, waitForSelector } from "./common/puppeteer-utils";
import { delay } from "./common/delay";
import { saveJsonFile } from "./common/media-utils";

export async function getGroupMemberList(
    page: Page, 
    title: string,
    type: string
) : Promise < Array<MemberInfo> | boolean > {
    const {
        groupMemberSelector,
        memberListScrollSelector,
        groupTypeSelector,
        communityMemberCountSelector,
        groupMemberCountSelector
    } = selectors;
    
    // get type for group
    let memberCountSelector = type == "Group" ? groupMemberCountSelector : communityMemberCountSelector;
    
    await click(page, memberCountSelector, {mandatory: true, timeout: 2000});

    let prevMembers = null;
    const memberInfoList: MemberInfo[] = [];
    
    // while (true) {     
        // let success = await waitForSelector(page, groupMemberSelector, {})
        let success = await waitForSelector(page, groupMemberSelector, {})
        // if (!success) break;
        if (!success) return [];

        let members = await page.$$(groupMemberSelector);
        let memberString = JSON.stringify(members.sort());

        let memberCount = prevMembers == null ? 15 : 12;
        memberCount = Math.min(members.length, memberCount);
        
        // if (prevMembers == memberString) break;
        
        for (let index = 0; index < memberCount; index ++) {
            if(prevMembers == null && ((index < 3 && type != "Group") || (index < 2 && type == "Group"))) continue; 
            console.log('index => ', index);
            // get a member
            if (!members[index]) continue;
            let memberInfo = await getMemberInfo(page, members[index]);
            
            await delay(300);
            await members[index].click(); // Close member info    
            if(!memberInfo) {
                memberInfoList.push({
                    name: 'me'
                })
            } else memberInfoList.push(memberInfo);
        }
        // Scroll logic
    //     await waitForSelector(page, memberListScrollSelector, {});
    //     let scrollElement = await page.evaluate((memberListScrollSelector: string) => {
    //         let scrollElement = document.querySelector(memberListScrollSelector);
    //         return scrollElement;
    //     }, memberListScrollSelector);

    //     let scrollDist = 0;
    //     if(scrollElement) {
    //         console.log('Scroll Height => ', scrollElement.scrollHeight);
    //         scrollDist = scrollElement.scrollHeight / (memberCount / 13); 
    //         console.log('scroll => ', scrollDist, scrollElement.scrollHeight);
            
    //         await scroll(page, memberListScrollSelector, scrollDist, "down", {})
    //         await delay(5000);
    //     } 
    //     prevMembers = memberString;
    // }

    console.log('member scanning finished!');
    await saveJsonFile(databasePath(title), title, {
        members: memberInfoList,
        name: title
    })
    return memberInfoList;
}

export const getMemberInfo = async (page: Page, member: ElementHandle<Element>) => {
    const {
        groupMemberSelectorById,
        groupMemberNameSelector,
        groupMemberInfoListItemTitleSelector,
        groupMemberInfoListItemContentSelector,
    } = selectors;
    
    await delay(500);
    if(!member) return null;
    await member.click();    

    let success = await waitForSelector(page, groupMemberNameSelector, { timeout: 2000, mandatory: true });
    if (!success) return null;

    // Wait for member information modal
    success = await waitForSelector(page, groupMemberInfoListItemTitleSelector, {timeout: 2000}) 
           && await waitForSelector(page, groupMemberInfoListItemContentSelector, {timeout: 2000});

    if (!success) {
        console.log('This is you. So, I will skip!');
        return null;
        await member.click(); // Close member info
    }

    const {
        keyList = [], 
        contentList = [], 
        name
    } = await page.evaluate((groupMemberInfoListItemTitleSelector, groupMemberInfoListItemContentSelector, groupMemberNameSelector) => {
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

    let memberInfo: any = { name };
    keyList.map((key, index) => {                            
        if(typeof key == "string") memberInfo[key] = contentList[index];
    })
    // await scroll(page, memberListScrollSelector, 50, "down", {});

    return memberInfo;
}