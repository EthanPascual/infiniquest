import {useNavigate} from "react-router-dom"

function Home (){
    const navigate = useNavigate()

    return(
    <>
    <h1>InfiniQuest</h1>
    <p>hello this is our personal project by ethan and edward</p>
    <button onClick={() => navigate("/chat")}>Start Game</button>
    </>
    )
}
export default Home