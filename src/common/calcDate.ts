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
export function stringToDate(dateString: string) {
	// Get today's date without time
	let today = new Date();
	today.setHours(0, 0, 0, 0);
  
	// Helper function to format the date as YYYY-MM-DD
	function formatDate(date: Date) {
	  let year = date.getFullYear();
	  let month = (date.getMonth() + 1).toString().padStart(2, '0'); // Months are zero-based
	  let day = date.getDate().toString().padStart(2, '0');
	  return `${year}-${month}-${day}`;
	}
  
	// Helper function to get the date for a specific weekday
	function getWeekdayDate(weekday: string) {
	  const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
	  const targetDay = daysOfWeek.indexOf(weekday);
	  if (targetDay === -1) return null; // Invalid weekday
  
	  let currentDay = today.getDay();
	  let difference = targetDay - currentDay;
  
	  if (difference < 0) {
		difference += 7; // Go to the next week
	  }
  
	  let resultDate = new Date(today);
	  resultDate.setDate(today.getDate() + difference);
	  resultDate.setHours(0, 0, 0, 0); // Ensure time is 00:00:00
	  return resultDate;
	}
  
	// Check the input string and calculate the date
	switch (dateString.toLowerCase()) {
	  case "today":
		return formatDate(today);
	  case "yesterday":
		let yesterday = new Date(today);
		yesterday.setDate(today.getDate() - 1);
		yesterday.setHours(0, 0, 0, 0); // Ensure time is 00:00:00
		return formatDate(yesterday);
	  default:
		let dayString = dateString.split(' ')[1];
		return dayString;
		// Capitalize the first letter for weekday matching
		// let capitalizedString = dateString.charAt(0).toUpperCase() + dateString.slice(1).toLowerCase();
		// let weekdayDate = getWeekdayDate(capitalizedString);
		// return weekdayDate ? formatDate(weekdayDate) : null;
	}
}
  
  
  