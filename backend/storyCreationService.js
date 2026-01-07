const { createLangChain, createLangChainJSON } = require("./config")
const { SystemMessage, HumanMessage, AIMessage } = require("@langchain/core/messages");
const { PromptTemplate } = require("@langchain/core/prompts");
const { RunnableSequence, RunnableMap } = require("@langchain/core/runnables");


async function generateStoryLine(userConvo, action, currentHealth, inventory) {
    const llm = createLangChainJSON()
    const messages = [
        new SystemMessage(`
                You are a Dungeon Master guiding the user through an open-ended fantasy story.

                You MUST respond with valid JSON in this exact format:
                {"story": string, "healthChange": number}

                Rules:
                    - Write 3–6 sentences in "story"
                    - Do NOT present choices or options
                    - Describe consequences naturally
                    - Never mention JSON, health mechanics, or game systems
                    - Assume the action has already passed validation and feasibility
                    - Only use objects found in the inventory to create the storyline. If None, generate a storyline without using any items.
                        inventory: ${inventory}

                Current Health: ${currentHealth}/100
                Health Change Guidelines:
                    - Combat or danger: -5 to -25
                    - Direct hits: -10 to -30
                    - Severe trauma: -30 to -50
                    - Healing: +10 to +30
                    - Safe actions: 0
`)
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

module.exports = { generateStoryLine }