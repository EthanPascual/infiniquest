const {PromptTemplate} = require('@langchain/core/prompts')
const classifyIntent = new PromptTemplate({
    template:`
        You are an intent extractor for a fantasy game.

        Extract the player's intent from the action below.
        Do not judge validity or feasability.
        Do not invent items or outcomes.

        Return ONLY the following JSON without markdowns or explanations.
        {{
            "verb": "attack" | "defend" | "move" | "search" | "interact" | "persuade" | "ask" | "use" | "observe" | "rest",
            "target": string | null,
            "method": string | null,
            "risk": "low" | "medium" | "high"

        }}

        Player actions: {action}

    `,
    inputVariables: ["action"]
})

module.exports = {classifyIntent}