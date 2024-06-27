import fs from 'fs';
import { readCookieInfo } from "./read-cookie";

export const saveCookie = async(page: any, worker: any) => {
	try {
		const cookie = await readCookieInfo(); 
		const workerIndex = cookie.findIndex((item: any, index: number) => {
			return item.workerName === worker;
		});
	
		const cookie_info = await page.evaluate((worker: string) => {
			const data = {} as any;
			
			for (let i = 0; i < localStorage.length; i++) {
			  const key = localStorage.key(i);
			  if(key?.includes("auth") || key?.includes("hash")) {
				  const value = localStorage.getItem(key);
				  data[key] = value;
			  }
			}
	
			return Object.assign({ workerName: worker }, data);
		}, worker);
	
		if(workerIndex !== -1) {
			cookie[workerIndex] = cookie_info
		} else {
			cookie.push(cookie_info);
		}
		
		fs.writeFile(`jsonDataBase/CookieData/cookies.json`, JSON.stringify(cookie, null, 4), (err) => {
			if (err) {
				return;
			}
			console.log("Cookie saved to json!")
		});
	} catch (ex) {
		console.log(ex)
	}
}
