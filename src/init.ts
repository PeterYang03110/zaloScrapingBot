import { Page } from "puppeteer";
import { delay } from "./common/delay";
import { click } from "./common/puppeteer-utils";
import { selectors } from "./constants";
import { Language } from ".";

export async function setLanguage(page: Page, language: Language) {
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
export async function initialize(mainPage: Page) {
    const {
        mainTabItemSelector,
        menuContactSelector,
    } = selectors;

    let success = await click(mainPage, mainTabItemSelector, {timeout: 10000, mandatory: true, countLimit: 1000000});
    if (!success) return false;

    success = await click(mainPage, menuContactSelector, {timeout: 500, mandatory: true});
    if(success) console.log("Login Success!");
    else console.log("Login Failed!");

    return success;
}  