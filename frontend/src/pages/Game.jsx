import {useNavigate} from "react-router-dom"
import {useState, useEffect} from "react"
import axios from 'axios'

function Game () {
    const navigate = useNavigate()
    const [convo, setConvo] = useState([])
    const [action, setAction] = useState("")
    const [id, setId] = useState("")

    useEffect(() => {
    const sessionId = sessionStorage.getItem("sessionId")
    if (!sessionId) return

    async function fetchConvo(id) {
        const res = await axios.get(`http://localhost:3000/api/game/user/${id}`)
        setConvo(res.data.convo)
    }

    fetchConvo(sessionId)
}, [])

    const addConvo = (item) => {
        setConvo(prev => [...prev, item]) 
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        const sessionId = sessionStorage.getItem("sessionId");
        console.log("submitted an action")
        addConvo({role: 'user', content: action})
        let message = action
        setAction("")
        const gameState = await axios.put(`http://localhost:3000/api/game/${sessionId}/action`, {action:message})
        console.log(gameState.data.description)
        addConvo({role:"assistant", content: gameState.data.description})
    }

    return(
        <>
        <h1>Game</h1>
        <button onClick={() => navigate("/")}>Home</button>
        <div className="chat-container">
                <div className="chat-history">
                    {convo.map((item, index) => (
                        <div key={index} className={`message ${item.role}`}>
                            <strong>{item.role === 'user' ? 'You' : 'Story'}</strong>
                            <div>{item.content}</div>
                        </div>
                    ))}
                    <div/>
                </div>
                <form onSubmit={handleSubmit} className="input-area">
                    <input
                        type="text"
                        value={action}
                        onChange={(e) => setAction(e.target.value)}
                        placeholder="Take an action..."
                    />
                    <button type="submit">
                        Send
                    </button>
                </form>
            </div>
        </>
    )
}

export default Game