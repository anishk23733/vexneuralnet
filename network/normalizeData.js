let fs = require("fs");
let jsonFile = fs.readFileSync(`./json/trainingDataNOTNormalized.json`)
let json = JSON.parse(jsonFile);

let unorderedArray = [];

for (let i in json) {
    unorderedArray.push(json[i].input.red1, json[i].input.red2, json[i].input.blue1, json[i].input.blue2);
}
let max = (Math.max(...unorderedArray));


for (let i in json) {
    json[i].input.red1 = json[i].input.red1 / max;
    json[i].input.red2 = json[i].input.red2 / max;
    json[i].input.blue1 = json[i].input.blue1 / max;
    json[i].input.blue2 = json[i].input.blue2 / max;
}

json = JSON.stringify(json);
max = JSON.stringify(max);

fs.writeFile(
    "./json/trainingData.json",
    json,
    "utf8",
    error => console.log
);

fs.writeFile(
    "./json/max.json",
    max,
    "utf8",
    error => console.log
);