const { mongoose } = require('mongoose')
const { Pinecone } = require('@pinecone-database/pinecone');
const { OpenAI } = require("openai")
require('dotenv').config()

const connectDB = async () => {
    await mongoose.connect(process.env.MONGO_URI)
        .then(() => console.log("Connected to MongoDB"))
        .catch((err) => console.error("Error Connecting to MongoDB", err))
}

let pineconeClient = null;
let pineconeIndex = null;

const connectVectorDB = async () => {
    pineconeClient = new Pinecone({
        apiKey: process.env.PINECONE_KEY
    });
    
    const indexName = 'infiniquest'; 
    pineconeIndex = pineconeClient.index(indexName);
   
    return pineconeIndex.describeIndexStats()
        .then((indexStats) => {
            console.log("Connected to Pinecone Vector DB");
        })
        .catch((err) => {
            console.error("Error Connecting to Pinecone Vector DB", err);
            throw err; 
        });
}
const getPineconeClient = () => pineconeClient;
const getPineconeIndex = () => pineconeIndex;

let openaiClient = null;
const connectOpenAI = () => {
    try {
        openaiClient = new OpenAI({
            apiKey: process.env.Open_AI_KEY
        });
        console.log("OpenAI client connceted");
        return openaiClient;
    } catch (error) {
        console.error("Error Connecting OpenAI", error);
        throw error;
    }
}
const getOpenAI = () => openaiClient;

module.exports = {connectDB, connectVectorDB, getPineconeClient, getPineconeIndex, connectOpenAI, getOpenAI};