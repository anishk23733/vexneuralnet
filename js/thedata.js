const axios = require("axios");
let readAndDisplay = () => {
	try {
		fs.readFile(
			"./json/trainingData.json",
			"utf8",
			async function readFileCallback(err, data) {
				if (err) {
					trainingData = await saveTrainingData(2000);
					console.log("Training data saved.");
				} else {
					trainingData = JSON.parse(data); //now it an object
					console.log(trainingData);
				}
			}
		);
	} catch (err) {
		console.log(err);
		fs.readFile(
			appDir + "/json/trainingData.json",
			"utf8",
			async function readFileCallback(err, data) {
				trainingData = JSON.parse(data); //now it an object
			}
		);
	}
};

let collectData = async () => {
	let data = await axios(
		"https://api.vexdb.io/v1/get_matches?season=Turning Point"
	);
	console.log(data.data.result);
	data.data.result.forEach(element => {
		console.log(
			`${element.red1} and ${element.red2} vs ${element.blue1} and ${
				element.blue2
			}`
		);
	});
	// Array.prototype.data.forEach(element => {
	// 	console.log(element);
	// });
};

collectData();
