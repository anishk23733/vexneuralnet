const axios = require("axios");
const brain = require("brain.js");
const fs = require('fs');


const hiddenLayers = [4];

const saveTrainingData = async (DATASET) => {
    let getData = await axios("https://api.vexdb.io/v1/get_matches?season=Turning Point&nodata=true");
    let size = (getData.data.size);
    // for (let i = 0; i < (size / 5000); i++) {
    //     let data = await axios(`https://api.vexdb.io/v1/get_matches?season=Turning Point&limit_start=${5000 * i}`);
    //     console.log(data.data.result);
    // }
    let trainingData = [];

    let data = await axios(`https://api.vexdb.io/v1/get_matches?season=Turning Point&limit_start=${80}&limit_number=${DATASET}`);
    // console.log(data.data.result);
    for (let i = 0; i < data.data.result.length; i++) {
        let matchResults;
        if (data.data.result[i].redscore > data.data.result[i].bluescore) {
            matchResults = {
                red: 1,
                blue: 0
            };
        } else if (data.data.result[i].redscore < data.data.result[i].bluescore) {
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

        let blueOne = await axios(`https://api.vexdb.io/v1/get_season_rankings?season=Turning Point&team=${data.data.result[i].blue1}`);
        if (blueOne.data.result[0] != undefined) {
            blueOne = (blueOne.data.result[0].vrating);
        }
        let blueTwo = await axios(`https://api.vexdb.io/v1/get_season_rankings?season=Turning Point&team=${data.data.result[i].blue2}`);
        if (blueTwo.data.result[0] != undefined) {
            blueTwo = (blueTwo.data.result[0].vrating);
        }
        let redOne = await axios(`https://api.vexdb.io/v1/get_season_rankings?season=Turning Point&team=${data.data.result[i].red1}`);
        if (redOne.data.result[0] != undefined) {
            redOne = (redOne.data.result[0].vrating);
        }
        let redTwo = await axios(`https://api.vexdb.io/v1/get_season_rankings?season=Turning Point&team=${data.data.result[i].red2}`);
        if (redTwo.data.result[0] != undefined) {
            redTwo = (redTwo.data.result[0].vrating);

            trainingData.push({
                input: {
                    red1: redOne,
                    red2: redTwo,
                    blue1: blueOne,
                    blue2: blueTwo
                },
                output: matchResults
            });
            console.log((i + 1) + " / " + DATASET);
        }
    }

    json = JSON.stringify(trainingData);
    fs.writeFile('./json/trainingData.json', json, 'utf8', (error) => console.log);

}

let processMatch = async (net, red1, red2, blue1, blue2, print = true) => {
    let blueOne = await axios(`https://api.vexdb.io/v1/get_season_rankings?season=Turning Point&team=${blue1}`);
    let blueTwo = await axios(`https://api.vexdb.io/v1/get_season_rankings?season=Turning Point&team=${blue2}`);
    let redOne = await axios(`https://api.vexdb.io/v1/get_season_rankings?season=Turning Point&team=${red1}`);
    let redTwo = await axios(`https://api.vexdb.io/v1/get_season_rankings?season=Turning Point&team=${red2}`);
    if (redOne.data.result[0] != undefined && redTwo.data.result[0] != undefined && blueOne.data.result[0] != undefined && blueTwo.data.result[0] != undefined) {
        let result = (net.run({
            red1: redOne.data.result[0].vrating,
            red2: redTwo.data.result[0].vrating,
            blue1: blueOne.data.result[0].vrating,
            blue2: blueTwo.data.result[0].vrating
        }));
        if (print) {
            console.log(result);
        }
        return (result);
    } else {
        console.log("Faulty match.");
        return null;
    }
}

// let applyNetwork = getNetwork(100).then((net) => {
//     processMatch(net, "44785B", "40979G", "84710B", "44785C");
// })
let getModelFromTrainingData = () => {
    const net = new brain.NeuralNetwork({
        hiddenLayers: hiddenLayers
    });

    let trainingData = [];

    fs.readFile('./json/trainingData.json', 'utf8', async function readFileCallback(err, data) {
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
            fs.writeFile('./json/model.json', t, 'utf8', (error) => console.log);

            // TEST
            processMatch(net, "1350Z", "5327R", "824J", "5327B");
        }
    });
}

let loadModel = () => {
    const net = new brain.NeuralNetwork();
    const jsonFile = fs.readFileSync('./json/model.json');
    const json = JSON.parse(jsonFile);
    net.fromJSON(json);
    return net;
}

let testAccuracy = async (team) => {
    let net = loadModel();
    let data = await axios(`https://api.vexdb.io/v1/get_matches?team=${team}&season=Turning Point`);
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
        } else if (data.data.result[i].redscore < data.data.result[i].bluescore) {
            // console.log("Winner: Blue");
            winner = "blue";
        } else {
            // console.log("Tie");
            winner = "none";
        }

        let predictions = await processMatch(net, data.data.result[i].red1, data.data.result[i].red2, data.data.result[i].blue1, data.data.result[i].blue2, false);

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

    console.log("Overall accuracy: " + ((accuracyCount / matchCount) * 100) + "%")
}

// let teams = ["5327B", "5327R", "5327C", "5327X", "5327S"];

// for (let i in teams) {
//     testAccuracy(teams[i]).then(() => console.log(teams[i]));
// }