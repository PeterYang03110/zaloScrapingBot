export  const delay = async(time: number) => {
	return new Promise(resolve => {
		setTimeout(resolve, time); // Adjust the delay time as needed (3000 milliseconds = 3 seconds)
	});
}