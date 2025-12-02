const { createLangChain, createLangChainJSON } = require("./config")
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
            - If the user's character causes a world change, it is ALLOWED.
            ("I make the castle explode" is valid)
            - Spontaneous world changes not caused by the user are NOT allowed.
            ("The castle explodes" is invalid)
            - Creating new objects, powers, or impossible effects is allowed because FEASIBILITY will be checked later.
            Your task is ONLY to confirm that the user is the one doing it.
            - Vague or general first-person actions are allowed:
            ("I get ready", "I prepare myself", "I feel anxious")

        Forbidden:
            - Any action not written in first person
            ("he sharpens his sword", "my friend grabs his bow")
            - Directly controlling or deciding other characters' actions or states
            ("I make the guard fall asleep", "I force the king to kneel")
            - Narration not tied to the user's action
            ("the world shakes", "a dragon appears", "the sun disappears")

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


async function generateStoryLine(userConvo, action, currentHealth) {
    const llm = createLangChainJSON()  // JSON MODE
    const messages = [
        new SystemMessage(`You are a Dungeon Master guiding the user through an open-ended fantasy story. 

                            You must respond with valid JSON in this format:
                            {"story": "your story text", "healthChange": number}

                            Story Guidelines:
                                - Write 3-6 sentences in the "story" field
                                - Do NOT present choices or options
                                - Describe consequences naturally
                                - Never mention JSON, health mechanics, or game systems in the story

                            Health System (Current: ${currentHealth}/100):
                                - Combat/danger: -5 to -25 damage
                                - Direct hits: -10 to -30 damage
                                - Severe trauma (falls, explosions): -30 to -50 damage
                                - Healing (potions, rest, magic): +10 to +30
                                - Dodges/blocks: 0 to -5 damage
                                - Safe actions: 0 change

                            Examples:
                            {"story": "You swing at the goblin. It dodges but scratches your arm.", "healthChange": -12}
                            {"story": "You drink the potion. Warmth spreads as your wounds close.", "healthChange": 25}
                            {"story": "The innkeeper shares rumors of nearby bandits.", "healthChange": 0}`)
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
    
    try {

        // JSON MODE
        let content = output.content.trim();
        
        const parsed = JSON.parse(content);
      
        if (!parsed.story || typeof parsed.healthChange !== 'number') {
            throw new Error('Invalid JSON structure');
        }
        
        return {
            story: parsed.story,
            healthChange: parsed.healthChange
        };
    } catch (err) {
        console.error("Failed to parse LLM JSON response:", err);
        console.error("Raw content:", output.content);
        // safety
        return {
            story: output.content,
            healthChange: 0
        };
    }
}

async function handleUserAction(userConvo, action, currentHealth) {
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

    const result = await generateStoryLine(userConvo, res.cleaned_action, currentHealth);

    return {
        error: false,
        story: result.story,
        healthChange: result.healthChange
    }
}

module.exports = { handleUserAction }