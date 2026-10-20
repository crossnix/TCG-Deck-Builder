import { useState } from "react";
import { getCardImage, normalizeYugiohCards } from "../cardUtils";

function buildUrl({ game, search, commanderMode, selectedCommander }) {
  if (game !== "mtg") {
    return `https://db.ygoprodeck.com/api/v7/cardinfo.php?fname=${encodeURIComponent(search)}`;
  }

  let query = search;

  if (commanderMode) {
    query = `is:commander ${query}`;
  } else if (selectedCommander) {
    const identity = (selectedCommander.color_identity || [])
      .join("")
      .toLowerCase();
    query = `(${query}) id<=${identity || "c"}`;
  }

  return `https://api.scryfall.com/cards/search?q=${encodeURIComponent(query)}`;
}

function CardSearch({ setCards, game, selectedCommander, setSelectedCommander }) {
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [commanderMode, setCommanderMode] = useState(false);
  const [commanderResults, setCommanderResults] = useState([]);

  const isMagic = game === "mtg";

  function resetSearch() {
    setSearch("");
    setCards([]);
    setCommanderResults([]);
    setError("");
  }

  async function searchCards(event) {
    event.preventDefault();
    const term = search.trim();
    if (!term) return;

    setLoading(true);
    setError("");
    setCommanderResults([]);

    try {
      const url = buildUrl({ game, search: term, commanderMode, selectedCommander });
      const response = await fetch(url);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.details || data.error || "No matching cards found.");
      }

      const results = isMagic ? data.data || [] : normalizeYugiohCards(data.data);

      if (isMagic && commanderMode) {
        setCommanderResults(results);
        setCards([]);
      } else {
        setCards(results);
      }
    } catch (err) {
      setCards([]);
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  function chooseCommander(card) {
    setSelectedCommander(card);
    setCommanderMode(false);
    resetSearch();
  }

  function toggleCommanderMode() {
    setCommanderMode((current) => !current);
    resetSearch();
  }

  const placeholder = !isMagic
    ? "Search Yu-Gi-Oh! cards..."
    : commanderMode
      ? "Search legendary creatures..."
      : selectedCommander
        ? "Search cards within your Commander's colors..."
        : "Choose a Commander first...";

  return (
    <div className="card-search">
      {isMagic && (
        <section className="commander-selector">
          <h3>Commander Settings</h3>

          {selectedCommander ? (
            <div className="selected-commander">
              <img
                src={getCardImage(selectedCommander)}
                alt={selectedCommander.name}
                className="commander-image"
              />
              <p>
                Selected Commander: <strong>{selectedCommander.name}</strong>
              </p>
              <p>
                Color Identity:{" "}
                {selectedCommander.color_identity?.join(", ") || "Colorless"}
              </p>
            </div>
          ) : (
            <p>Select a Commander before searching for deck cards.</p>
          )}

          <button type="button" onClick={toggleCommanderMode}>
            {commanderMode
              ? "Cancel Commander Search"
              : selectedCommander
                ? "Choose a Different Commander"
                : "Choose a Commander"}
          </button>
        </section>
      )}

      <form onSubmit={searchCards}>
        <input
          type="text"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder={placeholder}
        />
        <button
          type="submit"
          disabled={loading || (isMagic && !commanderMode && !selectedCommander)}
        >
          {loading ? "Searching..." : "Search"}
        </button>
      </form>

      {error && <p className="error-message">{error}</p>}

      {commanderResults.length > 0 && (
        <section className="commander-results">
          <h3>Choose Your Commander</h3>

          <div className="card-grid">
            {commanderResults.map((card) => (
              <div className="commander-option" key={card.id}>
                <img src={getCardImage(card)} alt={card.name} />
                <h4>{card.name}</h4>
                <p>
                  Color Identity: {card.color_identity?.join(", ") || "Colorless"}
                </p>
                <button type="button" onClick={() => chooseCommander(card)}>
                  Select Commander
                </button>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

export default CardSearch;