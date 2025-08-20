const GameState = require('./models/stateSchema')
const UserConvo = require('./models/userConvoSchema')
const { generateStoryLine } = require('./storyCreationService')
const { searchCreateVector } = require('./vectorService.js')

const getState = async (req, res) => {
    const state = await fetchStateById(req.params.id)
    res.json(state);
}

const createState = async(req, res) => {
    const state = new GameState(req.body);
    await state.save()
    res.json(state);
}

const getUserConvo = async (req, res) => {
    const user = await fetchUserById(req.params.userId)
    res.json(user)
}

const createUserConvo = async (req, res) => {
    const user = new UserConvo(req.body);
    await user.save()
    res.json(user)
}


const takeAction = async(req, res) => {
    //find current state in db. There should always be one
    const currState = await fetchStateById(req.params.Id)
    const userConvo = await fetchUserById(req.params.userId)

    //sees if action matches anything in possible actions, if it does, it returns the next game state. else, calls chatgpt and creates a new game state
    const userAction = req.body.action
    const actions = currState.actions
    
    // Search Vector DB for actions, if found return the most similar 
    searchCreateVector(userAction);
    
    const foundAction = actions.find(action => action.actionText === userAction)
    if(foundAction){
        userConvo.convo.push({role: 'user', content: userAction}, {role: 'assistant', content: foundAction.nextStateId.description})
        await userConvo.save()
        res.json(foundAction.nextStateId)
    } else {
        const newStoryLine =  await generateStoryLine(userConvo.convo, userAction)
        const gameState = new GameState({
            stateName: userAction,
            description: newStoryLine,
            actions: []
        })
        await gameState.save()
        //pushes the new state into the actions of the curr state
        currState.actions.push({
            actionText: userAction,
            nextStateId: gameState._id
        })
        await currState.save()
        userConvo.convo.push({role: 'user', content: userAction}, {role: 'assistant', content: newStoryLine})
        await userConvo.save()
        res.json(gameState)

    }
}

async function fetchUserById(id){
    const user = await UserConvo.findOne({userId : id})
    return user
}

async function fetchStateById(id){
    const state = await GameState.findById(id).populate('actions.nextStateId')
    return state
}

module.exports = {getState, createState, getUserConvo, createUserConvo, takeAction}