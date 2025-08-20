const { getPineconeClient, getPineconeIndex } = require('./config.js');
const { getOpenAI } = require("./config")

function generateEmbedding(text) {
    const openai = getOpenAI();
    return openai.embeddings.create({
        model: "text-embedding-3-small", 
        input: text,
        dimensions: 1024
    })
    .then(response => {
        return response.data[0].embedding;
    })
    .catch(error => {
        console.error('Error generating embedding:', error);
        throw error;
    });

}

async function searchCreateVector(userAction) {
    
    const pineconeIndex = getPineconeIndex().namespace("actions");
    if (!pineconeIndex) {
            throw new Error('Pinecone index not initialized');
    }

    const userActionEmbedding = await generateEmbedding(userAction);
    const retrieveVectorQuery = await pineconeIndex.query({
            vector: userActionEmbedding,           
            topK: 10,                           
            includeMetadata: true           
    });
    console.log(retrieveVectorQuery)
    if (retrieveVectorQuery.matches && retrieveVectorQuery.matches.length > 0){
        // vector matches were found

        const top = retrieveVectorQuery.matches[0]

        if (top.score >= .90){
            return{
                action: top.metadata.action
            }
        }
    }
    else{
        // no match found, adding action to vector db
        const vectorId = `${Date.now()}`;
        await pineconeIndex.upsert([{
            id: vectorId,
            values: userActionEmbedding,
            metadata: {
                action: userAction,
            }
        }]);

    }

}


module.exports = {searchCreateVector}