import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from 'axios';
import { toast } from "react-toastify";
import "../css/Game.css";

function Game() {
    const navigate = useNavigate();
    const [convo, setConvo] = useState([]);
    const [action, setAction] = useState("");
    
    // Player stats
    const [health, setHealth] = useState(100);
    const [maxHealth] = useState(100);
    const [level, setLevel] = useState(1);
    const [experience, setExperience] = useState(0);

    useEffect(() => {
        const sessionId = sessionStorage.getItem("sessionId");
        if (!sessionId) return;

    async function fetchConvo(id) {
        const res = await axios.get(`https://infiniquestbackend.onrender.com/api/game/user/${id}`)
        setConvo(res.data.convo)
    }

        fetchConvo(sessionId);
    }, []);

    const addConvo = (item) => {
        setConvo(prev => [...prev, item]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const sessionId = sessionStorage.getItem("sessionId");
        console.log("submitted an action");
        
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
    };

    return (
        <div className="game-container">
            <div className="game-header">
                <h1 className="game-title">InfiniQuest</h1>
                <button onClick={() => navigate("/")} className="home-btn">
                    Home
                </button>
            </div>

            <div className="game-content">
                <div className="stats-panel">
                    <h2 className="stats-title">Player Stats</h2>
                    
                    <div className="stat-item">
                        <div className="stat-label">
                            <span>Health</span>
                            <span>{health}/{maxHealth}</span>
                        </div>
                        <div className="health-bar-container">
                            <div 
                                className="health-bar-fill" 
                                style={{ width: `${(health / maxHealth) * 100}%` }}
                            >
                                {health > 0 && `${Math.round((health / maxHealth) * 100)}%`}
                            </div>
                        </div>
                    </div>

                </div>

                <div className="chat-main">
                    <div className="chat-history">
                        {convo.map((item, index) => (
                            <div key={index} className={`message ${item.role}`}>
                                <strong>{item.role === 'user' ? 'You' : 'Story'}</strong>
                                <div>{item.content}</div>
                            </div>
                        ))}
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
            </div>
        </div>
    );
}

export default Game;