const {OpenAI} = require("openai")

async function generateStoryLine(userConvo, action){
    const openai = new OpenAI({apiKey: process.env.Open_AI_KEY})
    const history = [{role: 'system', content: 'You are a dungeons and dragons master creating a fantasy world choose your own adventure story for the user based on the user actions. Please create the next section of the storyline based on the user\'s most recent action. Try to guide the user towards a specific action, but don\'t outright tell them what to do. Keep it a paragraph max and make sure it is relevant to the rest of the story.'}]
    history.push(...userConvo)
    history.push({role: "user", content: action})
    const output = await openai.chat.completions.create({
        model:"gpt-4o-mini",
        messages:history
    })
    
    return output.choices[0].message.content;
}

module.exports = { generateStoryLine } 