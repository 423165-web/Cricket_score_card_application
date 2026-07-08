document.addEventListener("DOMContentLoaded", () => { //NOSONAR
    const matchData = localStorage.getItem("match");

    if (!matchData) {
        document.body.innerHTML = "<h1>No match data found.</h1>";
        return;
    }

    let match = JSON.parse(matchData);
    const scorecardContainer = document.getElementById("scorecard-container");

    function generateBowlingTable(bowlingFigures) {
        if (!bowlingFigures || Object.keys(bowlingFigures).length === 0) return '';
        return `
            <div class="bowling-scorecard">
                <table>
                    <thead><tr><th>Bowler</th><th>Overs</th><th>Runs</th><th>Wickets</th></tr></thead>
                    <tbody>
                        ${Object.entries(bowlingFigures).map(([name, stats]) => `
                            <tr>
                                <td>${name.split(' (')[0]}</td>
                                <td>${stats.overs.toFixed(1)}</td>
                                <td>${stats.runs}</td>
                                <td>${stats.wickets}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>`;
    }

    function generateInningsCard(inningsData, teamName) {
        if (!inningsData) return '';

        const allPlayers = [...inningsData.batsmen, ...inningsData.outBatsmen];
        return `
            <div class="innings-card">
                <div class="innings-header">
                    <h2>${teamName}</h2>
                    <span class="score">${inningsData.score} / ${inningsData.wickets} (${inningsData.overs.toFixed(1)} Overs)</span>
                </div>
                <div class="batting-scorecard">
                    <table>
                        <thead>
                            <tr>
                                <th>Batsman</th>
                                <th>Runs</th>
                                <th>Balls</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${allPlayers.map(p => `
                                <tr>
                                    <td data-player-name="${p.name}">
                                        <div class="batsman-name-container">
                                            <span class="batsman-name">${p.name.split(' (')[0]}</span>
                                            <span class="edit-player-btn" title="Edit player name">✏️</span>
                                        </div>
                                        <div class="dismissal">${p.dismissal || 'not out'}</div>
                                    </td>
                                    <td>${p.runs}</td>
                                    <td>${p.balls}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
                <div class="fow">
                    <strong>Fall of Wickets:</strong> ${inningsData.outBatsmen.map((b, i) => `${i+1}-${b.scoreAtWicket} (${b.name.split(' (')[0]})`).join(', ')}
                </div>
                ${generateBowlingTable(inningsData.bowlingFigures)}
            </div>
        `;
    }

    renderScorecards();

    // Determine winner and display result
    const resultEl = document.getElementById("matchResult");
    let winner, margin;
    if (match.innings2.score > match.innings1.score) {
        winner = match.innings2.battingTeam;
        margin = `${10 - match.innings2.wickets} wickets`;
    } else {
        winner = match.innings1.battingTeam;
        margin = `${match.innings1.score - match.innings2.score} runs`;
    }
    resultEl.textContent = `${winner} won by ${margin}`;

    // --- Awards (Simplified Logic) ---
    const allInnings = [match.innings1, match.innings2].filter(Boolean);
    let highestScorer = { name: '', runs: -1 };
    let bestBowler = { name: '', wickets: -1, runs: Infinity };

    allInnings.forEach(inn => {
        const allBatsmen = [...inn.batsmen, ...inn.outBatsmen];
        allBatsmen.forEach(p => {
            if (p.runs > highestScorer.runs) {
                highestScorer = { name: p.name.split(' (')[0], runs: p.runs, balls: p.balls };
            }
        });

        Object.entries(inn.bowlingFigures).forEach(([name, stats]) => {
            if (stats.wickets > bestBowler.wickets) {
                bestBowler = { name: name.split(' (')[0], ...stats };
            } else if (stats.wickets === bestBowler.wickets && stats.runs < bestBowler.runs) {
                bestBowler = { name: name.split(' (')[0], ...stats };
            }
        });
    });

    // For simplicity, Player of the Match is the highest scorer
    document.getElementById('potm').textContent = highestScorer.name;
    document.getElementById('highestScorer').textContent = `${highestScorer.name} - ${highestScorer.runs} (${highestScorer.balls})`;
    document.getElementById('bestBowler').textContent = bestBowler.name ?
        `${bestBowler.name} - ${bestBowler.wickets}/${bestBowler.runs}` : "N/A";


    function updatePlayerNameInMatch(oldFullName, newName) {
        const teamName = oldFullName.substring(oldFullName.indexOf('(') + 1, oldFullName.indexOf(')'));
        const oldName = oldFullName.split(' (')[0];
        const newFullName = `${newName} (${teamName})`;

        // Update team player lists
        if (match.team1 === teamName) {
            match.team1Players = match.team1Players.map(p => p === oldName ? newName : p);
        } else if (match.team2 === teamName) {
            match.team2Players = match.team2Players.map(p => p === oldName ? newName : p);
        }

        // Update innings data
        [match.innings1, match.innings2].forEach(innings => {
            if (innings) {
                // Update batsmen on crease
                innings.batsmen.forEach(p => {
                    if (p.name === oldFullName) p.name = newFullName;
                });
                // Update out batsmen
                innings.outBatsmen.forEach(p => {
                    if (p.name === oldFullName) p.name = newFullName;
                });
                // Update bowling figures
                if (innings.bowlingFigures && innings.bowlingFigures[oldFullName]) {
                    innings.bowlingFigures[newFullName] = innings.bowlingFigures[oldFullName];
                    delete innings.bowlingFigures[oldFullName];
                }
                if (innings.currentBowlerName === oldFullName) {
                    innings.currentBowlerName = newFullName;
                }
            }
        });

        // Save and re-render
        localStorage.setItem("match", JSON.stringify(match));
        renderScorecards();
    }

    function handleEditClick(event) {
        const target = event.target;
        if (target.classList.contains('edit-player-btn')) {
            const cell = target.closest('td');
            const oldFullName = cell.dataset.playerName;
            const oldShortName = oldFullName.split(' (')[0];

            const newName = prompt(`Enter new name for ${oldShortName}:`, oldShortName);

            if (newName && newName.trim() !== '' && newName.trim() !== oldShortName) {
                updatePlayerNameInMatch(oldFullName, newName.trim());
            }
        }
    }

    function renderScorecards() {
        scorecardContainer.innerHTML = '';
        scorecardContainer.innerHTML += generateInningsCard(match.innings1, match.innings1.battingTeam);
        scorecardContainer.innerHTML += generateInningsCard(match.innings2, match.innings2.battingTeam);

        // Re-attach event listeners after re-render
        scorecardContainer.removeEventListener('click', handleEditClick);
        scorecardContainer.addEventListener('click', handleEditClick);
    }

    // Back to Home button
    document.getElementById("backToHomeBtn").addEventListener("click", () => {
        // Optional: Clear the completed match from storage
        // localStorage.removeItem("match");
        window.location.href = "HomePage.html";
    });

});