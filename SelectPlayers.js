document.addEventListener("DOMContentLoaded", () => {
    const matchData = localStorage.getItem("match");

    if (!matchData) {
        alert("Match details not found. Please create a new match.");
        window.location.href = "NewMatch.html";
        return;
    }

    const match = JSON.parse(matchData);

    // --- Get Player Data from Match Object ---
    const team1Players = match.team1Players.map(p => `${p} (${match.team1})`);
    const team2Players = match.team2Players.map(p => `${p} (${match.team2})`);

    const battingTeamPlayers = match.battingTeam === match.team1 ? team1Players : team2Players;
    const bowlingTeamPlayers = match.bowlingTeam === match.team1 ? team1Players : team2Players;

    // Get elements
    const battingTeamNameEl = document.getElementById("battingTeamName");
    const bowlingTeamNameEl = document.getElementById("bowlingTeamName");
    const batsman1Select = document.getElementById("batsman1");
    const batsman2Select = document.getElementById("batsman2");
    const bowlerSelect = document.getElementById("bowler");
    const striker1Name = document.getElementById("striker1Name");
    const striker2Name = document.getElementById("striker2Name");
    const striker1Radio = document.getElementById("striker1Radio");
    const striker2Radio = document.getElementById("striker2Radio");
    const form = document.getElementById("selectPlayersForm");

    // Set team names
    battingTeamNameEl.textContent = `🏏 ${match.battingTeam}`;
    bowlingTeamNameEl.textContent = `🥎 ${match.bowlingTeam}`;

    // Populate dropdowns
    function populateSelect(selectElement, players) {
        selectElement.innerHTML = '<option value="">Select a player</option>'; // Add a placeholder
        players.forEach(player => {
            const option = document.createElement("option");
            option.value = player;
            option.textContent = player;
            selectElement.appendChild(option);
        });
    }

    populateSelect(batsman1Select, battingTeamPlayers);
    populateSelect(batsman2Select, battingTeamPlayers);
    populateSelect(bowlerSelect, bowlingTeamPlayers);

    // Update striker labels when batsmen are selected
    function updateStrikerLabels() {
        const bat1 = batsman1Select.value.split(' (')[0] || "Batsman 1";
        const bat2 = batsman2Select.value.split(' (')[0] || "Batsman 2";
        striker1Name.textContent = bat1;
        striker2Name.textContent = bat2;
        striker1Radio.disabled = !batsman1Select.value;
        striker2Radio.disabled = !batsman2Select.value;
    }

    batsman1Select.addEventListener("change", updateStrikerLabels);
    batsman2Select.addEventListener("change", updateStrikerLabels);

    // Handle form submission
    form.addEventListener("submit", (event) => {
        event.preventDefault();

        const batsman1 = batsman1Select.value;
        const batsman2 = batsman2Select.value;
        const bowler = bowlerSelect.value;
        const strikerIndex = form.querySelector('input[name="striker"]:checked')?.value;

        // Validation
        if (!batsman1 || !batsman2 || !bowler) {
            alert("Please select all opening players.");
            return;
        }

        if (batsman1 === batsman2) {
            alert("Opening batsmen cannot be the same person.");
            return;
        }

        if (!strikerIndex) {
            alert("Please select the opening striker.");
            return;
        }

        // Update match object
        match.currentInnings = {
            batsmen: [
                { name: batsman1, runs: 0, balls: 0 },
                { name: batsman2, runs: 0, balls: 0 }
            ],
            strikerIndex: parseInt(strikerIndex, 10), // 0 or 1
            currentBowlerName: bowler,
            bowlingFigures: {
                [bowler]: { overs: 0, runs: 0, wickets: 0 }
            },
            score: 0,
            wickets: 0,
            overs: 0,
            thisOver: [],
            outBatsmen: [] // Initialize outBatsmen array
        };

        // Save updated match data and proceed
        localStorage.setItem("match", JSON.stringify(match));
        window.location.href = "LiveScoring.html"; // Next step
        // alert("Ready to start the match! Redirecting to Live Scoring page (not yet created).");
    });
});