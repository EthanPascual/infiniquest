import {useNavigate} from "react-router-dom"
import {useState, useEffect} from "react"
import axios from 'axios'

function Game () {
    const navigate = useNavigate()
    const [convo, setConvo] = useState([])
    const [action, setAction] = useState("")

    useEffect(() => {
        async function fetchConvo(id){
            await axios.get(`http://localhost:3000/api/game/user/${id}`).then((res) => setConvo(res.data.convo))
        }
        let id = sessionStorage.getItem("sessionId")
        fetchConvo(id)
    }, [])

    const addConvo = (item) => {
        setConvo(prev => [...prev, item]) 
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log("submitted an action")
        addConvo({role: 'user', content: action})
        setAction("")
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