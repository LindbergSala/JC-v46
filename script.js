const server = "https://api.artifactsmmo.com";
//Din karaktärs ID
const token = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJlbWFpbCI6ImIucGF0cmlrLmxpbmRiZXJnQGdtYWlsLmNvbSIsInBhc3N3b3JkX2NoYW5nZWQiOiIifQ.gAXlz8ahaBMD4b52hI6VmWO6HMvoadYvGVaTgcnNsDc";
//Din karaktärs namn
const character = "TheL0rd";

// Karaktärens position
let posX = 0;
let posY = 0;

// Cooldown-timer
let cooldownTime = 11; // Starttid för nedräkning i sekunder
let cooldownActive = false; // Kontrollera om timern är aktiv
let cooldownInterval; // Håller intervallet för timern

// Uppdatera positionsvisningen
function updatePositionDisplay() {
    document.getElementById('position').innerText = `Position: (${posX}, ${posY})`;
}

// Uppdatera cooldown-timern
function updateCooldownDisplay() {
    document.getElementById('cooldown').innerText = `Nedräkning: ${cooldownTime} sekunder`;
}

// Starta cooldown-timern
function startCooldown() {
    if (cooldownActive) {
        return; // Om timern redan är aktiv, gör inget
    }
    cooldownActive = true; // Markera timern som aktiv
    cooldownTime = 11; // Återställ cooldown-tiden
    updateCooldownDisplay();

    // Starta nedräkningen
    cooldownInterval = setInterval(() => {
        cooldownTime--;
        updateCooldownDisplay();
        if (cooldownTime <= 0) {
            clearInterval(cooldownInterval); // Stoppa intervallet när tiden är slut
            cooldownActive = false; // Återställ aktiv status
            document.getElementById('cooldown').innerText = 'Nedräkning: Klar';
        }
    }, 1000);
}

// Hantera rörelse
async function moveCharacter(newX, newY) {
    if (cooldownActive) {
        alert('Du måste vänta tills cooldown är klar!'); // Hindra rörelse under cooldown
        return;
    }

    const url = `${server}/my/${character}/action/move`;
    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ x: newX, y: newY }) // Skicka nya koordinater
    };

    try {
        const response = await fetch(url, options);
        const data = await response.json();
        if (response.ok && data) {
            posX = newX;
            posY = newY;
            updatePositionDisplay(); // Uppdatera positionen
            startCooldown(); // Starta cooldown-timern
        } else {
            console.error('Fel vid förflyttning:', data);
        }
    } catch (error) {
        console.error('Nätverksfel:', error);
    }
}

// Event listeners för knappar
document.getElementById('up').addEventListener('click', () => moveCharacter(posX, posY - 1)); // Flytta upp
document.getElementById('left').addEventListener('click', () => moveCharacter(posX - 1, posY)); // Flytta vänster
document.getElementById('right').addEventListener('click', () => moveCharacter(posX + 1, posY)); // Flytta höger
document.getElementById('down').addEventListener('click', () => moveCharacter(posX, posY + 1)); // Flytta ner

// Initial uppdatering av position och cooldown-display
updatePositionDisplay();
updateCooldownDisplay();