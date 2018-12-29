document.getElementById("go").addEventListener("click", e => {
    main();
});
document.addEventListener('keypress', function (e) {
    var key = e.which || e.keyCode;
    if (key === 13) { // 13 is enter
        main();
    }
});

let main = async () => {
    try {
        document.querySelector("#ranks").parentNode.removeChild(document.querySelector("#ranks"));
        document.querySelector("#opr").parentNode.removeChild(document.querySelector("#opr"));
        document.querySelector("#max_score").parentNode.removeChild(document.querySelector("#max_score"));
        document.querySelector("#dpr").parentNode.removeChild(document.querySelector("#dpr"));
    } catch (err) {}
    // document.querySelector(".teamMatchesBody").innerHTML = "";
    document.querySelector(".row").innerHTML = `<div class="event-box"></div>`;
    let teamNum = document.getElementById("teamNum").value;
    // let container = document.querySelector(".row").innerHTML = teamNum;
    let container = document.querySelector(".row").innerHTML;
    let teamData = await axios(
        `https://api.vexdb.io/v1/get_teams?season=Turning Point&team=${teamNum}`
    );
    // console.log(teamData.data.result);
    // console.log(teamData.data.result[0].number);
    if (teamData.data.result.length != 0) {

        let skuList = [];
        document.querySelector(
            ".row"
        ).innerHTML = `<table class="teamDataTable"><tbody>
        <tr><td><strong>Team Number:</strong></td> <td>${
            teamData.data.result[0].number
            }</td></tr>
        <tr><td><strong>Team Name:</strong></td> <td>${
            teamData.data.result[0].team_name
            }</tr>
        <tr><td><strong>Organization:</strong></td> <td>${
            teamData.data.result[0].organisation
            }</td></tr>
        <tr><td><strong>City:</strong></td> <td>${
            teamData.data.result[0].city
            }</td></tr>
        <tr><td><strong>Region/State:</strong></td> <td>${
            teamData.data.result[0].region
            }</td></tr>
        <tr><td><strong>Country:</strong></td> <td>${
            teamData.data.result[0].country
            }</td></tr>
        </tbody></table>`;
        let eventData = await axios(
            `https://api.vexdb.io/v1/get_events?season=Turning Point&team=${teamNum}`
        );
        let div = document.createElement("div");
        div.innerHTML += `<strong>Events this season: </strong><br>`;
        let skuList2 = [];
        for (let i in eventData.data.result) {
            div.innerHTML += `<div class="event">${
                eventData.data.result[i].name
                } (${eventData.data.result[i].sku})</div>`;
            skuList.push(eventData.data.result[i].sku);
            skuList2.push(`${eventData.data.result[i].name}`);
            // document.querySelector(".row").innerHTML += `<div class="event">${eventData.data.result[i].name} (${eventData.data.result[i].sku}) from ${(new Date(eventData.data.result[i].start))} to ${new Date(eventData.data.result[i].end)} at ${eventData.data.result[i].loc_city}, ${eventData.data.result[i].loc_region}<br></div>`;
        }
        document.querySelector(".row").appendChild(div);
        let matchData = await axios(
            `https://api.vexdb.io/v1/get_matches?season=Turning Point&team=${teamNum}`
        );
        let numMatches = 0;
        let numWon = 0;
        for (let i in matchData.data.result) {
            let matchesList = matchData.data.result[i];
            numMatches++;
            if ((teamNum == matchData.data.result[i].red1 || teamNum == matchData.data.result[i].red2) && (matchesList.redscore > matchesList.bluescore)) {
                numWon++;
            } else if ((teamNum == matchData.data.result[i].blue1 || teamNum == matchData.data.result[i].blue2) && (matchesList.redscore < matchesList.bluescore)) {
                numWon++;
            }
        }
        let seasonRatingData = await axios(`https://api.vexdb.io/v1/get_season_rankings?season=Turning Point&team=${teamNum}`);
        seasonRatingData = seasonRatingData.data.result[0];
        document.querySelector(
            ".records"
        ).innerHTML = "<strong style='font-size:1.4rem'>Statistics</strong>";
        document.querySelector(
            ".records"
        ).innerHTML += `<div style='font-size: .9em'><strong>Matches Won: </strong><span>${numWon} / ${numMatches}</span></div>
                        <div style='font-size: .9em'><strong>Success Rate: </strong><span>${((numWon/numMatches) * 100).toFixed(2)}%</span></div>
                        <div style='font-size: .9em'><strong>Season Team Ranking: </strong><span>${seasonRatingData.vrating_rank}</span></div>
                        <div style='font-size: .9em'><strong>Season VRating: </strong><span>${seasonRatingData.vrating.toFixed(2)}</span></div>`
        // for (let i in matchData.data.result) {
        //     let matchesList = matchData.data.result[i];
        //     let color = "";
        //     if (matchesList.redscore > matchesList.bluescore) {
        //         color = "red";
        //     } else if (matchesList.redscore < matchesList.bluescore) {
        //         color = "blue";
        //     } else {
        //         color = "#000";
        //     }
        //     document.querySelector(".teamMatchesBody").innerHTML += `
        //     <tr>
        //         <td style="background-color:${color}">${matchesList.sku}</td>
        //         <td style="background-color:${color}">${matchesList.matchnum}</td>
        //         <td>${matchesList.red1}</td>
        //         <td>${matchesList.red2}</td>
        //         <td>${matchesList.blue1}</td>
        //         <td>${matchesList.blue2}</td>
        //     </tr>`;
        // }
        // document.querySelector(".teamMatches").style.display = "block";
        let opr = [];
        let max_score = [];
        let rank = [];
        let dpr = [];
        let validSKU = [];
        for (let i in skuList) {
            let rankingData = await axios(`https://api.vexdb.io/v1/get_rankings?sku=${skuList[i]}&team=${teamNum}`);
            rankingData = rankingData.data.result[0];
            if (rankingData != undefined) {
                validSKU.push(skuList[i]);
                opr.push(rankingData.opr);
                max_score.push(rankingData.max_score);
                rank.push(rankingData.rank);
                dpr.push(rankingData.dpr);
            }
        }
        validSKU.reverse();
        opr.reverse();
        dpr.reverse();
        max_score.reverse();
        rank.reverse();
        Chart.defaults.global.defaultFontColor = '#FFF';
        document.querySelector(".teamContainer").insertAdjacentHTML("beforeend", `<canvas id="ranks" width="600" height="100"></canvas>
				<canvas id="opr" width="600" height="100"></canvas>
				<canvas id="max_score" width="600" height="100"></canvas>`);
        let ranksCTX = document.getElementById("ranks").getContext('2d');
        let ranksChart = new Chart(ranksCTX, {
            type: 'horizontalBar',
            data: {
                labels: validSKU,
                datasets: [{
                    label: "Rank",
                    data: rank,
                    backgroundColor: "rgba(255, 255, 255, .2)",
                }],
            },
            options: {
                legend: {
                    display: false
                },
                title: {
                    display: true,
                    text: 'Ranks in Past Tournaments'
                },
                scales: {
                    yAxes: [{
                        ticks: {
                            beginAtZero: true
                        }
                    }],
                    xAxes: [{
                        ticks: {
                            beginAtZero: true
                        }
                    }]
                }
            }
        });
        let oprCTX = document.getElementById("opr").getContext('2d');
        let oprChart = new Chart(oprCTX, {
            type: 'line',
            data: {
                labels: validSKU,
                datasets: [{
                    label: "OPR",
                    data: opr,
                    backgroundColor: "rgba(255, 255, 255, .2)",
                }]
            },
            options: {
                legend: {
                    display: false
                },
                title: {
                    display: true,
                    text: 'OPRs in Past Tournaments'
                },
                scales: {
                    yAxes: [{
                        ticks: {
                            beginAtZero: true
                        }
                    }]
                }
            }
        });
        let max_scoreCTX = document.getElementById("max_score").getContext('2d');
        let max_scoreChart = new Chart(max_scoreCTX, {
            type: 'bar',
            data: {
                labels: validSKU,
                datasets: [{
                    label: "Max Score",
                    data: max_score,
                    backgroundColor: "rgba(255, 255, 255, .2)",
                }]
            },
            options: {
                legend: {
                    display: false
                },
                title: {
                    display: true,
                    text: 'Max Scores in Past Tournaments'
                },
                scales: {
                    yAxes: [{
                        ticks: {
                            beginAtZero: true
                        }
                    }]
                }
            }
        });

    } else {
        document.querySelector(".row").innerHTML = "Invalid team, try again.";
    }
}