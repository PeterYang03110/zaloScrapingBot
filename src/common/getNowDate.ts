export const getNowDate = () => {
	try {
		// Get the current date and time
		const currentTime = new Date();

		// Extract the individual components
		const year = currentTime.getFullYear();
		const month = currentTime.getMonth() + 1; // Months are zero-indexed
		const day = currentTime.getDate();
		const hours = currentTime.getHours();
		const minutes = currentTime.getMinutes();

		// Format the time as a string
		const timeString = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')} ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;

		return timeString;
	} catch { }
}