const express = require('express')
const {getState, createState, getUserConvo, createUserConvo, takeAction} = require('./gameController.js')
const router = express.Router()

router.get('/state/:id', getState)
router.post('/createState', createState)
router.get('/user/:userid', getUserConvo)
router.post('/createUser', createUserConvo)
router.put('/:id/:userId/action', takeAction)

module.exports = router;