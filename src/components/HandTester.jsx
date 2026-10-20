import { useState } from "react";
import "../App.css";

function getCardImage(card) {
  return (
    card.image_uris?.normal ||
    card.card_faces?.[0]?.image_uris?.normal ||
    card.card_images?.[0]?.image_url ||
    ""
  );
}

function shuffleCards(cards) {
  const shuffled = [...cards];

  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled;
}

function HandTester({ deck, game, onBack }) {
  const startingHandSize = game === "mtg" ? 7 : 5;

  const [hand, setHand] = useState([]);
  const [message, setMessage] = useState("");

  function randomizeHand() {
    if (!deck || deck.length === 0) {
      setHand([]);
      setMessage("Add cards to your deck first.");
      return;
    }

    const shuffledDeck = shuffleCards(deck);

    setHand(
      shuffledDeck.slice(
        0,
        Math.min(startingHandSize, shuffledDeck.length)
      )
    );

    setMessage("");
  }

  return (
    <section className="hand-tester">
      <div className="tester-header">
        <div>
          <h2>Hand Tester</h2>
          <p>
            {game === "mtg"
              ? "Magic: The Gathering"
              : "Yu-Gi-Oh!"}
            {" · "}
            {deck?.length ?? 0} cards in deck
          </p>
        </div>

        <button onClick={onBack}>
          Back to Deck Builder
        </button>
      </div>

      <div className="tester-controls">
        <button
          onClick={randomizeHand}
          disabled={!deck || deck.length === 0}
        >
          {hand.length > 0
            ? "Randomize New Hand"
            : "Draw Random Hand"}
        </button>
      </div>

      {message && (
        <p className="tester-message" role="status">
          {message}
        </p>
      )}

      <h3>Your Hand ({hand.length})</h3>

      {!hand.length ? (
        <p>
          Click "Draw Random Hand" to see a random hand
          from your deck.
        </p>
      ) : (
        <div className="tester-hand">
          {hand.map((card, index) => {
            const image = getCardImage(card);

            return (
              <div
                className="tester-hand-card"
                key={`${card.id ?? card.name}-${index}`}
              >
                {image ? (
                  <img
                    src={image}
                    alt={card.name}
                    draggable="false"
                  />
                ) : (
                  <div className="card-image-fallback">
                    {card.name}
                  </div>
                )}

                <p>{card.name}</p>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

export default HandTester;