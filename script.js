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
const restButton = document.querySelector('#rest')
const gotoLocation1Button = document.querySelector('#goto-location1');
const gotoLocation2Button = document.querySelector('#goto-location2');

const automateEl = document.getElementById("automate");

const location1 = { x: 0, y: 1 }; // Kycklingarna
const location2 = { x: 2, y: 2 }; // Solrosorna 

let posX = 0;
let posY = 0;

let cooldownTime = 11;
let cooldownActive = false;
let cooldownInterval;

// Funktion för karaktär
async function getCharacter() {
    const url = server + "/characters/" + character;

    const options = {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            Authorization: 'Bearer ' + token
        },
    };

    try {
        const response = await fetch(url, options);
        const data = await response.json();

        console.log(data);

        if (data && data.data) {
            const characterData = data.data;

            // Uppdatera karaktärens namn och nivå
            document.getElementById('character-name').innerText = `Namn: ${characterData.name}`;
            document.getElementById('character-level').innerText = `Nivå: ${characterData.level}`;

            // Uppdatera position
            posX = characterData.x;
            posY = characterData.y;
            updatePositionDisplay();
        } else {
            console.error("Kunde inte hämta karaktärens data");
        }
    } catch (error) {
        console.error("Fel vid hämtning av karaktärsdata:", error);
    }
}

// Starta cooldown-timern
function startCooldown() {
    if (cooldownActive) return;

    cooldownActive = true;
    cooldownTime = 11;
    updateCooldownDisplay(cooldownTime);

    cooldownInterval = setInterval(() => {
        cooldownTime--;
        updateCooldownDisplay(cooldownTime);

        if (cooldownTime <= 0) {
            stopCooldown();
        }
    }, 1000);
}

// Stoppa cooldown-timern
function stopCooldown() {
    clearInterval(cooldownInterval);
    cooldownActive = false;
    updateCooldownDisplay(0);
}

// Uppdatera cooldown-timern
function updateCooldownDisplay() {
    document.getElementById('cooldown').innerText = `Nedräkning: ${cooldownTime} sekunder`;
}

function updateCooldownDisplay(time) {
    const cooldownEl = document.getElementById("cooldown");
    cooldownEl.innerText = time > 0 
        ? `Nedräkning: ${time} sekunder` 
        : "Nedräkning: Klar";
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

function updatePositionDisplay() {
    document.getElementById('position').innerText = `Position: (${posX}, ${posY})`;
}


// Funktion för samla
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

// Funktion för vila
async function rest(action) {
    const url = server + '/my/' + character +'/action/rest'
  
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
      const data = await response.json()
  
      console.log(data)
      cooldownTimer = data.data.cooldown.remaining_seconds
  
      if(cooldownTimer > 0) {
          cooldown()
      }
  
    } catch (error) {
      console.log(error)
    }

    if(action) {
        setTimeout(action, (cooldownTimer + 3) * 1000)
    }
}

// Funktion för att flytta karaktären till en förutbestämd plats
async function moveToLocation(location) {
    if (cooldownActive) {
        alert('Du måste vänta tills cooldown är klar!');
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
        body: JSON.stringify({ x: location.x, y: location.y })
    };

    try {
        const response = await fetch(url, options);
        const data = await response.json();

        if (response.ok && data) {
            posX = location.x;
            posY = location.y;
            updatePositionDisplay();
            startCooldown();
        } else {
            console.error('Fel vid förflyttning:', data);
        }
    } catch (error) {
        console.error('Nätverksfel:', error);
    }
}

// Event listeners för knappar
upButton.addEventListener('click', () => moveCharacter(posX, posY - 1));
leftButton.addEventListener('click', () => moveCharacter(posX - 1, posY));
rightButton.addEventListener('click', () => moveCharacter(posX + 1, posY));
downButton.addEventListener('click', () => moveCharacter(posX, posY + 1));
gatherButton.addEventListener('click', () => gather())
fightButton.addEventListener('click', () => fight())
restButton.addEventListener('click', () => rest())
gotoLocation1Button.addEventListener('click', () => moveToLocation(location1));
gotoLocation2Button.addEventListener('click', () => moveToLocation(location2));

updatePositionDisplay();
updateCooldownDisplay();
getCharacter();