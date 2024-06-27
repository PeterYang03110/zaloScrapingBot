import fs from 'fs';
export const readCookieInfo = async () => {
	try {
		const cookie_dir_path = `jsonDataBase/CookieData`;

		if (!fs.existsSync(cookie_dir_path)) {
			fs.mkdirSync(cookie_dir_path, { recursive: true });
			fs.writeFileSync('jsonDataBase/CookieData/cookies.json', '[]', 'utf-8');
		}

		const jsonData = fs.readFileSync('jsonDataBase/CookieData/cookies.json', 'utf-8');
        return await JSON.parse(jsonData);
	} catch(ex) { console.log(ex)}
}