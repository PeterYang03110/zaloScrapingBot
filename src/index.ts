import { delay } from "./common/delay";
import { newBrowser } from "./new-browser";
import fs from 'fs'
import { readCookieInfo } from "./read-cookie";
import { click, getListItemElements, waitForSelector } from "./common/puppeteer-utils";
import { Browser, Page } from "puppeteer";
import {selectors} from './constants'
import { getGroupListInfo } from "./getGroupInfo";
import { saveJsonFile } from "./common/media-utils";
import { GroupInfo } from './getGroupInfo'

export type Language = "English" | "Vietnamese"

export let zaloBrowser: Browser;
export let flag = {};
export let groupListInfo : Array<GroupInfo> = [];

async function start() {
  // Create browserInstance
  const browserInstance = await newBrowser();
  const {
    groupListItemSelector,
  } = selectors;

  if (browserInstance == false) {
    console.log('Failed to create page.');
    return;
  }
  const { mainPage, browser } = browserInstance;
  zaloBrowser = browser;

  // Wait for login and then see group and communities.
  const isInitialized = await initialize(mainPage);
  if (!isInitialized) return;

  await setLanguage(mainPage, "English");
  await delay(1000);

  const groupList = await getListItemElements(mainPage, groupListItemSelector, {timeout: 10000});
  groupListInfo = await getGroupListInfo(mainPage, groupList, {
    member: true,
    groupInfo: true,
  });
  await realTimeMessageDetection(mainPage, groupListInfo);
}

async function realTimeMessageDetection(page: Page, groupListInfo: Array<GroupInfo>) {
  const {
    unreadMessageBadgeSelector,
    groupListItemSelector
  } = selectors;
  return new Promise(async (resolve, reject) => {
    setInterval(async () => {
      let success = await waitForSelector(page, unreadMessageBadgeSelector, {});
      if (!success) return;

      const groupList = await getListItemElements(page, groupListItemSelector, {timeout: 10000});
      let groupListInfo = await getGroupListInfo(page, groupList, {
        media: true,
        message: true
      });
    }, 3 * 60 * 1000)
    
  })
}

async function setLanguage(page: Page, language: Language) {
  const {
    settingButtonSelector,
    settingLanguageMenuSeletor,
    settingLanguageItemSelectorById,
  } = selectors;

  await click(page, settingButtonSelector, {});
  await delay(1000);
  await click(page, settingLanguageMenuSeletor, {});
  switch (language) {
    case "Vietnamese":
      await click(page, settingLanguageItemSelectorById(1), {});
      break;

    case "English":
      await click(page, settingLanguageItemSelectorById(2), {});
      break;
  
    default:
      await click(page, settingLanguageItemSelectorById(1), {});
      break;
  }
}

// Wait for login and see group and communities.
async function initialize(mainPage: Page) {
  const {
    mainTabItemSelector,
    menuContactSelector,
  } = selectors;

  let success = await click(mainPage, mainTabItemSelector, {timeout: 10000, mandatory: true, countLimit: 10});
  if (!success) return false;

  success = await click(mainPage, menuContactSelector, {timeout: 500, mandatory: true});
  if(success) console.log("Login Success!");
  else console.log("Login Failed!");
  
  return success;
}
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
// const cookieInfo = await readCookieInfo();  
// const token = cookieInfo.filter((item: any) => item.name == 'zpw_sek') || [];

  // console.log(token);
  
  // await delay(3000);

  // console.log("Cookie set succesfully.");

  // await delay(50000);
  
  // Wait for user to manually log in
  // console.log("Please log in to Zalo...");
  // await delay(50000); // Wait for 5 minutes to log in
  
  // // After login, get cookies
  // const cookies = await mainPage.cookies();

  // // Save cookies to a file or use them directly
  // fs.writeFileSync("zalo-cookies.json", JSON.stringify(cookies, null, 2));

  // console.log("Cookies have been saved to zalo-cookies.json");

  // await browser.close();

start();
