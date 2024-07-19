import { ElementHandle, Page } from "puppeteer";
import { MemberInfo } from "./scrapGroupList";
import { databasePath, selectors } from "./constants";
import { click, getScroll, scroll, setScroll, waitForSelector } from "./common/puppeteer-utils";
import { delay } from "./common/delay";
import { saveImage, saveJsonFile } from "./common/media-utils";
import { WorkerType, zaloBrowser } from ".";

export async function getGroupMemberList(
    page: Page, 
    worker: WorkerType,
    title: string,
    type: string
) : Promise < Array<MemberInfo> | boolean > {
    const {
        groupMemberSelector,
        memberListScrollSelector,
        communityMemberCountSelector,
        groupMemberCountSelector,
        groupMemberInfoSearchInputSelector,
        groupMemberInfoAddMemberButtonSelector
    } = selectors;
    
    // get type for group
    let memberCountSelector = type == "Group" ? groupMemberCountSelector : communityMemberCountSelector;
    
    await click(page, memberCountSelector, {mandatory: true, timeout: 2000});
    let isSearchbar = await waitForSelector(page, groupMemberInfoSearchInputSelector, {timeout: 2500})
    let isAddMemberButton = await waitForSelector(page, groupMemberInfoAddMemberButtonSelector, {timeout: 2500})
    console.log('Is searchbar => ', isSearchbar);
    console.log('Is addmemberbutton => ', isAddMemberButton);

    let memberInfoList: MemberInfo[] = [];
    let prevScrollPos = 0;
    // let scrollDist = 0;
    await waitForSelector(page, memberListScrollSelector, {timeout: 3000})
    let scrollDist = await page.evaluate((memberListScrollSelector) => {
        let scrollEle = document.querySelector(memberListScrollSelector);
        return scrollEle?.clientHeight
    }, memberListScrollSelector) || 0;

    let marginTop = 0;
    let startIndex = 0;

    let members = await page.$$(groupMemberSelector);
    while (true) {
        let height = await page.evaluate(member => {
            return member?.clientHeight;
        }, members[startIndex]) || 0
        if (height == 64 && startIndex != 0) break;

        if (isAddMemberButton && startIndex == 0) height = 64;
        startIndex ++;
        marginTop += height;
        console.log('height => ', startIndex, height);
    }
    
    let index = 0;
    let scrollPos = marginTop;
    let prevScroll = 0, nowScroll = 0;

    prevScroll = await setScroll(page, memberListScrollSelector, scrollPos, "down", {})
    if (prevScroll != 0) { //Means that no scroll
        startIndex = 1 
    }
    while (true) {
        let success = await waitForSelector(page, groupMemberSelector, {})
        if (!success) return [];

        let members = await page.$$(groupMemberSelector);
        if(!members) break;

        if(members[startIndex]) {
            console.log('startIndex => ', startIndex);
            let memberInfo = await getMemberInfo(page, worker, members[startIndex], title);
            await members[startIndex].click(); // Close member info    

            console.log(memberInfo);
            if (memberInfo) {
                memberInfoList.push(memberInfo)
            }
            await delay(1000);
            scrollPos += 64;
            nowScroll = await setScroll(page, memberListScrollSelector, scrollPos, "down", {})
        } else {
            scrollPos += 64;
            nowScroll = await setScroll(page, memberListScrollSelector, scrollPos, "down", {})
        }
        if (prevScroll == nowScroll) {
            for (let i = startIndex + 1; i < members.length; i ++) {
                let memberInfo = await getMemberInfo(page, worker, members[i], title);
                await members[startIndex].click(); // Close member info    

                console.log(memberInfo);
                if (memberInfo) {
                    memberInfoList.push(memberInfo)
                }
                await delay(1000);
            }
            break;
        }
        else prevScroll = nowScroll;
        startIndex = 1;
        index ++;
    }
  
    console.log('member scanning finished!');
    await saveJsonFile(databasePath(title), title, {
        members: {
            count: memberInfoList.length,
            userInfos: memberInfoList
        },
        name: title
    })
    return memberInfoList;
}

export const getMemberInfo = async (page: Page, worker: WorkerType, member: ElementHandle<Element>, title: string) : Promise<MemberInfo | null> => {
    const {
        groupMemberNameSelector,
        groupMemberInfoListItemTitleSelector,
        groupMemberInfoListItemContentSelector,
        groupMemberMyInfoListItemTitleSelector,
        groupMemberMyInfoListItemContentSelector,
        groupMemberIsBusinessSelector,
        groupMemberBusinessNameSelector,
        groupMemberBusinessInfoListDescriptionSelector,
        groupMemberBusinessInfoListItemContentSelector,
        groupMemberBusinessInfoListItemTitleSelector,
        groupMemberMyInfoListItemAvatarSelector,
        groupMemberInfoListItemAvatarSelector,
        groupMemberInfoListItemCoverImageSelector,
        groupMemberInfoRoleSelector
    } = selectors;
    
    await delay(100);
    if(!member) return null;

    // Get a role
    let role = await page.evaluate((member, groupMemberInfoRoleSelector) => {
        return member.querySelector(groupMemberInfoRoleSelector)?.textContent
    }, member, groupMemberInfoRoleSelector)
    // Open modal
    await member.click();    

    let success = await waitForSelector(page, groupMemberNameSelector, { timeout: 2000, mandatory: true, countLimit: 5 });
    if (!success) return null;

    // Wait for member information modal
    success = await waitForSelector(page, groupMemberInfoListItemTitleSelector, {timeout: 2000}) 
           && await waitForSelector(page, groupMemberInfoListItemContentSelector, {timeout: 2000});
    // Normal account
    if (success) {
        // Get member info
        let memberInfo = await getMemberInfoDetail(
            page, 
            groupMemberInfoListItemTitleSelector, 
            groupMemberInfoListItemContentSelector, 
            groupMemberNameSelector,
        )
        // Download avatar
        let avatarLink = await page.evaluate((imageSelector) => {
            return document.querySelector(imageSelector)?.getAttribute("src");
        }, groupMemberInfoListItemAvatarSelector);
        if (avatarLink) {
            await saveImage(zaloBrowser[worker], avatarLink, databasePath(title) + '/media/avatars', memberInfo.name)
        }
        // Download cover image
        let coverImageLink = await page.evaluate((imageSelector) => {
            return document.querySelector(imageSelector)?.getAttribute("src");
        }, groupMemberInfoListItemCoverImageSelector);
        if (coverImageLink) {
            await saveImage(zaloBrowser[worker], coverImageLink, databasePath(title) + '/media/avatars/cover', memberInfo.name + '_cover')
        }
        
        if(role) memberInfo.role = role;
        return memberInfo;
    }
    
    // My account
    success = await waitForSelector(page, groupMemberMyInfoListItemTitleSelector, {timeout: 2000}) 
           && await waitForSelector(page, groupMemberMyInfoListItemContentSelector, {timeout: 2000});
    if (success) {
        console.log('My account');
        
        // Get member info
        let memberInfo = await getMemberInfoDetail(
            page, 
            groupMemberMyInfoListItemTitleSelector, 
            groupMemberMyInfoListItemContentSelector, 
            groupMemberNameSelector
        )

        // Download avatar
        await waitForSelector(page, groupMemberInfoListItemAvatarSelector, {timeout: 5000})
        let avatarLink = await page.evaluate((imageSelector) => {
            return document.querySelector(imageSelector)?.getAttribute("src");
        }, groupMemberMyInfoListItemAvatarSelector);
        if (avatarLink) {
            await saveImage(zaloBrowser[worker], avatarLink, databasePath(title) + '/media/avatars', memberInfo.name)
        }

        // Download cover image
        let coverImageLink = await page.evaluate((imageSelector) => {
            return document.querySelector(imageSelector)?.getAttribute("src");
        }, groupMemberInfoListItemCoverImageSelector);
        if (coverImageLink) {
            await saveImage(zaloBrowser[worker], coverImageLink, databasePath(title) + '/media/avatars/cover', memberInfo.name + '_cover')
        }
        
        if(role) memberInfo.role = role;
        return memberInfo;
    }

    // Business account
    success = await waitForSelector(page, groupMemberIsBusinessSelector, {timeout: 2000})
    if (success) {
        console.log('Business account');
        let memberName = await page.evaluate((nameSelector: string) => {
            return document.querySelector(nameSelector)?.textContent;
        }, groupMemberBusinessNameSelector)
        // Download avatar
        await waitForSelector(page, groupMemberInfoListItemAvatarSelector, {timeout: 5000})
        let avatarLink = await page.evaluate((imageSelector) => {
            return document.querySelector(imageSelector)?.getAttribute("src");
        }, groupMemberMyInfoListItemAvatarSelector);
        if (avatarLink) {
            await saveImage(zaloBrowser[worker], avatarLink, databasePath(title) + '/avatars', memberName)
        }

        // Download cover image
        let coverImageLink = await page.evaluate((imageSelector) => {
            return document.querySelector(imageSelector)?.getAttribute("src");
        }, groupMemberInfoListItemCoverImageSelector);
        if (coverImageLink) {
            await saveImage(zaloBrowser[worker], coverImageLink, databasePath(title) + '/avatars/cover', memberName + '_cover')
        }

        // Get info
        let button = await page.$(groupMemberIsBusinessSelector);
        if(button) await button.click();
        else return null;

        success = await waitForSelector(page, groupMemberBusinessInfoListDescriptionSelector, {timeout: 2000}) 
        if (!success) return null;

        let memberInfo = await getMemberInfoDetail(
            page, 
            groupMemberBusinessInfoListItemTitleSelector, 
            groupMemberBusinessInfoListItemContentSelector,
            groupMemberBusinessNameSelector
        )

        // add description
        let description = await page.evaluate((descriptioSelector: string) => {
            return document.querySelector(descriptioSelector)?.textContent || 'no description'
        }, groupMemberBusinessInfoListDescriptionSelector)
        memberInfo.description = description;

        if(role) memberInfo.role = role;
        return memberInfo
    }

    return null;
}

export const getMemberInfoDetail = async (page: Page, titleSelector: string, contentSelector: string, nameSelector: string) => {
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
    }, titleSelector, contentSelector, nameSelector);

    let memberInfo: any = { 
        "name": name,
        "sid": "",
        "id": "",
        "category": "",
        "address": "",
        "bio": "",
        "url": "",
        "gender": "",
        "email": "",
        "mobile": "",
        "birthdate": "",
        "role": "",
        "dateJoined": ""
    };
    keyList.map((key, index) => {
        let _key = key.toLowerCase();
        if (_key == 'phone number') _key = 'mobile';
        if (_key == 'birthday') _key = 'birthdate'
        if(typeof _key == "string") memberInfo[_key] = contentList[index];
    })
    // await scroll(page, memberListScrollSelector, 50, "down", {});

    return memberInfo;
}