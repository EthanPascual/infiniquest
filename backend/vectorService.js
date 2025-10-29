const { getPineconeClient, getPineconeIndex } = require('./config.js');
const { getLangChainEmbeddings } = require('./config.js');


async function generateEmbedding(text) {
    const embeddings = getLangChainEmbeddings();
    const result = await embeddings.embedQuery(text);
    return result;
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

    if (retrieveVectorQuery.matches && retrieveVectorQuery.matches.length > 0) {
        // vector matches were found

        const top = retrieveVectorQuery.matches[0]

        if (top.score >= .80) {
            return {

                action: top.metadata.action
            }
        }
    }
    // no match found, adding action to vector db
    const vectorId = `${Date.now()}`;
    await pineconeIndex.upsert([{
        id: vectorId,
        values: userActionEmbedding,
        metadata: {
            action: userAction,
        }
    }]);

    return {
        action: null
    }


}


module.exports = { searchCreateVector }