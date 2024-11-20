const server = "https://api.artifactsmmo.com";
//Your token is automatically set
const token = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJlbWFpbCI6ImIucGF0cmlrLmxpbmRiZXJnQGdtYWlsLmNvbSIsInBhc3N3b3JkX2NoYW5nZWQiOiIifQ.gAXlz8ahaBMD4b52hI6VmWO6HMvoadYvGVaTgcnNsDc";
//Put your character name here
const character = "TheL0rd";
  
async function movement() {
      
  const url = server + '/my/' + character +'/action/move';
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: 'Bearer ' + token
    },
    body: '{"x":0,"y":1}' //change the position here
  };
  
  try {
    const response = await fetch(url, options);
    const { data } = await response.json();
    console.log(data);
  } catch (error) {
    console.log(error);
  }
  }
  
movement();