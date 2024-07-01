import fs from "fs"
import { GroupInfo } from "../getGroupAndCommunitiesInfo";

export const saveJsonFile = async (path: string, filename: string, data: GroupInfo) : Promise<boolean> => {
    try {
		// Convert the data to a JSON string
		const jsonString = JSON.stringify(data, null, 2);

        // If not exist, create directory
        if (!fs.existsSync(path)) {
            fs.mkdirSync(path, { recursive: true });
        }
        
        // Write the JSON string to a file
        fs.writeFile(`${path}/${filename}.json`, jsonString, (err) => {
            if (err) {
                console.error('Error writing file:', err);
                return;
            }
            console.log('JSON data saved to file.');
        })

		return true;
	} catch (err) { console.log(err); return false; }
}

export async function saveImage(browser: any, param: any, gid: any, sid: any) {
	return new Promise(async (resolve) => {
		const page = await browser.newPage();
		try {
			if (param != null) {
				let dir = `jsonDataBase/GroupAndChannelData/${gid}/media/avatars`;
				var viewSource = await page.goto(param);
				await page.waitForSelector(`img[src^='blob']`);
				if (!fs.existsSync(dir)) {
					fs.mkdirSync(dir, { recursive: true });
				}
				fs.writeFile(`${dir}/${sid}.png`, await viewSource.buffer(), function (err) {
					if (err) {
						return console.log(err);
					}
				});
			}
		}
		catch (ex) { }
		await page.close();
		resolve(true);
	});
}