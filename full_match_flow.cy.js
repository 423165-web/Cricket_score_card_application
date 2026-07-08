describe('Cricket Score Card - Full Match Flow', () => {

    beforeEach(() => {
        // Clear local storage before each test to ensure a clean state
        cy.visit('HomePage.html');
        cy.window().then((win) => {
            win.localStorage.clear();
        });
    });

    it('should allow a user to create a match, score, and complete an over', () => {
        // 1. Navigate to New Match page from Home Page
        cy.visit('HomePage.html');
        cy.contains('New Match').click();
        cy.url().should('include', 'NewMatch.html');

        // 2. Fill out match details
        cy.get('#team1').type('Gryffindor');
        cy.get('#team2').type('Slytherin');
        cy.get('#team1Players').type('Harry, Ron, Hermione, Fred, George');
        cy.get('#team2Players').type('Draco, Crabbe, Goyle, Pansy, Blaise');
        cy.get('#overs').type('1');
        cy.contains('Continue').click();

        // 3. Handle the Toss
        cy.url().should('include', 'Toss.html');
        cy.get('label[for="team1"]').click(); // Gryffindor wins toss
        cy.get('input[value="Bat"]').click(); // Decides to bat
        cy.contains('Start Match').click();

        // 4. Select Opening Players
        cy.url().should('include', 'SelectPlayers.html');
        cy.get('#batsman1').select('Harry (Gryffindor)');
        cy.get('#batsman2').select('Ron (Gryffindor)');
        cy.get('#striker1Radio').check(); // Harry is on strike
        cy.get('#bowler').select('Draco (Slytherin)');
        cy.contains('Start Innings').click();

        // 5. Live Scoring
        cy.url().should('include', 'LiveScoring.html');

        // -- Ball 1: 4 runs --
        cy.get('button[data-run="4"]').click();
        cy.get('#scoreDisplay').should('contain.text', '4 / 0');
        cy.get('#oversDisplay').should('contain.text', '0.1');
        cy.get('#batsman1 .player-score').should('contain.text', '4 (1)'); // Harry scores 4

        // -- Ball 2: Wicket --
        cy.get('#wicketBtn').click();
        cy.get('#wicketModal').should('be.visible');
        cy.get('#batsmanOutSelect').select('0'); // Harry is out
        cy.get('#newBatsmanSelect').select('Hermione (Gryffindor)');
        cy.get('#dismissalTypeSelect').select('Bowled');
        cy.get('#confirmWicketBtn').click();
        cy.get('#scoreDisplay').should('contain.text', '4 / 1');
        cy.get('#oversDisplay').should('contain.text', '0.2');
        cy.get('#fowList').should('contain.text', '1-4 (Harry)');

        // -- Ball 3: 1 run --
        cy.get('button[data-run="1"]').click();
        cy.get('#scoreDisplay').should('contain.text', '5 / 1');
        cy.get('#oversDisplay').should('contain.text', '0.3');
        cy.get('#batsman1 .player-score').should('contain.text', '1 (1)'); // Hermione scores 1

        // -- Ball 4: Wide --
        cy.get('#wideBtn').click();
        cy.get('#scoreDisplay').should('contain.text', '6 / 1');
        cy.get('#oversDisplay').should('contain.text', '0.3'); // Over does not advance

        // -- Finish the over (manually for simplicity) --
        cy.get('button[data-run="0"]').click(); // Ball 4
        cy.get('button[data-run="0"]').click(); // Ball 5
        cy.get('button[data-run="1"]').click(); // Ball 6, over completes

        // 6. New Over Modal
        cy.get('#newOverModal').should('be.visible');
        cy.get('#newBowlerSelect').select('Crabbe (Slytherin)');
        cy.contains('Continue').click();
        cy.get('#currentBowler .player-name').should('contain.text', 'Crabbe');
        cy.get('#oversDisplay').should('contain.text', '1.0');
    });
});