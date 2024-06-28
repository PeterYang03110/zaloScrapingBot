import { ElementHandle, Page } from "puppeteer";
import { selectors, databasePath } from "./constants";
import { click, waitForSelector } from "./common/puppeteer-utils";
import { delay } from "./common/delay";
import { saveJsonFile } from "./common/media-utils";

export interface GroupInfo {
    type: string,
    name: string,
    memberCount: number,
    link: string,
    admin?: Array<MemberInfo | undefined>,
    owner?: MemberInfo,
    members: Array<MemberInfo>,
    contents?: Array<any>
}

export interface MemberInfo {
    avatar?: string,
    name: string,
    gender?: string,
    birthday?: string,
    bio?: string,
    phoneNumber?: string
}

/**
 * Get information list for Groups and Communities such as members, messages ...
 * @param page 
 * @param groups list of Groups and Communites
 * @returns groupInfoList
 */
export const getGroupsAndCommunitiesInfo = async (page: Page, groups: Array< ElementHandle<Element> >) : Promise < Array <GroupInfo> > => {
    const {
        groupListItemSelectorById,
        groupListItemTitleSelectorById,
        mainTabItemSelector
    } = selectors;
    // first two items are not group or community.
    let index = 3, groupInfoList = [];
    for (const group of groups) {
        try {
            // Get group or community title
            let title = '';
            await waitForSelector(page, groupListItemTitleSelectorById(index), {timeout: 2000, mandatory: true}, async function(success: boolean){
                title = await page.evaluate((success, selector) => {
                    if (success) return document.querySelector(selector)?.textContent || 'No title';
                    else return 'No title';
                }, success, groupListItemTitleSelectorById(index))
            })

            await click(page, groupListItemSelectorById(index), {}); // Get in group
            let groupInfo = await getGroupOrCommunityInfo(page, title); // Scraping in group
            await click(page, mainTabItemSelector, {}); // Get out group

            if (typeof groupInfo == 'boolean') continue;            
            // Save data
            await saveJsonFile(databasePath(groupInfo.name), groupInfo.name, groupInfo);
            groupInfoList.push(groupInfo);
        } catch (error) {
            console.log('GetGroupsInforError => ', index, error);
            continue;
        }
        index ++;
    }

    console.log('groupInfo => ', groupInfoList);
    return groupInfoList;
}

/**
 * Identify whether it is group or community and then get information a specific group or community. 
 * @param page 
 * @param title group's title. It is difficult to get from here, so get it from outside.
 * @returns groupInfo
 */
async function getGroupOrCommunityInfo(page: Page, title: string) : Promise<GroupInfo | boolean> {
    const {
        groupTypeSelector,
        groupMemberCountSelector,
        communityMemberCountSelector,
        groupMemberSelectorById,
    } = selectors;
    let info: GroupInfo;
    let memberCountSelector: string = "";
    let memberCount = '0';
    let type = '';
    let memberList: Array<MemberInfo>;

    // Get memberCountSelector
    let success = await waitForSelector(page, groupTypeSelector, {timeout: 5000}, async function(success: boolean) {       
        // determine memberCountSelector whether group or community
        memberCountSelector = success
                            ? communityMemberCountSelector
                            : groupMemberCountSelector;
    })

    // Get Type
    type = success ? 'Community' : 'Group';
                                
    // Get memberCount
    success = await waitForSelector(page, memberCountSelector, {timeout: 2000, mandatory: true}, async function (success: boolean) {
        memberCount = await page.evaluate((memberCountSelector) => {
            let memberCount = document.querySelector(memberCountSelector)?.textContent || '0';
            
            return memberCount;
        }, memberCountSelector);
    })
    if(!success) return false;

    // Get MemberList
    memberList = await getMemberInfoList(page, type, memberCountSelector);
    console.log('memberList => ', memberList);
    

    // Get link
    // success = await waitForSelector(page, memberCountSelector, {timeout: 2000, mandatory: true}, async function (success: boolean) {
    //     memberCount = await page.evaluate((success, name, memberCountSelector) => {
    //         let type = success ? 'Community' : 'Group';    
    //         let memberCount = document.querySelector(memberCountSelector)?.textContent || '0';
            
    //         return memberCount;
    //     }, success, title, memberCountSelector);
    // })
    // if(!success) return false;
    info = {
        memberCount: parseInt(memberCount),
        name: title,
        members: memberList,
        link: '',
        type,
    }
    return info;
}

export async function getMemberInfoList(
    page: Page, 
    type: string,
    memberCountSelector: string
) : Promise < Array<MemberInfo> > {
    const {
        groupMemberSelectorById,
        groupMemberSelector,
        groupMemberNameSelector,
        groupMemberBioSelector,
        groupMemberGenderSelector,
        groupMemberBirthdaySelector,
        groupMemberPhoneNumberSelector
    } = selectors;
    await click(page, memberCountSelector, {mandatory: true, timeout: 2000});

    const members = await page.$$(groupMemberSelector);
    const memberInfoList: MemberInfo[] = [];

    for (let index = 0; index < members.length; index++) {
        if (index < 3) continue;

        const member = members[index];
        await member.click();

        let success = await waitForSelector(page, groupMemberNameSelector, { timeout: 2000, mandatory: true });
        if (!success) continue;

        await waitForSelector(page, groupMemberBioSelector, {});
        await waitForSelector(page, groupMemberGenderSelector, {});
        // if (type == 'Group') await waitForSelector(page, groupMemberPhoneNumberSelector, {});

        const memberInfo: MemberInfo = await page.evaluate((nameSelector, bioSelector, genderSelector, birthdaySelector, phoneNumberSelector) => {
            return {
                name: document.querySelector(nameSelector)?.textContent || '',
                bio: document.querySelector(bioSelector)?.textContent || '',
                gender: document.querySelector(genderSelector)?.textContent || '',
                birthday: document.querySelector(birthdaySelector)?.textContent || '',
                phoneNumber: document.querySelector(phoneNumberSelector)?.textContent || ''
            };
        }, groupMemberNameSelector, groupMemberBioSelector, groupMemberGenderSelector, groupMemberBirthdaySelector, groupMemberPhoneNumberSelector);

        memberInfoList.push(memberInfo);
        await member.click(); // Close member info
    }

    return memberInfoList;
}