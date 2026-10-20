import { useState, useEffect } from "react";
import CardSearch from "./components/CardSearch";
import DeckBuilder from "./components/DeckBuilder";
import { normalizeYugiohCards } from "./cardUtils";
import "./App.css";

const STARTER_URLS = {
  mtg: "https://api.scryfall.com/cards/search?q=t:creature",
  yugioh: "https://db.ygoprodeck.com/api/v7/cardinfo.php?num=20&offset=0",
};

function App() {
  const [game, setGame] = useState("mtg");
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedCommander, setSelectedCommander] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function loadStarterCards() {
      setLoading(true);
      setError("");
      setCards([]);

      try {
        const response = await fetch(STARTER_URLS[game]);
        if (!response.ok) throw new Error(`API Error: ${response.status}`);

        const data = await response.json();
        if (cancelled) return;

        setCards(
          game === "mtg" ? data.data || [] : normalizeYugiohCards(data.data)
        );
      } catch (err) {
        if (!cancelled) setError(err.message || "Could not load cards.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadStarterCards();
    return () => {
      cancelled = true;
    };
  }, [game]);

  function changeGame(newGame) {
    setGame(newGame);
    setSelectedCommander(null);
  }

  return (
    <div className="app">
      <header>
        <h1>TCG Deck Builder</h1>
        <p>Build your perfect deck</p>

        <div className="game-toggle">
          <button
            className={game === "mtg" ? "active" : ""}
            onClick={() => changeGame("mtg")}
            aria-pressed={game === "mtg"}
          >
            Magic: The Gathering
          </button>
          <button
            className={game === "yugioh" ? "active" : ""}
            onClick={() => changeGame("yugioh")}
            aria-pressed={game === "yugioh"}
          >
            Yu-Gi-Oh!
          </button>
        </div>

        <p>
          Currently using:{" "}
          <strong>{game === "mtg" ? "Scryfall API" : "YGOPRODeck API"}</strong>
        </p>
      </header>

      <main>
        <section className="search-section">
          <h2>Search Cards</h2>
          <CardSearch
            setCards={setCards}
            game={game}
            selectedCommander={selectedCommander}
            setSelectedCommander={setSelectedCommander}
          />
        </section>

        <DeckBuilder
          key={game}
          cards={cards}
          loading={loading}
          error={error}
          game={game}
          selectedCommander={selectedCommander}
          setSelectedCommander={setSelectedCommander}
        />
      </main>
    </div>
  );
}

export default App;