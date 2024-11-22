const server = "https://api.artifactsmmo.com";
// Din karaktärs ID
const token = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJlbWFpbCI6ImIucGF0cmlrLmxpbmRiZXJnQGdtYWlsLmNvbSIsInBhc3N3b3JkX2NoYW5nZWQiOiIifQ.gAXlz8ahaBMD4b52hI6VmWO6HMvoadYvGVaTgcnNsDc";
// Din karaktärs namn
const character = "TheL0rd";

// Elementreferenser
const upButton = document.querySelector("#up");
const leftButton = document.querySelector("#left");
const rightButton = document.querySelector("#right");
const downButton = document.querySelector("#down");
const gatherButton = document.querySelector("#gather");
const fightButton = document.querySelector("#fight");
const restButton = document.querySelector("#rest");
const gotoLocation1Button = document.querySelector("#goto-location1");
const gotoLocation2Button = document.querySelector("#goto-location2");
const automateEl = document.getElementById("automate");

// Fördefinierade platser
const location1 = { x: 0, y: 1 }; // Kycklingarna
const location2 = { x: 2, y: 2 }; // Solrosorna

// Position och cooldown
let posX = 0;
let posY = 0;
let cooldownTime = 0;
let cooldownActive = false;
let cooldownInterval;

// Funktion för att hämta karaktärsdata
async function getCharacter() {
    const url = `${server}/characters/${character}`;
    const options = {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
        },
    };

    try {
        const response = await fetch(url, options);
        const data = await response.json();

        if (response.ok && data.data) {
            const characterData = data.data;
            document.getElementById("character-name").innerText = `Namn: ${characterData.name}`;
            document.getElementById("character-level").innerText = `Nivå: ${characterData.level}`;
            posX = characterData.x;
            posY = characterData.y;
            updatePositionDisplay();
        } else {
            console.error("Kunde inte hämta karaktärens data:", data);
        }
    } catch (error) {
        console.error("Fel vid hämtning av karaktärsdata:", error);
    }
}

// Cooldown-hantering
function applyCooldown(time) {
    if (cooldownActive) return;

    cooldownActive = true;
    cooldownTime = time;
    updateCooldownDisplay();

    cooldownInterval = setInterval(() => {
        cooldownTime--;
        updateCooldownDisplay();

        if (cooldownTime <= 0) {
            clearInterval(cooldownInterval);
            cooldownActive = false;
            updateCooldownDisplay();
        }
    }, 1000);
}

function updateCooldownDisplay() {
    const cooldownEl = document.getElementById("cooldown");
    cooldownEl.innerText = cooldownTime > 0
        ? `Nedräkning: ${cooldownTime} sekunder`
        : "Nedräkning: Klar";
}

// API-anrop
async function performAction(endpoint, body = {}, onSuccess = null) {
    if (cooldownActive) {
        alert("Du måste vänta tills cooldown är klar!");
        return;
    }

    const url = `${server}/my/${character}/action/${endpoint}`;
    const options = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
    };

    try {
        const response = await fetch(url, options);
        const data = await response.json();

        if (response.ok && data.data) {
            applyCooldown(data.data.cooldown.remaining_seconds);
            if (onSuccess) onSuccess(data);
        } else {
            console.error("Fel vid action:", data);
        }
    } catch (error) {
        console.error("Anslutningsproblem:", error);
    }
}

// Rörelsefunktion
async function moveCharacter(newX, newY) {
    await performAction("move", { x: newX, y: newY }, () => {
        posX = newX;
        posY = newY;
        updatePositionDisplay();
    });
}

// Uppdatera position
function updatePositionDisplay() {
    document.getElementById("position").innerText = `Position: (${posX}, ${posY})`;
}

// Samla resurser
async function gather() {
    await performAction("gathering", {}, () => {
        console.log("Samling klar!");
    });

    if (automateEl.checked) {
        setTimeout(gather, (cooldownTime + 1) * 1000);
    }
}

// Slåss
async function fight() {
    await performAction("fight", {}, (data) => {
        if (data.data.fight.result === "win" && automateEl.checked) {
            const delay = data.data.character.hp < 70 ? "rest" : fight;
            setTimeout(delay, (cooldownTime + 3) * 1000);
        }
    });
}

// Vila
async function rest() {
    await performAction("rest", {}, () => {
        console.log("Vila klar!");
    });
}

// Gå till plats
async function moveToLocation(location) {
    await moveCharacter(location.x, location.y);
}

// Event listeners
upButton.addEventListener("click", () => moveCharacter(posX, posY - 1));
leftButton.addEventListener("click", () => moveCharacter(posX - 1, posY));
rightButton.addEventListener("click", () => moveCharacter(posX + 1, posY));
downButton.addEventListener("click", () => moveCharacter(posX, posY + 1));
gatherButton.addEventListener("click", gather);
fightButton.addEventListener("click", fight);
restButton.addEventListener("click", rest);
gotoLocation1Button.addEventListener("click", () => moveToLocation(location1));
gotoLocation2Button.addEventListener("click", () => moveToLocation(location2));

// Display
updatePositionDisplay();
updateCooldownDisplay();
getCharacter();
