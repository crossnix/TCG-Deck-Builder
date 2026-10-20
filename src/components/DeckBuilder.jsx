import { useEffect, useState } from "react";
import Card from "./Card";
import ViewDeck from "./ViewDeck";
import HandTester from "./HandTester";
import { getCardImage, isExtraDeckCard } from "../cardUtils";

const BASIC_LAND_NAMES = ["Plains", "Island", "Swamp", "Mountain", "Forest"];
const EXTRA_LIMIT = 15;

function ProgressBar({ value, max }) {
  return (
    <div className="deck-progress">
      <div
        className="deck-progress-fill"
        style={{ width: `${Math.min(100, (value / max) * 100)}%` }}
      />
    </div>
  );
}

function DeckBuilder({ cards, loading, error, game, selectedCommander, setSelectedCommander }) {
  const isMagic = game === "mtg";
  const mainLimit = isMagic ? 100 : 60;

  const [deck, setDeck] = useState([]);
  const [view, setView] = useState("builder");
  const [expandedCardId, setExpandedCardId] = useState(null);
  const [deckMessage, setDeckMessage] = useState("");
  const [warning, setWarning] = useState("");

  const [basicLands, setBasicLands] = useState([]);
  const [landCounts, setLandCounts] = useState({});
  const [landLoading, setLandLoading] = useState(false);
  const [landError, setLandError] = useState("");
  const [showBasicLands, setShowBasicLands] = useState(true);

  const extraDeck = isMagic ? [] : deck.filter(isExtraDeckCard);
  const mainDeck = isMagic ? deck : deck.filter((card) => !isExtraDeckCard(card));

  useEffect(() => {
    if (!isMagic) return;

    let cancelled = false;

    async function fetchBasicLands() {
      setLandLoading(true);
      setLandError("");

      try {
        const response = await fetch(
          "https://api.scryfall.com/cards/search?q=t%3Abasic+unique%3Acards"
        );
        if (!response.ok) throw new Error("Could not load basic lands.");

        const data = await response.json();
        if (!cancelled) {
          setBasicLands(
            (data.data || []).filter((card) => BASIC_LAND_NAMES.includes(card.name))
          );
        }
      } catch (err) {
        if (!cancelled) setLandError(err.message);
      } finally {
        if (!cancelled) setLandLoading(false);
      }
    }

    fetchBasicLands();
    return () => {
      cancelled = true;
    };
  }, [isMagic]);

  useEffect(() => {
    if (!isMagic) return;

    setDeck((current) => {
      const rest = current.filter((card) => !card.isCommander);
      return selectedCommander
        ? [{ ...selectedCommander, isCommander: true }, ...rest]
        : rest;
    });
  }, [selectedCommander, isMagic]);

  function addToDeck(card) {
    const isExtra = !isMagic && isExtraDeckCard(card);
    const targetDeck = isExtra ? extraDeck : mainDeck;
    const targetLimit = isExtra ? EXTRA_LIMIT : mainLimit;

    if (isMagic && selectedCommander) {
      const allowed = selectedCommander.color_identity || [];
      const legal = (card.color_identity || []).every((c) => allowed.includes(c));

      if (!legal) {
        setWarning(`${card.name} does not match your Commander's color identity.`);
        return;
      }
    }

    if (targetDeck.length >= targetLimit) {
      setWarning(
        isExtra
          ? "Your Extra Deck is full. The limit is 15 cards."
          : `Your ${isMagic ? "deck has reached its 100-card limit" : "Main Deck is full. The limit is 60 cards"}.`
      );
      return;
    }

    const copies = deck.filter((c) => c.name === card.name).length;
    const isBasicLand = card.type_line?.includes("Basic Land");

    if (isMagic && copies > 0 && !isBasicLand) {
      setWarning(
        "Commander normally allows one copy of each card, except basic lands and cards with special exceptions."
      );
      return;
    }

    if (!isMagic && copies >= 3) {
      setWarning(
        "  Yu-Gi-Oh! Only Allows A Max Of 3 Cards With The Same Name."
      );
      return;
    }

    setDeck((current) => [...current, card]);
    setDeckMessage(`${card.name} added to the ${isExtra ? "Extra Deck" : "Main Deck"}.`);
  }

  function addBasicLands(land) {
    const quantity = Number(landCounts[land.name]) || 0;

    if (quantity <= 0) {
      setDeckMessage("Choose how many lands you want to add.");
      return;
    }

    const available = mainLimit - mainDeck.length;

    if (available <= 0) {
      setWarning("Your deck is full.");
      return;
    }

    const amount = Math.min(quantity, available);

    setDeck((current) => [...current, ...Array(amount).fill(land)]);
    setLandCounts((current) => ({ ...current, [land.name]: 0 }));
    setDeckMessage(`Added ${amount} ${land.name} card(s).`);

    if (amount < quantity) setWarning("Only the available deck slots were filled.");
  }

  function removeFromDeck(index) {
    const removed = deck[index];
    setDeck((current) => current.filter((_, i) => i !== index));

    if (removed?.isCommander) setSelectedCommander(null);
    setDeckMessage(removed ? `${removed.name} removed from your deck.` : "");
  }

  function clearDeck() {
    setDeck([]);
    setSelectedCommander(null);
    setDeckMessage("Deck cleared.");
  }

  const backToBuilder = () => setView("builder");

  if (view === "deck") {
    return (
      <ViewDeck
        deck={deck}
        game={game}
        onRemove={removeFromDeck}
        onClear={clearDeck}
        onBack={backToBuilder}
      />
    );
  }

  if (view === "hand") {
    return <HandTester deck={mainDeck} game={game} onBack={backToBuilder} />;
  }

  return (
    <>
      {isMagic && (
        <section className="basic-lands-section">
          <div className="basic-lands-header">
            <div>
              <h2>Basic Lands</h2>
              <p>Add basic lands directly to your deck.</p>
            </div>
            <button onClick={() => setShowBasicLands((current) => !current)}>
              {showBasicLands ? "Hide Lands ▲" : "Show Lands ▼"}
            </button>
          </div>

          {showBasicLands && (
            <>
              {landLoading && <p>Loading basic lands...</p>}
              {landError && <p className="error-message">{landError}</p>}

              <div className="basic-land-grid">
                {basicLands.map((land) => (
                  <div className="basic-land-card" key={land.id}>
                    <img src={getCardImage(land)} alt={land.name} />
                    <h3>{land.name}</h3>

                    <label htmlFor={`land-${land.id}`}>Quantity</label>
                    <input
                      id={`land-${land.id}`}
                      type="number"
                      min="0"
                      max={mainLimit}
                      value={landCounts[land.name] ?? 0}
                      onChange={(event) =>
                        setLandCounts((current) => ({
                          ...current,
                          [land.name]: Math.max(
                            0,
                            Math.min(mainLimit, Number(event.target.value) || 0)
                          ),
                        }))
                      }
                    />

                    <button onClick={() => addBasicLands(land)}>Add Lands</button>
                  </div>
                ))}
              </div>
            </>
          )}
        </section>
      )}

      <section className="results-section">
        <h2>Card Results</h2>

        {loading && <p>Loading cards...</p>}
        {error && <p className="error-message">{error}</p>}
        {!loading && !error && cards.length === 0 && <p>No cards found.</p>}

        <div className="card-grid">
          {cards.map((card) => (
            <Card
              key={card.id}
              card={card}
              isSelected={expandedCardId === card.id}
              onSelect={() =>
                setExpandedCardId((current) => (current === card.id ? null : card.id))
              }
              onAdd={() => addToDeck(card)}
            />
          ))}
        </div>
      </section>

      <section className="deck-section">
        <h2>{isMagic ? "My Commander Deck" : "My Yu-Gi-Oh! Deck"}</h2>

        {isMagic ? (
          <>
            <p className="deck-count">{mainDeck.length} / 100 cards</p>
            <ProgressBar value={mainDeck.length} max={100} />
            <p>Commander: {selectedCommander?.name || "Not selected"}</p>
          </>
        ) : (
          <div className="yugioh-deck-counts">
            <div>
              <h3>Main Deck</h3>
              <p>{mainDeck.length} / 60 cards</p>
              <ProgressBar value={mainDeck.length} max={60} />
              <small>40–60 cards recommended for a standard deck.</small>
            </div>

            <div>
              <h3>Extra Deck</h3>
              <p>{extraDeck.length} / {EXTRA_LIMIT} cards</p>
              <ProgressBar value={extraDeck.length} max={EXTRA_LIMIT} />
            </div>
          </div>
        )}

        <div className="hand-tester-buttons">
          <button onClick={() => setView("deck")}>View Deck</button>
          <button onClick={() => setView("hand")} disabled={mainDeck.length === 0}>
            Test Hand
          </button>
        </div>

        {deckMessage && <p role="status">{deckMessage}</p>}
      </section>

      {warning && (
        <div className="warning-overlay">
          <div className="warning-popup" role="alertdialog" aria-modal="true">
            <h2>Deck Builder Notice</h2>
            <p>{warning}</p>
            <button onClick={() => setWarning("")}>Got it</button>
          </div>
        </div>
      )}
    </>
  );
}

export default DeckBuilder;