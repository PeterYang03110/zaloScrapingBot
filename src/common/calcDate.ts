import { differenceInDays, addDays, format } from 'date-fns';
import { ca } from 'date-fns/locale';
import moment from 'moment';

async function calc(day: string) {
	const today = new Date();
	try {
		switch (day.toLowerCase()) {
			case 'today':
				return today;
			case 'yesterday':
				return addDays(today, -1);
			case 'monday':
				return addDays(today, -differenceInDays(today, new Date(today.setDate(today.getDate() - ((today.getDay() + 6) % 7)))));
			case 'tuesday':
				return addDays(today, -differenceInDays(today, new Date(today.setDate(today.getDate() - ((today.getDay() + 5) % 7)))));
			case 'wednesday':
				return addDays(today, -differenceInDays(today, new Date(today.setDate(today.getDate() - ((today.getDay() + 4) % 7)))));
			case 'thursday':
				return addDays(today, -differenceInDays(today, new Date(today.setDate(today.getDate() - ((today.getDay() + 3) % 7)))));
			case 'friday':
				return addDays(today, -differenceInDays(today, new Date(today.setDate(today.getDate() - ((today.getDay() + 2) % 7)))));
			case 'saturday':
				return addDays(today, -differenceInDays(today, new Date(today.setDate(today.getDate() - ((today.getDay() + 1) % 7)))));
			case 'sunday':
				return addDays(today, -differenceInDays(today, new Date(today.setDate(today.getDate() - ((today.getDay() + 0) % 7)))));
			default:
				return null;
		}
	} catch { }
}

export async function converterDate(day: string) {
	const dateStr = day.split("-");
	const date = await calc(dateStr[0].trim());

	if(date) {
		return `${format(date, "yyyy-MM-dd")} ${dateStr[1].trim()}`;
	}
	
	const year = new Date().getFullYear();

	if(dateStr[0].trim().split(",")[1]) {
		return `${format(new Date(dateStr[0].trim()), "yyyy-MM-dd", {})} ${dateStr[1].trim()}`;
	} else {
		return `${format(new Date(`${dateStr[0].trim()}, ${year}`), "yyyy-MM-dd")} ${dateStr[1].trim()}`;
	}
}

export async function converterGMTDate(day: string, timezone: string = '+07:00') { // timezone: +07:00
	try {
		let date = await converterDate(day);
		let editTimeFlag = false;

		if(date.includes("edited")) {
			date = date.replace("edited ", "");
			editTimeFlag = true;
		}
		 // Parse the local time string to a Moment object
		 const localMoment = moment(date);

		 // Convert the local time to GMT+X
		 const gmtMoment = localMoment.utcOffset(timezone);
	   
		 // Format the GMT+X time as a string
		 return gmtMoment.format(`yyyy-MM-DD ${editTimeFlag ? '[edited ]' : ''}HH:mm`);
	} catch(ex) {
		console.log("timezone error: ", ex);
	}
}