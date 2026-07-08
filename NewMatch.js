function GotoToss() {

    // Get input values
    const team1 = document.getElementById("team1").value.trim();
    const team2 = document.getElementById("team2").value.trim();
    const overs = document.getElementById("overs").value;
    const venue = document.getElementById("venue").value.trim();
    const date = document.getElementById("date").value;
    const team1PlayersRaw = document.getElementById("team1Players").value.trim();
    const team2PlayersRaw = document.getElementById("team2Players").value.trim();

    // Regular expression: only letters and spaces
    const namePattern = /^[A-Za-z\s]+$/;

    // Check required fields
    if (team1 === "" || team2 === "" || overs === "") {
        alert("Please fill all the required fields.");
        return;
    }

    // Validate Team 1 Name
    if (!namePattern.test(team1)) {
        alert("Team 1 name should contain only letters and spaces.");
        return;
    }

    // Validate Team 2 Name
    if (!namePattern.test(team2)) {
        alert("Team 2 name should contain only letters and spaces.");
        return;
    }
    if (!namePattern.test(venue)) {
        alert("Venue should contain only letters and spaces.");
        return;
    }

    // Check if both team names are the same
    if (team1.toLowerCase() === team2.toLowerCase()) {
        alert("Both teams cannot have the same name.");
        return;
    }

    // Validate overs
    if (overs < 1 || overs > 50) {
        alert("Overs must be between 1 and 50.");
        return;
    }

    // Process player names from textarea
    const team1Players = team1PlayersRaw ? team1PlayersRaw.split(',').map(p => p.trim()).filter(p => p) : [];
    const team2Players = team2PlayersRaw ? team2PlayersRaw.split(',').map(p => p.trim()).filter(p => p) : [];

    // Basic validation for player lists
    if (team1Players.length < 2 || team2Players.length < 2) {
        alert("Please enter at least two players for each team, separated by commas.");
        return;
    }

    // Store match details
    const match = {
        team1: team1,
        team2: team2,
        overs: Number(overs),
        venue: venue,
        date: date,
        team1Players: team1Players,
        team2Players: team2Players
    };

    // Save to localStorage
    localStorage.setItem("match", JSON.stringify(match));

    // Navigate to Toss page
    window.location.href = "Toss.html";
}