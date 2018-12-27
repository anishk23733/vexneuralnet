const getTeams = async () => {
	let getData = await axios("https://api.vexdb.io/v1/get_teams?program=VRC&country=United States&region=California&nodata=true");
	// let getData = await axios("https://api.vexdb.io/v1/get_teams?program=VRC&country=United States&nodata=true");
	let maxSize = getData.data.size;

	const count = Math.floor(maxSize / 5000) + 1;
	// console.log(count);
	let allData = [];
	let limit_start = 1; // Modified later


	let data;
	for (let i = 0; i < count; i++) {

		const fullURL = `https://api.vexdb.io/v1/get_teams?program=VRC&country=United States&region=California&limit_start=${limit_start}`;
		// const fullURL = `https://api.vexdb.io/v1/get_teams?program=VRC&country=United States&limit_start=${limit_start}`;

		getData = await axios(fullURL);
		data = getData.data.result;
		data.forEach(result => {
			allData.push(result);
		});
		limit_start += 5000;
	}
	localStorage.setItem('data', JSON.stringify(allData));
	return allData;
};


const main = async () => {
	let teamData = await getTeams();
	for (let i in teamData) {
		var dataRow = document.createElement("tr");
		dataRow.insertAdjacentHTML("afterbegin", `<td id="teamNum">${teamData[i].number}</td><td id="teamName">${teamData[i].team_name}</td><td id="organization">${teamData[i].organisation}</td><td id="city">${teamData[i].city}</td><td id="region">${teamData[i].region}</td>`)
		console.log(teamData[i]);
		document.getElementById("team_table").appendChild(dataRow);
	}
}

main();