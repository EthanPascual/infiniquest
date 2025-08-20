const express = require('express')
const {getState, createState, getUserConvo, createUserConvo, takeAction} = require('./gameController.js')
const router = express.Router()

router.get('/state/:Id', getState)
router.post('/createState', createState)
router.get('/user/:userId', getUserConvo)
router.post('/createUser', createUserConvo)
router.put('/:userId/action', takeAction)

module.exports = router;