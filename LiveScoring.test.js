const fs = require('fs');
const path = require('path');

// Load the setup function from the script
const { setupLiveScoring } = require('./LiveScoring.js');

describe('LiveScoring Logic', () => {
    beforeEach(() => {
        // 1. Load the HTML file's content into JSDOM
        const html = fs.readFileSync(path.resolve(__dirname, './LiveScoring.html'), 'utf8');
        document.documentElement.innerHTML = html.toString();

        // 2. Clear localStorage and set up a mock match object
        localStorage.clear();
        const mockMatch = {
            team1: "Team A",
            team2: "Team B",
            overs: 20,
            battingTeam: "Team A",
            bowlingTeam: "Team B",
            team1Players: ["P1", "P2", "P3"],
            team2Players: ["P4", "P5", "P6"],
            currentInnings: {
                batsmen: [
                    { name: "P1 (Team A)", runs: 0, balls: 0 },
                    { name: "P2 (Team A)", runs: 0, balls: 0 }
                ],
                strikerIndex: 0,
                currentBowlerName: "P4 (Team B)",
                bowlingFigures: {
                    "P4 (Team B)": { overs: 0, runs: 0, wickets: 0 }
                },
                score: 0,
                wickets: 0,
                overs: 0,
                thisOver: [],
                outBatsmen: []
            }
        };
        localStorage.setItem("match", JSON.stringify(mockMatch));

        // 3. Run the script's setup logic
        setupLiveScoring();
    });

    test('should correctly score 4 runs for the striker', () => {
        // Find the '4 runs' button and click it
        const run4Button = document.querySelector('button[data-run="4"]');
        run4Button.click();

        // Assertions: Check if the state updated correctly
        const scoreDisplay = document.getElementById('scoreDisplay').textContent;
        const oversDisplay = document.getElementById('oversDisplay').textContent;
        const batsmanScore = document.querySelector('#batsman1 .player-score').textContent;

        expect(scoreDisplay).toBe('4 / 0');
        expect(oversDisplay).toBe('0.1');
        expect(batsmanScore).toBe('4 (1)');

        // Verify localStorage was updated
        const updatedMatch = JSON.parse(localStorage.getItem("match"));
        expect(updatedMatch.currentInnings.score).toBe(4);
        expect(updatedMatch.currentInnings.batsmen[0].runs).toBe(4);
    });

    test('should correctly handle a wide ball', () => {
        // Find the 'Wide' button and click it
        const wideButton = document.getElementById('wideBtn');
        wideButton.click();

        // Assertions
        expect(document.getElementById('scoreDisplay').textContent).toBe('1 / 0');
        // Over should not advance on a wide
        expect(document.getElementById('oversDisplay').textContent).toBe('0.0');

        const updatedMatch = JSON.parse(localStorage.getItem("match"));
        expect(updatedMatch.currentInnings.score).toBe(1);
        expect(updatedMatch.currentInnings.overs).toBe(0); // Overs count remains the same
    });
});