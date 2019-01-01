const axios = require("axios");
const brain = require("brain.js");
const fs = require("fs");
const path = require("path");
const stringify = require("json-stringify-safe");

const saveTrainingData = async DATASET => {
	let getData = await axios(
		"https://api.vexdb.io/v1/get_matches?season=Turning Point&nodata=true"
	);
	let size = getData.data.size;
	// for (let i = 0; i < (size / 5000); i++) {
	//     let data = await axios(`https://api.vexdb.io/v1/get_matches?season=Turning Point&limit_start=${5000 * i}`);
	//     console.log(data.data.result);
	// }
	let trainingData = [];

	let data = await axios(
		`https://api.vexdb.io/v1/get_matches?season=Turning Point&limit_start=${80}&limit_number=${DATASET}`
	);
	// console.log(data.data.result);
	for (let i = 0; i < data.data.result.length; i++) {
		let matchResults;
		if (data.data.result[i].redscore > data.data.result[i].bluescore) {
			matchResults = {
				red: 1,
				blue: 0
			};
		} else if (
			data.data.result[i].redscore < data.data.result[i].bluescore
		) {
			matchResults = {
				red: 0,
				blue: 1
			};
		} else {
			matchResults = {
				red: 1,
				blue: 1
			};
		}

		// let matchResults = {
		//     red: data.data.result[i].redscore,
		//     blue: data.data.result[i].bluescore
		// };

		let blueOne = await axios(
			`https://api.vexdb.io/v1/get_season_rankings?season=Turning Point&team=${
				data.data.result[i].blue1
			}`
		);
		if (blueOne.data.result[0] != undefined) {
			blueOne = blueOne.data.result[0].vrating;
		}
		let blueTwo = await axios(
			`https://api.vexdb.io/v1/get_season_rankings?season=Turning Point&team=${
				data.data.result[i].blue2
			}`
		);
		if (blueTwo.data.result[0] != undefined) {
			blueTwo = blueTwo.data.result[0].vrating;
		}
		let redOne = await axios(
			`https://api.vexdb.io/v1/get_season_rankings?season=Turning Point&team=${
				data.data.result[i].red1
			}`
		);
		if (redOne.data.result[0] != undefined) {
			redOne = redOne.data.result[0].vrating;
		}
		let redTwo = await axios(
			`https://api.vexdb.io/v1/get_season_rankings?season=Turning Point&team=${
				data.data.result[i].red2
			}`
		);
		if (redTwo.data.result[0] != undefined) {
			redTwo = redTwo.data.result[0].vrating;

			trainingData.push({
				input: {
					red1: redOne,
					red2: redTwo,
					blue1: blueOne,
					blue2: blueTwo
				},
				output: matchResults
			});
			console.log(i + 1 + " / " + DATASET);
		}
	}

	json = JSON.stringify(trainingData);
	fs.writeFile(
		"./json/trainingData.json",
		json,
		"utf8",
		error => console.log
	);
};

let overallRandomNums = [];
let saveRandomTrainingData = async (DATASET, ID) => {
	let getData = await axios(
		"https://api.vexdb.io/v1/get_matches?season=Turning Point&nodata=true"
	);
	let size = getData.data.size;
	let randomNum;
	let usedRandomNums = [];
	let trainingData = [];
	for (let i = 0; i < DATASET; i++) {
		randomNum = Math.floor(Math.random() * size);
		while (overallRandomNums.includes(randomNum)) {
			randomNum = Math.floor(Math.random() * size);
			console.log("Generated duplicate, fixing...");
		}
		overallRandomNums.push(randomNum);
		let data = await axios(
			`https://api.vexdb.io/v1/get_matches?season=Turning Point&limit_start=${randomNum}&limit_number=1`
		);
		let matchResults;
		if (data.data.result[0].redscore > data.data.result[0].bluescore) {
			matchResults = {
				red: parseInt(1),
				blue: parseInt(0)
			};
		} else if (
			data.data.result[0].redscore < data.data.result[0].bluescore
		) {
			matchResults = {
				red: parseInt(0),
				blue: parseInt(1)
			};
		} else {
			matchResults = {
				red: parseInt(1),
				blue: parseInt(1)
			};
		}

		// let matchResults = {
		//     red: data.data.result[i].redscore,
		//     blue: data.data.result[i].bluescore
		// };

		let blueOne = await axios(
			`https://api.vexdb.io/v1/get_season_rankings?season=Turning Point&team=${
				data.data.result[0].blue1
			}`
		);
		if (blueOne.data.result[0] != undefined) {
			blueOne = blueOne.data.result[0].vrating;
		}
		let blueTwo = await axios(
			`https://api.vexdb.io/v1/get_season_rankings?season=Turning Point&team=${
				data.data.result[0].blue2
			}`
		);
		if (blueTwo.data.result[0] != undefined) {
			blueTwo = blueTwo.data.result[0].vrating;
		}
		let redOne = await axios(
			`https://api.vexdb.io/v1/get_season_rankings?season=Turning Point&team=${
				data.data.result[0].red1
			}`
		);
		if (redOne.data.result[0] != undefined) {
			redOne = redOne.data.result[0].vrating;
		}
		let redTwo = await axios(
			`https://api.vexdb.io/v1/get_season_rankings?season=Turning Point&team=${
				data.data.result[0].red2
			}`
		);
		if (redTwo.data.result[0] != undefined) {
			redTwo = redTwo.data.result[0].vrating;

			trainingData.push({
				input: {
					red1: parseFloat(redOne),
					red2: parseFloat(redTwo),
					blue1: parseFloat(blueOne),
					blue2: parseFloat(blueTwo)
				},
				output: matchResults
			});
			console.log(i + 1 + " / " + DATASET);
		}
	}
	// console.log(trainingData);
	json = stringify(trainingData);
	// console.log(json);
	fs.writeFile(
		`./json/trainingData${ID}.json`,
		json,
		"utf8",
		error => console.log
	);
};

// saveRandomTrainingData(500, "1").catch(console.log);
// saveRandomTrainingData(500, "2").catch(console.log);
// saveRandomTrainingData(500, "3").catch(console.log);
// saveRandomTrainingData(500, "4").catch(console.log);
// saveRandomTrainingData(500, "5").catch(console.log);
// saveRandomTrainingData(500, "6").catch(console.log);
const HIDDEN_LAYERS = [6, 3];
let getModelFromTrainingData = () => {
	const net = new brain.NeuralNetwork({ hiddenLayers: HIDDEN_LAYERS });
	let trainingData = [];
	fs.readFile(
		"./json/trainingData.json",
		"utf8",
		async function readFileCallback(err, data) {
			if (err) {
				trainingData = await saveTrainingData(2000);
				console.log("Training data saved.");
			} else {
				trainingData = JSON.parse(data); //now it an object
				// trainingData = JSON.stringify(obj); //convert it back to json
				// console.log(typeof trainingData);
				// net.train();
				net.train(trainingData, {
					// errorThresh: 0.05, // error threshold to reach before completion
					// iterations: 100000, // maximum training iterations
					iterations: 20000, // maximum training iterations
					log: true, // console.log() progress periodically
					logPeriod: 10, // number of iterations between logging
					learningRate: 0.001 // learning rate
				});

				// console.log(net.train(trainingData));

				let j = net.toJSON();
				let t = JSON.stringify(j); //brain as string
				fs.writeFile(
					"./json/model.json",
					t,
					"utf8",
					error => console.log
				);

				// TEST
				// processMatch(net, "1350Z", "5327R", "824J", "5327B");
			}
		}
	);
};

getModelFromTrainingData();
