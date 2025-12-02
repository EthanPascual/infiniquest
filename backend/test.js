const axios = require('axios');

const url = 'http://localhost:3001/api/game';
const delUrl = 'http://localhost:3001/api/clear-db';

const testId = 12345
const testUserData = {
    userId: testId,
    convo: []
};

const testId2 = 123456
const testUserData2 = {
    userId: testId2,
    convo: []
};


const testStateData = {
    stateName: "Knight Beginning",
    description: "You stand at the edge of your story, the weight of the future pressing on your shoulders like an unseen helm. The path of a knight is no easy road—every step demands loyalty, courage, and sacrifice. You were not born with a crown, yet destiny has set its gaze upon you.",
    actions: []
};

async function testRun() {
    const response = await axios.delete(delUrl);

    
    console.log('Creating game state');
    const stateResponse = await axios.post(`${url}/createState`, testStateData);

    console.log('Creating user state');
    const userResponse = await axios.post(`${url}/createUser`, testUserData);

    let userConvo = await axios.get(`${url}/user/${testId}`);
    console.log(userConvo.data)

    const actionResponse = await axios.put(`${url}/${testId}/action`, {
        action: "Time to go train in the forest"
    });
    
    console.log('Creating user state2');
    const userResponse2 = await axios.post(`${url}/createUser`, testUserData2);

    const actionResponse2 = await axios.put(`${url}/${testId2}/action`, {
        action: "I want to go train at home"
    });

    let userConvo2 = await axios.get(`${url}/user/${testId2}`);
    console.log(userConvo.data)

    
}

testRun();