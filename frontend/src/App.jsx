import { useState } from 'react'
import {BrowserRouter, Routes, Route} from 'react-router-dom'
import Home from './pages/Home.jsx'
import Game from './pages/Game.jsx'
import { useEffect } from 'react'
import axios from 'axios'

function generateUniqueId() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

function App() {
  const [sessionId, setSessionId] = useState(null)

  useEffect(() => {
    async function createUser(id){
      await axios.post('https://infiniquestbackend.onrender.com/api/game/createUser', {userId: id})
    }

    let id = sessionStorage.getItem("sessionId")
    if(!id){
      id = generateUniqueId()
      sessionStorage.setItem("sessionId", id)
      createUser(id)
    }
    setSessionId(id)
    console.log(id)
  }, [])

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home/>} />
        <Route path="/chat" element={<Game/>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
