import { useState, useEffect } from "react";
import CardSearch from "./components/CardSearch";
import Card from "./components/Card";
import "./App.css";

function App() {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedCardId, setSelectedCardId] = useState(null);

  useEffect(() => {
    async function loadStarterCards() {
      try {
        const response = await fetch(
          "https://api.scryfall.com/cards/search?q=t:creature"
        );

        if (!response.ok) {
          throw new Error(`API Error: ${response.status}`);
        }

        const data = await response.json();

        setCards(data.data || []);
      } catch (err) {
        console.error("Could not load starter cards:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadStarterCards();
  }, []);

  return (
    <div className="app">
      <header>
        <h1>Tcg card <search></search></h1>
        <p>Create your perfect deck</p>
      </header>

      <main>
        <section className="search-section">
          <h2>Search</h2>
          <CardSearch setCards={setCards} />
        </section>

        <section className="results-section">
          {loading && <p>Loading cards...</p>}

          {error && <p>Error: {error}</p>}

          {!loading && !error && cards.length === 0 && (
            <p>No cards found.</p>
          )}

       {cards.map((card) => (
  <Card
    key={card.id}
    card={card}
    isSelected={selectedCardId === card.id}
    onSelect={() =>
      setSelectedCardId(
        selectedCardId === card.id ? null : card.id
      )
    }
  />
))}
        </section>
      </main>
    </div>
  );
}

export default App;