import { ElementHandle, Page } from "puppeteer";
import { MemberInfo } from "./scrapGroupList";
import { databasePath, selectors } from "./constants";
import { click, getScroll, scroll, waitForSelector } from "./common/puppeteer-utils";
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

    let memberInfoList: MemberInfo[] = [];
    let prevMembers = "";
    
    while (true) {     
        let success = await waitForSelector(page, groupMemberSelector, {})
        if (!success) return [];

        let members = await page.$$(groupMemberSelector);
        let tempMemberList: MemberInfo[] = [];
        let memberString = "";
        
        let memberCount = prevMembers == "" ? 13 : 14;
        let scrollDist = prevMembers == "" ? 64 * 11 + 94 : 64 * 13; 
        memberCount = Math.min(members.length, memberCount);
        
        console.log(prevMembers, memberString);
        
        for (let index = 0; index < memberCount; index ++) {

            if(prevMembers == "" && ((index < 3 && type != "Group") || (index < 2 && type == "Group"))) continue; 
            if(index < 1 && type == "Group") continue;
            // get a member
            if (!members[index]) continue;
            console.log('index => ', index);

            let memberInfo = await getMemberInfo(page, members[index]);
            memberString += JSON.stringify(memberInfo);

            await delay(300);
            await members[index].click(); // Close member info    
            if(!memberInfo) {
                tempMemberList.push({
                    name: 'me'
                })
            } else if(!memberInfoList.filter(item => {                
                return JSON.stringify(item) == JSON.stringify(memberInfo)
            }).length){
                tempMemberList.push(memberInfo);
            }
        }
        // Scroll logic
        success = await waitForSelector(page, memberListScrollSelector, {});

        if (success) {
            await scroll(page, memberListScrollSelector, scrollDist, "down", {})
            let scrollPos = await getScroll(page, memberListScrollSelector, {});
            console.log('scroll => ', scrollPos);
            await delay(2000);
        }

        console.log('memberCount => ', memberInfoList.length);
        
        if (prevMembers == memberString) break;
        memberInfoList = [...memberInfoList, ...tempMemberList]
        prevMembers = memberString;
    }

    console.log('member scanning finished!');
    await saveJsonFile(databasePath(title), title, {
        members: memberInfoList,
        name: title
    })
    return memberInfoList;
}

export const getMemberInfo = async (page: Page, member: ElementHandle<Element>) : Promise<MemberInfo | null> => {
    const {
        groupMemberSelectorById,
        groupMemberNameSelector,
        groupMemberInfoListItemTitleSelector,
        groupMemberInfoListItemContentSelector,
    } = selectors;
    
    await delay(500);
    if(!member) return null;
    await member.click();    

    let success = await waitForSelector(page, groupMemberNameSelector, { timeout: 2000, mandatory: true, countLimit: 5 });
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