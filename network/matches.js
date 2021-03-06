const axios = require("axios");
const brain = require("brain.js");
const fs = require("fs");
const path = require("path");

// OPTIONS: [4] 2000 or [6] 3000 [6] Normalized
const HIDDEN_LAYERS = [6];
const TRAINING_SIZE = "Normalized";
let normalizer = 180.05629890815;
// const TRAINING_SIZE = "3000";
// let normalizer = 1;

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
			`https://api.vexdb.io/v1/get_season_rankings?season=Turning Point&team=${data.data.result[i].blue1}`
		);
		if (blueOne.data.result[0] != undefined) {
			blueOne = blueOne.data.result[0].vrating;
		}
		let blueTwo = await axios(
			`https://api.vexdb.io/v1/get_season_rankings?season=Turning Point&team=${data.data.result[i].blue2}`
		);
		if (blueTwo.data.result[0] != undefined) {
			blueTwo = blueTwo.data.result[0].vrating;
		}
		let redOne = await axios(
			`https://api.vexdb.io/v1/get_season_rankings?season=Turning Point&team=${data.data.result[i].red1}`
		);
		if (redOne.data.result[0] != undefined) {
			redOne = redOne.data.result[0].vrating;
		}
		let redTwo = await axios(
			`https://api.vexdb.io/v1/get_season_rankings?season=Turning Point&team=${data.data.result[i].red2}`
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

let processMatch = async (net, red1, red2, blue1, blue2, print = true) => {
	// let normalizer = 1;
	let blueOne = await axios(
		`https://api.vexdb.io/v1/get_season_rankings?season=Turning Point&team=${blue1}`
	);
	let blueTwo = await axios(
		`https://api.vexdb.io/v1/get_season_rankings?season=Turning Point&team=${blue2}`
	);
	let redOne = await axios(
		`https://api.vexdb.io/v1/get_season_rankings?season=Turning Point&team=${red1}`
	);
	let redTwo = await axios(
		`https://api.vexdb.io/v1/get_season_rankings?season=Turning Point&team=${red2}`
	);
	if (
		redOne.data.result[0] != undefined &&
		redTwo.data.result[0] != undefined &&
		blueOne.data.result[0] != undefined &&
		blueTwo.data.result[0] != undefined
	) {
		let result = net.run({
			red1: redOne.data.result[0].vrating / normalizer,
			red2: redTwo.data.result[0].vrating / normalizer,
			blue1: blueOne.data.result[0].vrating / normalizer,
			blue2: blueTwo.data.result[0].vrating / normalizer
		});
		if (print) {
			console.log(result);
		}
		return result;
	} else {
		console.log("Faulty match.");
		return null;
	}
};

// let applyNetwork = getNetwork(100).then((net) => {
//     processMatch(net, "44785B", "40979G", "84710B", "44785C");
// })
let getModelFromTrainingData = () => {
	const net = new brain.NeuralNetwork({
		hiddenLayers: hiddenLayers
	});

	let trainingData = [];
	let appDir = path.dirname(require.main.filename);

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
					// trainingData = JSON.stringify(obj); //convert it back to json
					// console.log(typeof trainingData);
					net.train(trainingData);

					let j = net.toJSON();
					let t = JSON.stringify(j); //brain as string
					fs.writeFile(
						"./json/model.json",
						t,
						"utf8",
						error => console.log
					);

					// TEST
					processMatch(net, "1350Z", "5327R", "824J", "5327B");
				}
			}
		);
	} catch (err) {
		console.log(err);
		fs.readFile(
			appDir + "/json/trainingData.json",
			"utf8",
			async function readFileCallback(err, data) {
				if (err) {
					trainingData = await saveTrainingData(2000);
					console.log("Training data saved.");
				} else {
					trainingData = JSON.parse(data); //now it an object
					// trainingData = JSON.stringify(obj); //convert it back to json
					// console.log(typeof trainingData);
					net.train(trainingData);

					let j = net.toJSON();
					let t = JSON.stringify(j); //brain as string
					fs.writeFile(
						"./json/model.json",
						t,
						"utf8",
						error => console.log
					);

					// TEST
					processMatch(net, "1350Z", "5327R", "824J", "5327B");
				}
			}
		);
	}
};

let loadModel = () => {
	const net = new brain.NeuralNetwork({
		hiddenLayers: HIDDEN_LAYERS
	});
	let appDir = path.dirname(require.main.filename);
	let jsonFile;
	try {
		jsonFile = fs.readFileSync(appDir + `/json/model${TRAINING_SIZE}.json`);
	} catch (err) {
		console.log(error);
		jsonFile = fs.readFileSync(`./json/model${TRAINING_SIZE}.json`);
	}

	const json = JSON.parse(jsonFile);
	net.fromJSON(json);
	return net;
};

let testTeamAccuracy = async team => {
	let net = loadModel();
	let data = await axios(
		`https://api.vexdb.io/v1/get_matches?team=${team}&season=Turning Point`
	);
	let matchCount = 0;
	let accuracyCount = 0;

	let winner = "";
	let predictedWinner = "";
	for (let i = 0; i < data.data.result.length; i++) {
		// console.log("Red: " + data.data.result[i].red1 + " " + data.data.result[i].red2);
		// console.log("Blue: " + data.data.result[i].blue1 + " " +
		// data.data.result[i].blue2);
		if (data.data.result[i].redscore > data.data.result[i].bluescore) {
			// console.log("Winner: Red");
			winner = "red";
		} else if (
			data.data.result[i].redscore < data.data.result[i].bluescore
		) {
			// console.log("Winner: Blue");
			winner = "blue";
		} else {
			// console.log("Tie");
			winner = "none";
		}

		let predictions = await processMatch(
			net,
			data.data.result[i].red1,
			data.data.result[i].red2,
			data.data.result[i].blue1,
			data.data.result[i].blue2,
			false
		);

		if (predictions != null) {
			matchCount++;
			if (predictions["red"] > predictions["blue"]) {
				predictedWinner = "red";
			} else if (predictions["red"] < predictions["blue"]) {
				predictedWinner = "blue";
			} else {
				predictedWinner = "none";
			}

			if (winner == predictedWinner) {
				accuracyCount++;
			}

			// console.log(`${accuracyCount} / ${matchCount} correct.`)
		} else {
			console.log("Match not recorded.");
		}
	}

	console.log(
		"Overall accuracy: " + (accuracyCount / matchCount) * 100 + "%"
	);
};

// let teams = ["5776T", "5327B", "5327R", "5327C", "5327X", "5327S"];

// for (let i in teams) {
// 	testTeamAccuracy(teams[i]).then(() => console.log(teams[i]));
// }

let processTournamentMatch = async (sku, matchNum = 1) => {
	let data;
	let net = await loadModel();
	data = await axios(`https://api.vexdb.io/v1/get_matches?sku=${sku}`);
	// console.log(data.data.result[matchNum - 1].red1, data.data.result[matchNum - 1].red2, data.data.result[matchNum - 1].blue1, data.data.result[matchNum - 1].blue2);
	let result = await processMatch(
		net,
		data.data.result[matchNum - 1].red1,
		data.data.result[matchNum - 1].red2,
		data.data.result[matchNum - 1].blue1,
		data.data.result[matchNum - 1].blue2
	);
	return [
		matchNum,
		data.data.result[matchNum - 1].red1,
		data.data.result[matchNum - 1].red2,
		data.data.result[matchNum - 1].blue1,
		data.data.result[matchNum - 1].blue2,
		result
	];
};

let testTournamentAccuracy = async sku => {
	let data;
	let net = await loadModel();
	let numMatches = 0;
	let numAccurate = 0;

	data = await axios(`https://api.vexdb.io/v1/get_matches?sku=${sku}`);
	let prediction;
	for (let i in data.data.result) {
		prediction = await processMatch(
			net,
			data.data.result[i].red1,
			data.data.result[i].red2,
			data.data.result[i].blue1,
			data.data.result[i].blue2,
			false
		);
		numMatches++;
		if (
			data.data.result[i].redscore > data.data.result[i].bluescore &&
			prediction["red"] > prediction["blue"]
		) {
			numAccurate++;
		} else if (
			data.data.result[i].redscore < data.data.result[i].bluescore &&
			prediction["red"] < prediction["blue"]
		) {
			numAccurate++;
		}
	}
	console.log("Overall accuracy: " + (numAccurate / numMatches) * 100 + "%");
};

let processTournament = async sku => {
	let data;
	let net = await loadModel();
	let predictions = [];
	data = await axios(`https://api.vexdb.io/v1/get_matches?sku=${sku}`);
	if (data.data.result != null) {
		let prediction;
		for (let i in data.data.result) {
			let j = parseInt(i) + 1;
			prediction = await processMatch(
				net,
				data.data.result[i].red1,
				data.data.result[i].red2,
				data.data.result[i].blue1,
				data.data.result[i].blue2,
				false
			);
			predictions.push([
				data.data.result[i].matchnum,
				data.data.result[i].red1,
				data.data.result[i].red2,
				data.data.result[i].blue1,
				data.data.result[i].blue2,
				prediction
			]);
			document.getElementById(
				"status"
			).innerText = `Processing ${j} of ${data.data.result.length}...`;
			// console.log(predictions);
		}
		document.getElementById("status").innerText = ``;
		return predictions;
	}
	return null;
};
let processRanking = async sku => {
	document.getElementById("rankingsTable").innerHTML = "";

	let data;
	let net = await loadModel();
	let teamData = await axios(`https://api.vexdb.io/v1/get_teams?sku=${sku}`);
	let wins = {};
	let losses = {};
	for (let i in teamData.data.result) {
		wins[teamData.data.result[i].number] = 0;
		losses[teamData.data.result[i].number] = 0;
	}
	// for (let i in teamData.data.results)
	console.log(teamData);
	data = await axios(`https://api.vexdb.io/v1/get_matches?sku=${sku}`);
	if (data.data.result != null) {
		let prediction;
		for (let i in data.data.result) {
			let j = parseInt(i) + 1;
			prediction = await processMatch(
				net,
				data.data.result[i].red1,
				data.data.result[i].red2,
				data.data.result[i].blue1,
				data.data.result[i].blue2,
				false
			);
			document.getElementById(
				"status"
			).innerText = `Processing ${j} of ${data.data.result.length} matches...`;
			if (prediction.red > prediction.blue) {
				wins[data.data.result[i].red1]++;
				wins[data.data.result[i].red2]++;
				losses[data.data.result[i].blue1]++;
				losses[data.data.result[i].blue2]++;
			} else if (prediction.red < prediction.blue) {
				wins[data.data.result[i].blue1]++;
				wins[data.data.result[i].blue2]++;
				losses[data.data.result[i].red1]++;
				losses[data.data.result[i].red2]++;
			}
		}

		var sortable = [];
		for (var team in wins) {
			sortable.push([team, wins[team]]);
		}
		sortable.sort(function(a, b) {
			return b[1] - a[1];
		});

		for (let i in sortable) {
			document
				.getElementById("rankingsTable")
				.insertAdjacentHTML(
					"beforeend",
					`<tr><td>${parseInt(i) + 1}</td><td>${
						sortable[i][0]
					}</td><td>${wins[sortable[i][0]]}</td><td>${
						losses[sortable[i][0]]
					}</td></tr>`
				);
		}
		console.log(sortable);
		console.log(wins);
		console.log(losses);
		document.getElementById("status").innerText = ``;
	}
	return null;
};
let processTeamMatches = async (sku, team) => {
	let data;
	let net = await loadModel();
	let predictions = [];
	data = await axios(
		`https://api.vexdb.io/v1/get_matches?sku=${sku}&team=${team}`
	);
	// console.log(data);
	if (data.data.result != null) {
		let prediction;
		let numWon = 0;
		let numPlayed = 0;
		for (let i in data.data.result) {
			// console.log(data.data.result[i])

			// console.log(data.data.result[i]);
			let j = parseInt(i) + 1;
			numPlayed++;
			prediction = await processMatch(
				net,
				data.data.result[i].red1,
				data.data.result[i].red2,
				data.data.result[i].blue1,
				data.data.result[i].blue2,
				false
			);
			predictions.push([
				data.data.result[i].matchnum,
				data.data.result[i].red1,
				data.data.result[i].red2,
				data.data.result[i].blue1,
				data.data.result[i].blue2,
				prediction
			]);
			document.getElementById(
				"status"
			).innerText = `Processing ${j} of ${data.data.result.length}...`;
			// console.log(prediction);
			if (prediction != null) {
				if (
					team == data.data.result[i].red1 ||
					team == data.data.result[i].red2
				) {
					if (prediction.red > prediction.blue) {
						numWon++;
					}
				} else if (
					team == data.data.result[i].blue1 ||
					team == data.data.result[i].blue2
				) {
					if (prediction.blue > prediction.red) {
						numWon++;
					}
				}
			}
			// console.log(predictions);
		}
		document.getElementById("status").innerText = ``;
		return [predictions, numWon, numPlayed];
	}
	return null;
};

// let main = async () => {
// 	testTournamentAccuracy("RE-VRC-18-6170");
// }
