import {useNavigate} from "react-router-dom"

function Game () {
    const navigate = useNavigate()

    return(
        <>
        <h1>Game</h1>
        <p>This will be the game page, where the user can play</p>
        <button onClick={() => navigate("/")}>Home</button>
        </>
    )
}

export default Game