const { createLangChain, createLangChainJSON } = require("./config")
const { SystemMessage, HumanMessage, AIMessage } = require("@langchain/core/messages");
const { PromptTemplate } = require("@langchain/core/prompts");
const { RunnableSequence, RunnableMap } = require("@langchain/core/runnables");

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

            - Influencing or requesting actions from other characters is ALLOWED,
            as long as the player does not decide the outcome.
            ("I ask the priest to heal me" is valid)
            ("I persuade the guard to open the gate" is valid)

            - Actions that REMOVE agency from other characters are NOT allowed.
            ("I make the priest heal me" is invalid)
            ("I force the guard to obey me" is invalid)

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

const checkFeasibility = new PromptTemplate({
  template: `
    You are a STRICT feasibility validator for a fantasy adventure game.

    Your job is to determine whether the player's action is physically and narratively
    possible using ONLY baseline human capabilities, known abilities, and inventory items.

    IMPORTANT RULES:

    1. The player ALWAYS has baseline human capabilities, including:
        - Moving, running, walking
        - Punching, kicking, grappling, tackling
        - Attempting to attack animals or enemies with bare hands
        - Searching, hiding, shouting, speaking
        - Interacting with nearby physical objects

    2. These baseline actions are FEASIBLE even if:
        - They are dangerous
        - They are likely to fail
        - The opponent is stronger
    Success is NOT required for feasibility.

    3. Items are ONLY required when the action explicitly depends on them.
    Examples:
        - "I stab the boar" → requires a blade
        - "I shoot the boar" → requires a ranged weapon
        - "I heal myself" → requires healing ability or item

    4. Supernatural, magical, or physics-breaking actions are NOT FEASIBLE unless
        explicitly granted.
        This includes:
            - Summoning elements (fire, lightning, ice)
            - Teleportation
            - Mind control
            - Creating energy or matter from nothing

    5. The phrase "I try" or "I attempt" does NOT grant magical or superhuman abilities,
    but DOES allow normal human attempts (punching, climbing, dodging).

    6. If the action is a normal human physical action, mark it FEASIBLE even if
    it is reckless or likely to cause harm.

    7. If ANY supernatural ability is required and not explicitly stated, mark NOT FEASIBLE.
    When uncertain, default to NOT FEASIBLE.

    8. If the action is a REQUEST, ATTEMPT, or COMMUNICATION with another character,
    evaluate ONLY whether the player can make the request — NOT whether the
    requested outcome will succeed.

    - Asking, requesting, persuading, or negotiating with NPCs is FEASIBLE
    as long as it does not grant the player supernatural control.
    - The outcome of NPC decisions is handled by the story engine, not feasibility.

    Examples (IMPORTANT):

    Action: "I punch the boar"
        → FEASIBLE (baseline human attack)

    Action: "I attack the boar with my fists"
        → FEASIBLE

    Action: "I wrestle the boar to the ground"
        → FEASIBLE (dangerous but possible)

    Action: "I stab the boar"
        → NOT FEASIBLE if no weapon in inventory

    Action: "I summon lightning and strike the boar"
        → NOT FEASIBLE if wasn't previously granted

    Action: "I try to teleport behind the boar"
        → NOT FEASIBLE if wasn't previously granted

    Return ONLY the following JSON (no markdown, no explanations):

    {{
        "is_feasible": boolean,
        "reason": string
    }}

    Inventory:
    {inventory}

    Player Action:
    {action}
  `,
  inputVariables: ["action", "inventory"]
});



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

const llm  = createLangChainJSON()
const llm2 = createLangChainJSON()

const validationChain = validateAction
    .pipe(llm)
    .pipe((msg) => JSON.parse(msg.content))

const feasibilityChain = checkFeasibility
    .pipe(llm2)
    .pipe((msg) => JSON.parse(msg.content))

const handleUserAction = RunnableSequence.from([
    RunnableMap.from({
        validation: (input) =>
            validationChain.invoke({action: input.action}),

        feasibility: (input) =>
            feasibilityChain.invoke({
                action: input.action,
                inventory: input.inventory
            }),

        convo: (input) => input.convo,
        currentHealth: (input) => input.currentHealth,
        inventory: (input) => input.inventory

    }),

    (inp) => {
        console.log(inp.validation)
        console.log(inp.feasibility)
        if(!inp.validation.is_valid)
            throw new Error("Validation Error: " + inp.validation.reason)

        if(!inp.feasibility.is_feasible)
            throw new Error("Feasbility Error: " + inp.feasibility.reason)

        return {
            ...inp,
            action: inp.validation.cleaned_action
        }
    },

    async (inp) => {
        const newStoryLine = await generateStoryLine(inp.convo, inp.action, inp.currentHealth, inp.inventory)
        return {
            error: false,
            story: newStoryLine.story,
            healthChange: newStoryLine.healthChange
        }
    }
])

async function handleUserActionHelper(userConvo, action, currentHealth, inventory){
    try{
        const output = await handleUserAction.invoke({
            convo: userConvo,
            action: action,
            currentHealth: currentHealth,
            inventory: inventory
        })

        return output
    } catch (err) {
        return {
            error: true,
            message: err.message || "Unknown error"
        }
    }
}

module.exports = { handleUserActionHelper }