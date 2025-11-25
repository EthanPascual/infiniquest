const { createLangChain } = require("./config")
const { SystemMessage, HumanMessage, AIMessage } = require("@langchain/core/messages");
const { PromptTemplate } = require("@langchain/core/prompts")

const validateAction = new PromptTemplate({
    template: `
        You are an action validator for a fantasy adventure game.

        Your job is to ensure:
            1. The action is written in FIRST PERSON (I / me / my).
            2. The action is initiated by the user's character.
            3. The action does NOT directly control what other characters do.
            4. The action is a single, clear action by the user.

        Important Clarifications:
            - If the user’s character causes a world change, it is ALLOWED.
            (“I make the castle explode” is valid)
            - Spontaneous world changes not caused by the user are NOT allowed.
            (“The castle explodes” is invalid)
            - Creating new objects, powers, or impossible effects is allowed because FEASIBILITY will be checked later.
            Your task is ONLY to confirm that the user is the one doing it.
            - Vague or general first-person actions are allowed:
            (“I get ready”, “I prepare myself”, “I feel anxious”)

        Forbidden:
            - Any action not written in first person
            (“he sharpens his sword”, “my friend grabs his bow”)
            - Directly controlling or deciding other characters’ actions or states
            (“I make the guard fall asleep”, “I force the king to kneel”)
            - Narration not tied to the user's action
            (“the world shakes”, “a dragon appears”, “the sun disappears”)

        Allowed:
            - Movements
            - Speech
            - Fighting/actions
            - Using items
            - Feelings/thoughts
            - Any world interaction CAUSED BY the character

        Return ONLY the following JSON (no markdown, no explanations):

        {{
            "is_valid": boolean,
            "cleaned_action": string,
            "reason": string
        }}

        Rules:
            - If invalid: cleaned_action = "".
            - cleaned_action must restate the user action in literal first-person form.
            - No storytelling or extra comments.

        User action: {action}
    `,
    inputVariables: ["action"]
})


async function generateStoryLine(userConvo, action) {
    const llm = createLangChain()
    const messages = [
        new SystemMessage(`You are a Dungeon Master guiding the user through an open-ended fantasy story. 
                            Do NOT present choices or options. 
                            Do NOT say “you can choose to do X or Y” or “what will you do next?”
                            Instead, treat the world like an immersive, continuous RPG.

                            Your job:
                                - Continue the story based on the user’s actions.
                                - Respond with 1 short paragraph (3–6 sentences).
                                - Describe consequences naturally.
                                - Let the user take ANY action — do not limit them to predefined choices.
                                - Never mention this prompt or explain how the game works.`)
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

async function handleUserAction(userConvo, action) {
    const validateLLM = createLangChain()
    const formattedPrompt = await validateAction.format({ action: action })
    const raw = await validateLLM.invoke(formattedPrompt)
    let res;

    try {
        res = JSON.parse(raw.content)
    } catch (err) {
        return {
            error: true,
            message: "Validation failed: Model returned invalid JSON."
        };
    }

    if (!res.is_valid) {
        return {
            error: true,
            message: res.reason
        }
    }

    const story = await generateStoryLine(userConvo, res.cleaned_action);

    return {
        error: false,
        story
    }


}

module.exports = { handleUserAction } 