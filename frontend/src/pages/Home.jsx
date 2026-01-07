import { useNavigate } from "react-router-dom";
import "../css/Home.css";

function Home() {
  const navigate = useNavigate();

  return (
    <div className="home-container">
      <div className="home-content">
        <h1 className="home-title">
          Welcome to InfiniQuest <span className="highlight">like a boss.</span>
        </h1>
        <h2 className="home-subtitle">Have fun while you do it.</h2>
        <p className="home-description">
          A personal project by Ethan and Edward featuring interactive
          adventures, challenges, and endless possibilities.
        </p>
        <div className="button-group">
          <button className="btn btn-primary" onClick={() => navigate("/chat")}>
            Start Game
          </button>
        </div>
      </div>

      <div className="code-preview">
        <pre>
          <code>
            <span className="code-keyword">const</span> adventure = {"{"}
            {"\n"}  player: <span className="code-string">"You"</span>,{"\n"}
            {"  "}quest: <span className="code-string">"Infinite"</span>,{"\n"}
            {"  "}fun: <span className="code-keyword">true</span>,{"\n"}
            {"  "}possibilities: <span className="code-function">Infinity</span>
            {"\n"}
            {"}"};
          </code>
        </pre>
      </div>
    </div>
  );
}

export default Home;