import { delay } from "./common/delay";
import { newBrowser } from "./new-browser";
import fs from 'fs'
import { readCookieInfo } from "./read-cookie";
import { click, getListItemElements } from "./common/puppeteer-utils";
import { Browser, Page } from "puppeteer";
import {selectors} from './constants'
import { getGroupsAndCommunitiesInfo } from "./getGroupAndCommunitiesInfo";

async function start() {
  // Create browserInstance
  const browserInstance = await newBrowser();
  const {
    groupListItemInfoSelector: groupListItemSelector,
  } = selectors;

  if (browserInstance == false) {
    console.log('Failed to create page.');
    return;
  }
  const {browser, mainPage} = browserInstance;

  // Wait for login and then see group and communities.
  const isInitialized = await initialize(mainPage);
  if (!isInitialized) return;

  const groupList = await getListItemElements(mainPage, groupListItemSelector, {timeout: 10000});
  await getGroupsAndCommunitiesInfo(mainPage, groupList);

  console.log(groupList.length);
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
