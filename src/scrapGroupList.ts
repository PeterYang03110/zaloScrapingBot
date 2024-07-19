import { ElementHandle, Page } from "puppeteer";
import { selectors, databasePath } from "./constants";
import { click, scroll, waitForSelector } from "./common/puppeteer-utils";
import { delay } from "./common/delay";
import { WorkerType } from ".";
import { groupListInfo } from './index'
import { getGroupTitleList } from "./getGroupInfoTitle";
import { getElementByTextFilter } from "./common/group-utils";
import { getGroupInfo } from "./getGroupInfo";
import { getGroupMemberList } from "./getGroupMember";
import { getGroupMessage as getGroupMessages } from "./getGroupMessage";
import { downloadMedias } from "./downloadMedias";

export interface GroupInfo {
    name: string,
    type?: string,
    id?: string,
    status?: string,
    allow_status?: string,
    content?: Array<any>,
    links?: Array<string | null>,
    members?: {
        count: number,
        userInfos: Array<MemberInfo | null>
    },
    description?: string,
    sid?: string,
    updateDate?: string
}

export interface MemberInfo {
    sid?: string,
    id?: string,
    category?: string,
    address?: string,
    email?: string,
    url?: string,
    dateJoined?: string,
    avatar?: string,
    name: string,
    Gender?: string,
    Birthday?: string,
    Bio?: string,
    PhoneNumber?: string
}

export interface GroupInfoGetOptions {
    message?: boolean,
    member?: boolean,
    media?: boolean,
    groupInfo?: boolean
}
/**
 * Get information list for Groups and Communities such as members, messages ...
 * @param page 
 * @param groups list of Groups and Communites
 * @returns groupInfoList
 */
export const scrapGroupList = async (page: Page, worker: WorkerType, option: GroupInfoGetOptions, callback?: Function) : Promise < Array <GroupInfo> > => {
    const {
        groupListItemTitleSelector,
        mainTabItemSelector,
        groupTypeSelector,
    } = selectors;

    // first two items are not group or community.
    let index = 3, _groupListInfo : Array <GroupInfo> = groupListInfo;

    let titleList = await getGroupTitleList(page);    

    for (const title of titleList) {
        try {
            // Get group or community title
            console.log('---------------- Group title => ', index, title, '-----------------------');
            
            let group = await getElementByTextFilter(page, groupListItemTitleSelector, title);
            if(group.length) group[0].click();
            else continue;

            // Get group type
            let success = await waitForSelector(page, groupTypeSelector, {timeout: 5000});    
            let type = success ? 'Community' : 'Group';

            let groupInfo: GroupInfo | boolean = false;
            let groupMemberList: MemberInfo[] | boolean;

            if (option.groupInfo) {
                groupInfo = await getGroupInfo(page, worker, title);
                console.log('groupInfo => ', title, groupInfo);
            }
            if (option.member) {
                groupMemberList = await getGroupMemberList(page, worker, title, type);
            }
            if (option.message) {
                await getGroupMessages(page, title, type);
            }
            if(option.media) {
                console.log('Prepairing download medias...');
                await downloadMedias(page, worker, title, type, function(data: any) {
                    if (callback) callback(data);
                });
                console.log('Finished download medias...');
            }

            await delay(1000);
            console.log('groupList => ', title);
            success = await click(page, mainTabItemSelector, { mandatory: true, timeout: 3000 }); // Get out group
            
            // If scraping failed, it will return boolean value
            if (typeof groupInfo == 'boolean' && option.groupInfo) continue;
        } catch (error) {
            console.log('GetGroupsInforError => ', index, error);
            continue;
        }
        index ++;
    }

    return _groupListInfo;
}

export async function getMemberListInfo(
    page: Page, 
    type: string,
    memberCountSelector: string,
) : Promise < Array<MemberInfo> | boolean > {
    const {
        groupMemberSelector,
        memberListScrollSelector,
    } = selectors;
    await click(page, memberCountSelector, {mandatory: true, timeout: 2000});
    let _members: any = [];
    await waitForSelector(page, groupMemberSelector, {mandatory: true, countLimit: 10}, async function(success: boolean) {       
        if (!success) return false;
        _members = await page.evaluate((memberInfoSelector: string) => {
            const membersList = document.querySelectorAll(memberInfoSelector) || [];
    
            return membersList;
        }, groupMemberSelector);
    })

    let prevMembers = null;
    const memberInfoList: MemberInfo[] = [];
    
    console.log('--------------------- member count -------------------\n', _members);
    while (true) {     
        let success = await waitForSelector(page, groupMemberSelector, {})
        if (!success) break;

        let members = await page.$$(groupMemberSelector);
        let memberString = JSON.stringify(members.sort());

        let memberCount = prevMembers == null ? 18 : 15;
        memberCount = Math.min(members.length, memberCount);
        
        if (prevMembers == memberString) break;
        
        for (let index = 0; index < memberCount; index ++) {
            if(prevMembers == null && ((index < 3 && type != "Group") || (index < 2 && type == "Group"))) continue; 
            console.log('index => ', index);
            // get a member
            if (!members[index]) continue;
            let memberInfo = await getMemberInfo(page, members[index]);
            
            await delay(300);
            await members[index].click(); // Close member info    
            if(!memberInfo) continue;
            memberInfoList.push(memberInfo);
        }
        await waitForSelector(page, memberListScrollSelector, {});
        let scrollElement = await page.evaluate((memberListScrollSelector: string) => {
            let scrollElement = document.querySelector(memberListScrollSelector);
            return scrollElement;
        }, memberListScrollSelector);

        let scrollDist = 0;
        if(scrollElement) {
            console.log('Scroll Height => ', scrollElement.scrollHeight);
            scrollDist = scrollElement.scrollHeight / (memberCount / 13); 
            console.log('scroll => ', scrollDist, scrollElement.scrollHeight);
            
            await scroll(page, memberListScrollSelector, scrollDist, "down", {})
            await delay(5000);
        } 
        prevMembers = memberString;
    }

    console.log('member scanning finished!');
    return memberInfoList;
}

export const getMemberInfo = async (page: Page, member: ElementHandle<Element>) => {
    const {
        groupMemberSelectorById,
        groupMemberNameSelector,
        groupMemberInfoListItemTitleSelector,
        groupMemberInfoListItemContentSelector,
    } = selectors;
    await waitForSelector(page, groupMemberSelectorById(4), {
        mandatory: true, 
        countLimit: 10, 
        timeout: 1000
    });
    // const member = members[index];
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

    return memberInfo;
}
