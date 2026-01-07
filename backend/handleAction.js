const { createLangChain, createLangChainJSON } = require("./config")
const { RunnableSequence, RunnableMap } = require("@langchain/core/runnables");
const {validateAction} = require("./promptTemplates/validateAction")
const {checkFeasibility} = require("./promptTemplates/feasibilityCheck.js")
const {classifyIntent} = require("./promptTemplates/intentClassification.js")
const { searchCreateVector } = require('./vectorService.js')
const { generateStoryLine } = require('./storyCreationService.js')

const llm  = createLangChainJSON()
const llm2 = createLangChainJSON()
const llm3 = createLangChainJSON()

const validationChain = validateAction
    .pipe(llm)
    .pipe((msg) => JSON.parse(msg.content))

const feasibilityChain = checkFeasibility
    .pipe(llm2)
    .pipe((msg) => JSON.parse(msg.content))

const intentChain = classifyIntent
    .pipe(llm3)
    .pipe((msg) => JSON.parse(msg.content))

const handleUserAction = RunnableSequence.from([
    //Instantiates a lot of variables simultaneously, as well as checks for feasibility and validation
    RunnableMap.from({
        validation: (input) => 
            validationChain.invoke({action: input.action}),
        feasibility: (input) => 
            feasibilityChain.invoke({action: input.action, inventory: input.inventory}),
        convo: (input) => input.convo,
        currentHealth: (input) => input.currentHealth,
        inventory: (input) => input.inventory
    }),

    //Throws errors if validation or feasibility fail, returns clean action if passes
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
        intent = await intentChain.invoke({action: inp.action})
        console.log(intent)

        return {
            ...inp,
            verb: intent.verb,
            target: intent.target,
            method: intent.mehtod,
            risk: intent.risk
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

module.exports = {handleUserActionHelper}