const server = "https://api.artifactsmmo.com";
//Din karaktärs ID
const token = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJlbWFpbCI6ImIucGF0cmlrLmxpbmRiZXJnQGdtYWlsLmNvbSIsInBhc3N3b3JkX2NoYW5nZWQiOiIifQ.gAXlz8ahaBMD4b52hI6VmWO6HMvoadYvGVaTgcnNsDc";
//Din karaktärs namn
const character = "TheL0rd";


// Karaktärens örelser
const upButton = document.querySelector('#up');
const leftButton = document.querySelector('#left');
const rightButton = document.querySelector('#right');
const downButton = document.querySelector('#down');
const gatherButton = document.querySelector("#gather")
const fightButton = document.querySelector("#fight")

const automateEl = document.getElementById("automate");

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

// Funktion för att starta cooldown-timer
function cooldown() {
    const cooldownEl = document.getElementById("cooldown");
    const interval = setInterval(() => {
        if (cooldownTimer > 0) {
            cooldownEl.innerText = `Nedräkning: ${cooldownTimer} sekunder`;
            cooldownTimer--;
        } else {
            clearInterval(interval);
            cooldownEl.innerText = "Nedräkning: Klar";
        }
    }, 1000);
}

// Funktion för rörelse
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

// Funktion för att samla resurser
async function gather() {
    const url = server + "/my/" + character + "/action/gathering";
    const options = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: "Bearer " + token,
        },
    };

    try {
        const response = await fetch(url, options);
        const data = await response.json();

        console.log(data);

        // Hämta cooldown-tid från API-svaret
        cooldownTimer = data.data.cooldown.remaining_seconds;

        // Starta cooldown om tid kvarstår
        if (cooldownTimer > 0) {
            cooldown();
        }
    } catch (error) {
        console.log(error);
    }

    // Automatisk insamling
    if (automateEl.checked) {
        console.log("Automatisk insamling");
        setTimeout(gather, 30000); // Kör om efter 30 sekunder
    }
}

// Funktion för slåss
async function fight() {
    const url = server + '/my/' + character +'/action/fight'
    let data = null
      
    const options = {
        method: 'POST',
        headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: 'Bearer ' + token
        },
    }
        
    try {
        const response = await fetch(url, options)
        data = await response.json()
      
        console.log(data)
        cooldownTimer = data.data.cooldown.remaining_seconds
      
        if(cooldownTimer > 0) {
             cooldown()
        }
      
    } catch (error) {
          console.log(error)
    }



    if(automateEl.checked && data.data.fight.result === 'win') {

        if(data.data.character.hp < 70) {
            setTimeout(() => rest(fight), (cooldownTimer + 3) * 1000)
        }
        else {
            console.log("automatic fighting")
            console.log("cooldown: " + ((cooldownTimer + 3) * 1000))
            setTimeout(fight, (cooldownTimer + 3) * 1000 )
        }

        
    }
    else if(data.data.fight.result === 'loss') {
        console.log("loss")
        automateEl.checked = false
    }
}


// Event listeners för knappar
upButton.addEventListener('click', () => moveCharacter(posX, posY - 1)); // Flytta upp
leftButton.addEventListener('click', () => moveCharacter(posX - 1, posY)); // Flytta vänster
rightButton.addEventListener('click', () => moveCharacter(posX + 1, posY)); // Flytta höger
downButton.addEventListener('click', () => moveCharacter(posX, posY + 1)); // Flytta ner
gatherButton.addEventListener('click', () => gather())
fightButton.addEventListener('click', () => fight())


updatePositionDisplay();
updateCooldownDisplay();