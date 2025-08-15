const { Pinecone } = require('@pinecone-database/pinecone');

const pc = new Pinecone({
    apiKey: process.env.PINECONE_KEY
});

const indexName = 'infiniquest';
const index = pc.index(indexName);

async function storeGameAction(data) {
    // user game action is fed in to this function
    const { stateName, stateDescription, stateActions, userId } = data;

    // create and store vector
    const vector = {
        id: actionId,
        values: embedding,
        metadata: {
            stateName: stateName,
            stateDescription: stateDescription,
            stateActions: stateActions,
            userId: userId,
            timestamp: new Date().toISOString()
        }
    };

    await index.upsert([vector]);
    console.log(`Stored Vector in DB`);
}

// idea is we can store past actions in case any future actions reference old parts of the story.

// these vectors if returned are then added to ai generation calls to enhance story creation

// TO BE CREATED

/* 

function to search and return most similar vector pertaining to the user
if the current action called does not yield a high enough similarity, disregard and make ai call without vector

function to delete vectors?

*/