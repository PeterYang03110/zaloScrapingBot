import { ElementHandle, Page } from "puppeteer";
import { selectors, databasePath } from "./constants";
import { click, scroll, waitForSelector } from "./common/puppeteer-utils";
import { delay } from "./common/delay";
import { saveFile, saveImage, saveJsonFile } from "./common/media-utils";
import mediaScript from './common/mediaScript'
import { zaloBrowser } from ".";
import fs from 'fs'
export interface GroupInfo {
    type: string,
    name: string,
    memberCount?: number,
    link?: string,
    admin?: Array<MemberInfo | undefined>,
    owner?: MemberInfo,
    members?: Array<MemberInfo>,
    contents?: Array<any>
}

export interface MemberInfo {
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
export const getGroupListInfo = async (page: Page, groups: Array< ElementHandle<Element> >, option: GroupInfoGetOptions) : Promise < Array <GroupInfo> > => {
    const {
        groupListItemSelectorById,
        groupListItemTitleSelectorById,
        mainTabItemSelector
    } = selectors;

    // first two items are not group or community.
    let index = 3, groupListInfo : Array <GroupInfo> = [];

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

            console.log('---------------- Group title => ', index, title, '-----------------------');
            
            await click(page, groupListItemSelectorById(index), {}); // Get in group
            let groupInfo = await getGroupInfo(page, title, option); // Scraping in group

            await delay(1000);
            
            await click(page, mainTabItemSelector, {mandatory: true, timeout: 3000}); // Get out group
            
            // If scraping failed, it will return boolean value
            if (typeof groupInfo == 'boolean') continue;

            // Save data
            let groupOldInfo = groupListInfo.filter(groupListItemInfo => groupListItemInfo.name == groupInfo.name);
            if(groupOldInfo.length) {
                // Update groupInfo message
                groupInfo.contents = [...(groupOldInfo[0].contents || []), ...(groupInfo.contents || [])];
                // Pop old data
                groupListInfo = groupListInfo.filter(groupListItemINfo => groupListItemINfo.name != groupInfo.name);
                // Push new data
                groupListInfo.push(groupInfo);
            } else {
                groupListInfo.push(groupInfo);
            }
            await saveJsonFile(databasePath(groupInfo.name), groupInfo.name, groupInfo);
                // ? groupListInfo.filter(groupListItemInfo => groupListItemInfo.name == groupInfo.name).length == 0
                //     ? groupListInfo.push(groupInfo)
                //     : groupListInfo = []
                // : null
        } catch (error) {
            console.log('GetGroupsInforError => ', index, error);
            continue;
        }
        index ++;
    }

    return groupListInfo;
}

/**
 * Identify whether it is group or community and then get information a specific group or community. 
 * @param page 
 * @param title group's title. It is difficult to get from here, so get it from outside.
 * @returns groupInfo
 */
async function getGroupInfo(page: Page, title: string, option: GroupInfoGetOptions) : Promise<GroupInfo | boolean> {
    const {
        groupTypeSelector,
        groupMemberCountSelector,
        communityMemberCountSelector,
        groupAvatarSelector,
        groupLinkSelector,
        groupMemberCountBackSelector,
        groupMediaViewAllButtonSelector,
        groupImageSelector,
    } = selectors;

    let memberCountSelector: string = "";
    let memberCount = '0';
    let type = '';
    let memberList: Array<MemberInfo> | boolean;
    
    // Get memberCountSelector
    let success = await waitForSelector(page, groupTypeSelector, {timeout: 5000}, async function(success: boolean) {       
        // determine memberCountSelector whether group or community
        memberCountSelector = success
        ? communityMemberCountSelector
        : groupMemberCountSelector;
    })
    
    // Get Type
    type = success ? 'Community' : 'Group';
    
    let info: GroupInfo = {
        type,
        name: title
    };

    // Get memberCount
    if(option.member) {
        success = await waitForSelector(page, memberCountSelector, {timeout: 2000, mandatory: true}, async function (success: boolean) {
            memberCount = await page.evaluate((memberCountSelector) => {
                let memberCount = document.querySelector(memberCountSelector)?.textContent || '0';
                
                return memberCount;
            }, memberCountSelector);
        })
        if(!success) return false;

        info.memberCount = parseInt(memberCount);
    }
        
    // Get Gruop link
    if (option.groupInfo)  {
        await click(page, groupAvatarSelector, {});
        await waitForSelector(page, groupLinkSelector, {});
        await delay(2000);
        let groupLink = await page.evaluate((groupLinkSelector) => {
            return document.querySelector(groupLinkSelector)?.textContent || '';
        }, groupLinkSelector)
        
        await waitForSelector(page, groupImageSelector, {}, async function (success: boolean) {
            if (!success) return false;
            let link = await page.evaluate((groupImageSelector) => {
                return document.querySelector(groupImageSelector)?.getAttribute("src");
            }, groupImageSelector);
            await saveImage(zaloBrowser, link, title, 'Avatar');
        });
        await click(page, groupAvatarSelector, {});
        
        info.link = groupLink;
    }

    // Get MemberList
    if(option.member) {
        memberList = await getMemberListInfo(page, type, memberCountSelector);
        if(typeof memberList == "boolean") return false;
        console.log('memberList => ', memberList.length,  memberList);

        info.members = memberList;
    }
    
    if(option.media) {
        // Get Medias, Files and Links
        await click(page, groupMemberCountBackSelector, {mandatory: true, timeout: 2000, countLimit: 3});
        // Determin whether Medias, Files, Links are exist or not 
        success = await waitForSelector(page, groupMediaViewAllButtonSelector, {timeout: 3000});
        if(success) {
            await click(page, groupMediaViewAllButtonSelector, {});
            
            await downloadPicturesAndVideos(page, databasePath(title) + '/media');
            await downloadFiles(page, databasePath(title) + '/files');
            // await saveLinks(page);
        }
    }
    
    return info;
}

export async function downloadPicturesAndVideos(page: Page, path: string) {
    const {
        groupPhotoesAndVideosTabSelector,
        groupPhotoesAndVideoPreviewItemSelector,
        groupPhotoesAndVideoDownloadButtonSelector,
        groupPhotoesAndVideoNextButtonSelector,
        groupPhotoesAndVideoItemSelector,
    } = selectors;

    if (!fs.existsSync(path)) {
        fs.mkdirSync(path, { recursive: true });
    }

    const downloads = new Map();
    let downloadResolvers = new Set();
	let eofNextFlag = false;
    
    const waitForDownloadCompletion = () => {
        return new Promise(resolve => downloadResolvers.add(resolve));
    }

    await page.evaluate(mediaScript);
    const client = await page.createCDPSession();

    client.on("Browser.downloadProgress", async function(event: any) {
        if (event.state === "completed") {
            console.log('downloaded!');
        }
    })

    client.on('Browser.downloadWillBegin', (event: any) => {
        if (downloadResolvers.size > 0) {
            downloads.set(event.guid, {
                resolvers: downloadResolvers,
                filename: event.suggestedFilename,
            });
            downloadResolvers = new Set();
        }
    });

    client.on('Browser.downloadProgress', async (event: any) => {
        const { guid } = event;
        console.log("*** ", event.state, " ***", downloads.get(guid)?.filename);
        if (event.state === 'completed' && downloads.has(guid)) {
            const { resolvers, filename } = downloads.get(guid);
            downloads.delete(guid);
            resolvers.forEach((resolve: any) => resolve(filename));
            try {
                await page.waitForSelector(groupPhotoesAndVideoNextButtonSelector, { timeout: 10000 });
                await page.click(groupPhotoesAndVideoNextButtonSelector);
            } catch (ex) {
                eofNextFlag = true;
            }
        }
    });

    // Get in Media Tabs
    let success = await click(page, groupPhotoesAndVideosTabSelector, {});
    if (!success) return null;

    await delay(2000);
    // Get Image list
    await waitForSelector(page, groupPhotoesAndVideoItemSelector, {});
    
    let links = await page.evaluate((groupPhotoesAndVideoItemSelector) => {
        let imgElements = document.querySelectorAll(groupPhotoesAndVideoItemSelector);
        let links: any[] = [];
        imgElements.forEach((imgElement, key) => {
            if(imgElement.getAttribute("src")) links.push(imgElement.getAttribute("src")?.toString());
        })
        return links;
    }, groupPhotoesAndVideoItemSelector);
    
    for (let i  = 0; i < links.length; i ++) {
        let imageFilename = i;
        if(links[i] == null) continue;
        await saveImage(zaloBrowser, links[i], path, imageFilename);
    }

    // Click First Image
    // success = await waitForSelector(page, groupPhotoesAndVideoPreviewItemSelector, {});
    // if (!success) return null;
    // const photoEle = await page.$(groupPhotoesAndVideoPreviewItemSelector);
    // if(photoEle) await photoEle.click();
    // else return null;

    // while (true) {
    //     success = await waitForSelector(page, groupPhotoesAndVideoDownloadButtonSelector, {});
    //     if(!success) return null;
    //     const downloadButtonEle = await page.$(groupPhotoesAndVideoDownloadButtonSelector);
    //     if(!downloadButtonEle) return null;
    
    //     await client.send('Browser.setDownloadBehavior', {
    //         behavior: "allow",
    //         downloadPath: path,
    //         eventsEnabled: true
    //     })
    
    //     const [filename] = await Promise.all([
    //         waitForDownloadCompletion(),
    //         await downloadButtonEle.click(),
    //     ]);
    //     if (eofNextFlag) break;
    // }
    
}

export async function downloadFiles(page: Page, path: string) {
    const {
        groupFilesTabSelector,
        groupFileItemSelector, //define it
        groupFileViewAllButtonSelector
    } = selectors;

    let success = await click(page, groupFilesTabSelector, {});
    if (!success) return null;

    // File search
    success = await waitForSelector(page, groupFileViewAllButtonSelector, {timeout: 5000});
    if (!success) return null;

    let fileViewButtonEle = await page.$(groupFileViewAllButtonSelector);
    if(!fileViewButtonEle) return null;
    let fileName = '';

    await fileViewButtonEle.click();
    await waitForSelector(page, groupFileItemSelector, {});
    let fileElementList = await page.$$(groupFileItemSelector);
    for(let i = 0; i < fileElementList.length; i ++) {
        await saveFile(page, fileElementList[i], path, fileName);
        console.log('File download success!');
    }
}

export async function downloadLinks(page: Page, path: string) {
    
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
        memberListScrollSelector,
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
        // await delay(300);
        // await member.click(); // Close member info
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
    // await scroll(page, memberListScrollSelector, 50, "down", {});

    return memberInfo;
}