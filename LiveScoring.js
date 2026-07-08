function setupLiveScoring() {
    const matchData = localStorage.getItem("match");
 
    if (!matchData) {
        alert("Match details not found. Please start a new match.");
        window.location.href = "NewMatch.html";
        return;
    }

    let match = JSON.parse(matchData);
    let innings = match.currentInnings;
    if (!innings.thisOver) innings.thisOver = []; // Safeguard: Initialize thisOver array
    if (!innings.outBatsmen) innings.outBatsmen = []; // Safeguard: Initialize outBatsmen array
    let history = []; // For the undo functionality
 
    // --- Element Selectors ---
    const battingTeamNameEl = document.getElementById("battingTeamName");
    const scoreDisplayEl = document.getElementById("scoreDisplay");
    const oversDisplayEl = document.getElementById("oversDisplay");
    const runRateDisplayEl = document.getElementById("runRateDisplay");
    const batsman1El = document.getElementById("batsman1");
    const batsman2El = document.getElementById("batsman2");
 
    const batsman1NameEl = document.querySelector("#batsman1 .player-name");
    const batsman1ScoreEl = document.querySelector("#batsman1 .player-score");
    const batsman2NameEl = document.querySelector("#batsman2 .player-name");
    const batsman2ScoreEl = document.querySelector("#batsman2 .player-score");

    const bowlerNameEl = document.querySelector("#currentBowler .player-name");
    const bowlerFiguresEl = document.querySelector("#currentBowler .player-figures");
 
    const runButtons = document.querySelectorAll("button[data-run]");
    const undoBtn = document.getElementById("undoBtn");
    const wideBtn = document.getElementById("wideBtn");
    const noBallBtn = document.getElementById("noBallBtn");
    const byeBtn = document.getElementById("byeBtn");
    const legByeBtn = document.getElementById("legByeBtn");
    const wicketBtn = document.getElementById("wicketBtn");

    // Wicket Modal Elements
    const wicketModal = document.getElementById("wicketModal");
    const wicketForm = document.getElementById("wicketForm");
    const cancelWicketBtn = document.getElementById("cancelWicketBtn");

    // Extra Run Modal Elements
    const extraRunModal = document.getElementById("extraRunModal");
    const extraRunModalTitle = document.getElementById("extraRunModalTitle");
    const cancelExtraRunBtn = document.getElementById("cancelExtraRunBtn");
    const extraRunButtons = document.querySelectorAll("button[data-extra-run]");

    // New Over Modal Elements
    const newOverModal = document.getElementById("newOverModal");
    const newOverForm = document.getElementById("newOverForm");
    const newBowlerSelect = document.getElementById("newBowlerSelect");

    // Fall of Wickets Elements
    const fowSection = document.getElementById("fowSection");
    const fowList = document.getElementById("fowList");

    // This Over Elements
    const thisOverSummaryEl = document.getElementById("thisOverSummary");
 
    // --- Initial State Setup ---
    function initializeScoreboard() {
        battingTeamNameEl.textContent = match.battingTeam;
 
        // Batsmen
        batsman1NameEl.textContent = innings.batsmen[0].name.split(' (')[0]; // Clean name
        batsman2NameEl.textContent = innings.batsmen[1].name.split(' (')[0]; // Clean name
 
        // Bowler
        const currentBowler = innings.bowlingFigures[innings.currentBowlerName];
        bowlerNameEl.textContent = innings.currentBowlerName.split(' (')[0]; // Clean name
 
        updateFullDisplay();
        updateUndoButton();
    }

    function updateFullDisplay() {
        updateScoreDisplay();
        updateBatsmenDisplay();
        updateBowlerDisplay();
        updateFallOfWicketsDisplay();
        updateThisOverDisplay();
        checkForInningsEnd();
        localStorage.setItem("match", JSON.stringify(match)); // Save state after every update
        updateUndoButton();
    }

    function updateScoreDisplay() {
        scoreDisplayEl.textContent = `${innings.score} / ${innings.wickets}`;
        oversDisplayEl.textContent = innings.overs.toFixed(1);

        // Calculate Run Rate
        const oversInt = Math.floor(innings.overs);
        const ballsInOver = Math.round((innings.overs - oversInt) * 10);
        const totalBalls = oversInt * 6 + ballsInOver;
        const runRate = totalBalls > 0 ? (innings.score / totalBalls) * 6 : 0;
        runRateDisplayEl.textContent = runRate.toFixed(2);
    }

    function updateBatsmenDisplay() {
        // Batsman 1
        batsman1ScoreEl.textContent = `${innings.batsmen[0].runs} (${innings.batsmen[0].balls})`;
        // Batsman 2
        batsman2ScoreEl.textContent = `${innings.batsmen[1].runs} (${innings.batsmen[1].balls})`;
 
        // Striker indicator
        if (innings.strikerIndex === 0) {
            batsman1El.classList.add("striker");
            batsman1NameEl.textContent = `${innings.batsmen[0].name.split(' (')[0]} *`;
            batsman2El.classList.remove("striker");
            batsman2NameEl.textContent = innings.batsmen[1].name.split(' (')[0];
        } else {
            batsman2El.classList.add("striker");
            batsman2NameEl.textContent = `${innings.batsmen[1].name.split(' (')[0]} *`;
            batsman1El.classList.remove("striker");
            batsman1NameEl.textContent = innings.batsmen[0].name.split(' (')[0];
        }
    }

    function updateBowlerDisplay() {
        const currentBowlerStats = innings.bowlingFigures[innings.currentBowlerName];
        bowlerFiguresEl.textContent = `${currentBowlerStats.runs}-${currentBowlerStats.wickets}`;
    }

    function updateFallOfWicketsDisplay() {
        if (innings.outBatsmen.length > 0) {
            fowSection.classList.remove("hidden");
            fowList.innerHTML = innings.outBatsmen.map((batsman, index) => {
                const batsmanName = batsman.name.split(' (')[0];
                return `<span>${index + 1}-${batsman.scoreAtWicket} (${batsmanName})</span>`;
            }).join(', ');
        } else {
            fowSection.classList.add("hidden");
        }
    }

    function updateThisOverDisplay() {
        thisOverSummaryEl.innerHTML = '';
        innings.thisOver.forEach(event => {
            const ballEventEl = document.createElement('div');
            ballEventEl.classList.add('ball-event');
            ballEventEl.textContent = event;

            if (event === 'W') {
                ballEventEl.classList.add('wicket');
            } else if (event === '4' || event === '6') {
                ballEventEl.classList.add(event === '4' ? 'four' : 'six');
            }
            thisOverSummaryEl.appendChild(ballEventEl);
        });
    }

    // --- Scoring Logic ---
    function saveStateForUndo() {
        // Use structuredClone for a deep copy of the match object
        history.push(structuredClone(match));
    }

    function addBall() {
        const currentOver = innings.overs;
        const ballsInCurrentOver = Math.round((currentOver - Math.floor(currentOver)) * 10);

        if (ballsInCurrentOver === 5) {
            // 6th ball of the over, so the over is complete
            innings.overs = Math.floor(currentOver) + 1;
            return true; // Indicates over is complete
        } else {
            innings.overs = parseFloat((currentOver + 0.1).toFixed(1));
        }
        return false; // Indicates over is not complete
    }

    function addBallToBowler() {
        const bowlerStats = innings.bowlingFigures[innings.currentBowlerName];
        const currentOver = bowlerStats.overs;
        const ballsInCurrentOver = Math.round((currentOver - Math.floor(currentOver)) * 10);

        if (ballsInCurrentOver === 5) {
            bowlerStats.overs = Math.floor(currentOver) + 1;
        } else {
            bowlerStats.overs = parseFloat((currentOver + 0.1).toFixed(1));
        }
    }

    function handleRun(event) {
        saveStateForUndo(); // Save state before making changes

        const runs = parseInt(event.target.dataset.run, 10);

        // Update totals
        innings.score += runs;
        innings.thisOver.push(runs.toString());
 
        // Update batsman
        const striker = innings.batsmen[innings.strikerIndex];
        striker.runs += runs;
        striker.balls += 1;
 
        // Update bowler
        const bowlerStats = innings.bowlingFigures[innings.currentBowlerName];
        bowlerStats.runs += runs;
 
        // Update overs
        const overCompleted = addBall();
 
        // Change strike for odd runs
        if (runs % 2 !== 0) {
            innings.strikerIndex = 1 - innings.strikerIndex; // Toggles between 0 and 1
        }
 
        addBallToBowler();
        if (overCompleted) {
            openNewOverModal();
        } else {
            updateFullDisplay();
        }
        updateFullDisplay();
    }

    function handleExtra(type) {
        saveStateForUndo();

        innings.score += 1; // All extras add 1 to the score

        if (type === 'wide') {
            const bowlerStats = innings.bowlingFigures[innings.currentBowlerName];
            bowlerStats.runs += 1;
            innings.thisOver.push('wd');
            // Wides don't count as a ball faced or a ball in the over
        } else if (type === 'noBall') {
            const bowlerStats = innings.bowlingFigures[innings.currentBowlerName];
            bowlerStats.runs += 1;
            innings.thisOver.push('nb');
            // No-ball is bowled, but batsman can score off it.
            const striker = innings.batsmen[innings.strikerIndex];
            addBall();
        } else if (type === 'bye' || type === 'legBye') {
            // Logic for these is handled by the modal
            openExtraRunModal(type);
        }

        updateFullDisplay();
    }

    function openWicketModal() {
        wicketModal.classList.add("visible");

        // Populate batsman out dropdown
        const batsmanOutSelect = document.getElementById("batsmanOutSelect");
        batsmanOutSelect.innerHTML = '';
        [0, 1].forEach(index => {
            const batsman = innings.batsmen[index];
            const option = document.createElement("option");
            option.value = index;
            option.textContent = batsman.name.split(' (')[0];
            if (index === innings.strikerIndex) {
                option.selected = true; // Default to striker being out
            }
            batsmanOutSelect.appendChild(option);
        });

        // Populate new batsman dropdown
        const battingTeamPlayers = match.battingTeam === match.team1 ? match.team1Players : match.team2Players;
        
        // Get names of players who are currently batting or are already out
        const currentBatsmenNames = innings.batsmen.map(b => b.name.split(' (')[0]);
        const outBatsmenNames = innings.outBatsmen.map(b => b.name.split(' (')[0]);
        const unavailablePlayerNames = [...currentBatsmenNames, ...outBatsmenNames];

        const availablePlayers = battingTeamPlayers.filter(p => !unavailablePlayerNames.includes(p));

        const newBatsmanSelect = document.getElementById("newBatsmanSelect");
        newBatsmanSelect.innerHTML = '<option value="">Select new batsman</option>';
        availablePlayers.forEach(player => {
            const option = document.createElement("option");
            option.value = `${player} (${match.battingTeam})`;
            option.textContent = player;
            newBatsmanSelect.appendChild(option);
        });
    }
    
    // Populate dismissal type dropdown
    const dismissalTypeSelect = document.getElementById("dismissalTypeSelect");
    const dismissalTypes = ["Bowled", "Caught", "LBW", "Stumped", "Run Out", "Hit Wicket"];
    dismissalTypes.forEach(type => {
        const option = document.createElement("option");
        option.value = type;
        option.textContent = type;
        dismissalTypeSelect.appendChild(option);
    });


    function handleWicket(event) {
        event.preventDefault();
        saveStateForUndo();

        const newBatsmanName = wicketForm.querySelector("#newBatsmanSelect").value;
        const batsmanOutIndex = parseInt(wicketForm.querySelector("#batsmanOutSelect").value, 10);
        const dismissalType = wicketForm.querySelector("#dismissalTypeSelect").value;

        if (!newBatsmanName) {
            alert("Please select the new batsman.");
            return;
        }

        // Update totals
        innings.wickets += 1;
        
        // Credit wicket to bowler unless it's a Run Out
        if (dismissalType !== "Run Out") {
            const bowlerStats = innings.bowlingFigures[innings.currentBowlerName];
            bowlerStats.wickets += 1;
            innings.thisOver.push('W');
        }

        // A ball is always bowled for a wicket
        const overCompleted = addBall();

        // Get the batsman who is out
        const batsmanOut = innings.batsmen[batsmanOutIndex];
        batsmanOut.dismissal = dismissalType;
        batsmanOut.scoreAtWicket = innings.score; // Record score at time of wicket
        innings.outBatsmen.push(batsmanOut); // Move to out list

        // Replace the outgoing batsman with the new one
        innings.batsmen[batsmanOutIndex] = { name: newBatsmanName, runs: 0, balls: 0, dismissal: null };
        // If the non-striker was run out, the new batsman will be at the non-striker's end. We'll keep it simple for now.

        wicketModal.classList.remove("visible");
        updateFullDisplay();
    }

    function openExtraRunModal(type) {
        extraRunModal.classList.add("visible");
        extraRunModalTitle.textContent = type === 'bye' ? 'Bye Runs' : 'Leg Bye Runs';

        // Temporarily attach event listeners
        extraRunButtons.forEach(button => {
            button.onclick = () => handleByeOrLegBye(type, parseInt(button.dataset.extraRun));
        });
    }

    function handleByeOrLegBye(type, runs) {
        saveStateForUndo();

        // Update team score
        innings.score += runs;
        innings.thisOver.push(`${runs}${type.charAt(0)}b`); // e.g., 1b, 4lb

        // Ball is bowled and counts
        const overCompleted = addBall();
        addBallToBowler();

        // Batsman on strike faces the ball, but doesn't get runs
        const striker = innings.batsmen[innings.strikerIndex];
        striker.balls += 1;

        // Bowler does not concede these runs

        // Change strike for odd runs
        if (runs % 2 !== 0) {
            innings.strikerIndex = 1 - innings.strikerIndex; // Toggles between 0 and 1
        }

        extraRunModal.classList.remove("visible");

        if (overCompleted) {
            openNewOverModal();
        } else {
            updateFullDisplay();
        }
    }

    function openNewOverModal() {
        updateFullDisplay(); // Update display before showing modal

        // Change strike for the new over
        innings.strikerIndex = 1 - innings.strikerIndex;
        innings.thisOver = []; // Clear for the new over

        // Populate new bowler dropdown
        const bowlingTeamPlayers = (match.bowlingTeam === match.team1 ? match.team1Players : match.team2Players).map(p => `${p} (${match.bowlingTeam})`);
        const currentBowlerName = innings.currentBowlerName;
        const availableBowlers = bowlingTeamPlayers.filter(p => p !== currentBowlerName);

        newBowlerSelect.innerHTML = '<option value="">Select new bowler</option>';
        availableBowlers.forEach(player => {
            const option = new Option(player.split(' (')[0], player);
            newBowlerSelect.appendChild(option);
        });

        newOverModal.classList.add("visible");
    }

    function handleNewOver(event) {
        event.preventDefault();
        const newBowlerName = newBowlerSelect.value;
        if (!newBowlerName) return;

        innings.currentBowlerName = newBowlerName;
        // If this bowler hasn't bowled before, add them to the figures
        if (!innings.bowlingFigures[newBowlerName]) {
            innings.bowlingFigures[newBowlerName] = { overs: 0, runs: 0, wickets: 0 };
        }

        newOverModal.classList.remove("visible");
        updateFullDisplay();
    }

    function checkForInningsEnd() {
        const isInningsOver = innings.wickets === 10 || innings.overs >= match.overs;
        const isSecondInnings = !!match.innings1;
        const targetChased = isSecondInnings && innings.score > match.innings1.score;

        if (isInningsOver || targetChased) {
            if (isSecondInnings) {
                // Match is over
                match.innings2 = innings;
                localStorage.setItem("match", JSON.stringify(match));
                window.location.href = "Scorecard.html";
            } else {
                // First innings is over
                match.innings1 = innings;
                match.innings1.battingTeam = match.battingTeam; // Store batting team name

                // Swap teams for second innings
                const tempTeam = match.battingTeam;
                match.battingTeam = match.bowlingTeam;
                match.bowlingTeam = tempTeam;

                // Reset currentInnings for the next page
                match.currentInnings = {
                    batsmen: [],
                    strikerIndex: 0,
                    bowlingFigures: {},
                    score: 0,
                    wickets: 0,
                    overs: 0,
                    thisOver: [],
                    outBatsmen: []
                };
                localStorage.setItem("match", JSON.stringify(match));
                alert("First innings complete! Please select opening players for the second innings.");
                window.location.href = "SelectPlayers.html";
            }
        }
    }

    function handleUndo() {
        if (history.length === 0) return; // Nothing to undo

        const previousState = history.pop();

        // Restore the entire match object from the previous state
        Object.assign(match, previousState);
        innings = match.currentInnings; // Re-assign innings reference

        updateFullDisplay();
    }

    function updateUndoButton() {
        undoBtn.disabled = history.length === 0;
    }

    // --- Event Listeners ---
    runButtons.forEach(button => {
        button.addEventListener("click", handleRun);
    });

    wideBtn.addEventListener("click", () => handleExtra('wide'));
    noBallBtn.addEventListener("click", () => handleExtra('noBall'));
    byeBtn.addEventListener("click", () => openExtraRunModal('bye'));
    legByeBtn.addEventListener("click", () => openExtraRunModal('legBye'));
    wicketBtn.addEventListener("click", openWicketModal);

    cancelWicketBtn.addEventListener("click", () => wicketModal.classList.remove("visible"));
    cancelExtraRunBtn.addEventListener("click", () => extraRunModal.classList.remove("visible"));
    wicketForm.addEventListener("submit", handleWicket);
    newOverForm.addEventListener("submit", handleNewOver);
    
    undoBtn.addEventListener("click", handleUndo);


    // --- Initialize ---
    initializeScoreboard();
}

// This structure allows the script to run in the browser while also being testable in Node.js/Jest.
if (typeof document !== 'undefined') {
    document.addEventListener("DOMContentLoaded", setupLiveScoring);
}

if (typeof module !== 'undefined') {
    module.exports = { setupLiveScoring }; // Export for testing
}