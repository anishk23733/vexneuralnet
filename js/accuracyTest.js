document.getElementById("spanTeamNumber").style.display = "none";
console.log("hi")
let a = document.getElementById('dropdown');

a.addEventListener('change', function () {
    if (this.value == "tourn") {
        document.getElementById("spanTournSKU").style.display = "inline-block";
        document.getElementById("spanTeamNumber").style.display = "none";
    } else if (this.value == "team") {
        document.getElementById("spanTournSKU").style.display = "none";
        document.getElementById("spanTeamNumber").style.display = "inline-block";
    }
}, false);

let mainEventListener = async () => {
    document.querySelector(".accuracy-test").style.display = "block";
    document.getElementById("predictionBody").innerHTML = "";
    let net = await loadModel();
    let predictions = [];
    let prediction;
    let matches;
    if (a.value == "tourn") {
        let sku = document.getElementById("tournSKU").value;
        matches = await axios(`https://api.vexdb.io/v1/get_matches?sku=${sku}`);

    } else if (a.value = "team") {
        let teamNum = document.getElementById("teamNumber").value;
        matches = await axios(`https://api.vexdb.io/v1/get_matches?season=Turning Point&team=${teamNum}`);
    }
    matches = matches.data.result;
    let predictedWinner;
    let winner;
    let successFail;
    let successFailColor;
    let successFullPredictions = 0;
    let overallPredictions = 0;
    for (let i in matches) {
        overallPredictions++;
        document.getElementById("status").innerHTML = (`Processing ${parseInt(i)+1} out of ${matches.length} matches...`)
        prediction = await processMatch(net, matches[i].red1, matches[i].red2, matches[i].blue1, matches[i].blue2, false);
        (prediction.red > prediction.blue) ? predictedWinner = "Red Alliance": predictedWinner = "Blue Alliance";
        ((matches[i].redscore > matches[i].bluescore) ? winner = "Red Alliance" : ((matches[i].redscore < matches[i].bluescore) ? winner = "Blue Alliance" : winner = "Tie"))
        if (winner == predictedWinner) {
            successFail = "S";
            successFailColor = 'style="background-color:lime"';
            successFullPredictions++;
        } else {
            successFail = "F";
            successFailColor = 'style="background-color:red"';
        }
        document.getElementById("predictionBody").insertAdjacentHTML("beforeend", `
        <tr>
            <td>${matches[i].sku}</td>
            <td>${matches[i].matchnum}</td>
            <td>${matches[i].red1}</td>
            <td>${matches[i].red2}</td>
            <td>${matches[i].blue1}</td>
            <td>${matches[i].blue2}</td>
            <td>${((prediction.red / (prediction.red + prediction.blue)) * 100).toFixed(2)}%</td>
            <td>${((prediction.blue / (prediction.red + prediction.blue)) * 100).toFixed(2)}%</td>
            <td>${predictedWinner}</td>
            <td>${winner}</td>
            <td ${successFailColor}>${successFail}</td>
        </tr>`);
    }
    document.getElementById("status").innerHTML = (`<div style="font-weight:600;font-size:1.3rem;line-height:1.5"><div>Successful Predictions: ${successFullPredictions} out of ${overallPredictions}</div><div>Success Rate: ${((successFullPredictions / overallPredictions) * 100).toFixed(2)}%</div></div>`)
}

btn.addEventListener('click', (e) => {
    mainEventListener()
})
document.addEventListener('keypress', function (e) {
    var key = e.which || e.keyCode;
    if (key === 13) { // 13 is enter
        mainEventListener()
    }
});