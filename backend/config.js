const { mongoose } = require('mongoose')
const { Pinecone } = require('@pinecone-database/pinecone');
const { OpenAI } = require("openai")
const { ChatOpenAI, OpenAIEmbeddings } = require("@langchain/openai");

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

const createLangChain = () =>
  new ChatOpenAI({
    model: "gpt-4o-mini",
    temperature: 0.7,
    openAIApiKey: process.env.Open_AI_KEY,
  });

const getLangChainEmbeddings = () =>
  new OpenAIEmbeddings({
    model: "text-embedding-3-small",
    openAIApiKey: process.env.Open_AI_KEY,
    dimensions: 1024,
  });

module.exports = {connectDB, connectVectorDB, getPineconeClient, getPineconeIndex, createLangChain, getLangChainEmbeddings};