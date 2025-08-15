const express = require('express')
const {getState, createState, getUserConvo, createUserConvo, takeAction} = require('./gameController.js')
const router = express.Router()

router.get('/:id', getState)
router.post('/createState', createState)
router.get('/:userid', getUserConvo)
router.post('/createUser', createUserConvo)
router.put('/:id/:userid/action', takeAction)

module.exports = router;