document.addEventListener("DOMContentLoaded", () => {
    // Retrieve the match data from localStorage
    const matchData = localStorage.getItem("match");
    const tossForm = document.getElementById("tossForm");

    if (matchData) {
        const match = JSON.parse(matchData);

        // Get the label and radio button elements
        const team1Label = document.getElementById("team1Label");
        const team2Label = document.getElementById("team2Label");
        const team1Radio = document.getElementById("team1");
        const team2Radio = document.getElementById("team2");

        // Update the labels with the team names
        team1Label.textContent = match.team1;
        team2Label.textContent = match.team2;

        // Update the radio button values for form submission
        team1Radio.value = match.team1;
        team2Radio.value = match.team2;

        // Handle form submission
        tossForm.addEventListener("submit", (event) => {
            event.preventDefault(); // Prevent the form from reloading the page

            const formData = new FormData(tossForm);
            const tossWinner = formData.get("tossWinner");
            const decision = formData.get("decision");

            // Update the match object with toss details
            match.tossWinner = tossWinner;
            match.decision = decision;

            // Determine batting and bowling teams
            if (decision === "Bat") {
                match.battingTeam = tossWinner;
                match.bowlingTeam = (tossWinner === match.team1) ? match.team2 : match.team1;
            } else { // Decision is "Bowl"
                match.bowlingTeam = tossWinner;
                match.battingTeam = (tossWinner === match.team1) ? match.team2 : match.team1;
            }

            // Save the updated match object back to localStorage
            localStorage.setItem("match", JSON.stringify(match));

            // Navigate to the next page
            window.location.href = "SelectPlayers.html";
        });
    } else {
        // If no match data is found, redirect back to the new match page
        alert("Match details not found. Please create a new match.");
        window.location.href = "NewMatch.html";
    }
});