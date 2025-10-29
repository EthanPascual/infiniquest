const { createLangChain } = require("./config")
const { SystemMessage, HumanMessage, AIMessage } = require("@langchain/core/messages");

async function generateStoryLine(userConvo, action){
    const llm = createLangChain()
    const messages = [
        new SystemMessage('You are a dungeons and dragons master creating a fantasy world choose your own adventure story for the user based on the user actions. Please create the next section of the storyline based on the user\'s most recent action. Keep it a paragraph max and make sure it is relevant to the rest of the story.')
    ];
    
    
    for (const msg of userConvo) {
        if (msg.role === 'user') {
            messages.push(new HumanMessage(msg.content));
        } else if (msg.role === 'assistant') {
            messages.push(new AIMessage(msg.content));
        } else if (msg.role === 'system') {
            messages.push(new SystemMessage(msg.content));
        }
    }
    
    messages.push(new HumanMessage(action));
    
    const output = await llm.invoke(messages);  
    return output.content;
}

module.exports = { generateStoryLine } 