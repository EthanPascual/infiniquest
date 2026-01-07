import {useNavigate} from "react-router-dom"
import {useState, useEffect} from "react"
import axios from 'axios'
import {toast} from  "react-toastify"

function Game () {
    const navigate = useNavigate()
    const [convo, setConvo] = useState([])
    const [action, setAction] = useState("")

    useEffect(() => {
    const sessionId = sessionStorage.getItem("sessionId")
    if (!sessionId) return

    async function fetchConvo(id) {
        const res = await axios.get(`https://infiniquestbackend.onrender.com/api/game/user/${id}`)
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
        
        let message = action
        setAction("")
        try{
            const gameState = await axios.put(`https://infiniquestbackend.onrender.com/api/game/${sessionId}/action`, {action:message})
            addConvo({role: 'user', content: action})
            console.log(gameState)
            addConvo({role:"assistant", content: gameState.data.state.description})
        }catch(error){
            console.log("we have reached the error")
            const errMessage = error.response.data.message
            console.log(errMessage)
            alert(errMessage)
        }
        
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