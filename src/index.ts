import { delay } from "./common/delay";
import { newBrowser } from "./new-browser";
import { click, getListItemElements, waitForSelector } from "./common/puppeteer-utils";
import { Browser, Page } from "puppeteer";
import {selectors} from './constants'
import { GroupInfoGetOptions, scrapGroupList } from "./scrapGroupList";
import { GroupInfo } from './scrapGroupList';
import { runParallelScrapers } from './worker'
import { initialize, setLanguage } from "./init";
export let downloadFileListFlag : Array <any> = [];

export interface ZaloBrowser {
  media?: Browser,
  message?: Browser,
  groupInfo?: Browser,
  member?: Browser
}

export type WorkerType = "groupInfo" | "member" | "message" | "media";
export type Language = "English" | "Vietnamese";
export let zaloBrowser: ZaloBrowser = {};
export let flag = {};
export let groupListInfo : Array<GroupInfo> = [];

let workers = [
  // 'groupInfo',
  'member',
  // 'media',
  // 'message',
]

runParallelScrapers(workers, workers.length, function(worker: string){
  switch (worker) {
    case 'groupInfo':
      start(worker, { 
        groupInfo: true 
      });
      break;
    case 'member':
      start(worker, {
        member: true
      });
      break;
    case 'media':
      start(worker, {
        media: true
      });
      break;
    case 'message':
      start(worker, {
        message: true
      });
    default:
      break;
  }
});

async function start(worker: WorkerType, option: GroupInfoGetOptions) {
  // Create browserInstance
  console.log('worker console => ', worker)
  const browserInstance = await newBrowser();
  const {
    groupListItemSelector,
  } = selectors;

  if (browserInstance == false) {
    console.log('Failed to create page.');
    return;
  } 
  const { mainPage, browser } = browserInstance;
  zaloBrowser[worker] = browser;

  // Wait for login and then see group and communities.
  const isInitialized = await initialize(mainPage);
  if (!isInitialized) return;

  await setLanguage(mainPage, "English");
  await delay(1000);
  console.log('worker => ', worker);
  
  if (option.message || option.media) {
    while(true) {
      // const groupList = await getListItemElements(mainPage, groupListItemSelector, {timeout: 10000});
      groupListInfo = await scrapGroupList(mainPage, worker, option, function(data: any) {
        downloadFileListFlag = data;
        console.log('download file list => ', downloadFileListFlag);
      });
      // Wait for 1 min.
      await delay(10000);
      console.log('search again');
    }
  } else {
    // const groupList = await getListItemElements(mainPage, groupListItemSelector, {timeout: 10000});
    groupListInfo = await scrapGroupList(mainPage, worker, option);
  }
}
