import "../App.css";

function isExtraDeckCard(card) {
  const type = card.type_line || card.type || "";
  return /fusion|synchro|xyz|link/i.test(type);
}

function ViewDeck({ deck, onRemove, onClear, onBack, game = "mtg" }) {
  const isMagic = game === "mtg";

  const mainCards = deck
    .map((card, index) => ({ card, index }))
    .filter(({ card }) => isMagic || !isExtraDeckCard(card));

  const extraCards = deck
    .map((card, index) => ({ card, index }))
    .filter(({ card }) => !isMagic && isExtraDeckCard(card));

  function renderCards(cards) {
    if (cards.length === 0) {
      return <p>No cards in this section yet.</p>;
    }

    return (
      <div className="deck-card-grid">
        {cards.map(({ card, index }) => {
          const image =
            card.image_uris?.normal ||
            card.card_faces?.[0]?.image_uris?.normal ||
            card.card_images?.[0]?.image_url;

          return (
            <div className="deck-card" key={`${card.id}-${index}`}>
              {image && (
                <img
                  src={image}
                  alt={card.name}
                  className="deck-card-image"
                />
              )}

              <div className="deck-card-info">
                <h4>{card.name}</h4>
                <small>{card.type_line || card.type}</small>
                <button onClick={() => onRemove(index)}>Remove</button>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <section className="deck-section">
      <h2>{isMagic ? "My Commander Deck" : "My Yu-Gi-Oh! Deck"}</h2>

      {isMagic ? (
        <>
          <p className="deck-count">{deck.length} / 100 cards</p>
          {renderCards(mainCards)}
        </>
      ) : (
        <>
          <section className="deck-list-section">
            <h3>Main Deck ({mainCards.length} / 60)</h3>
            <p>Standard Main Deck size: 40–60 cards.</p>
            {renderCards(mainCards)}
          </section>

          <section className="deck-list-section">
            <h3>Extra Deck ({extraCards.length} / 15)</h3>
            <p>Fusion, Synchro, Xyz, and Link monsters go here.</p>
            {renderCards(extraCards)}
          </section>
        </>
      )}

      <div className="hand-tester-buttons">
        <button onClick={onBack}>Back to Deck Builder</button>
        <button onClick={onClear} disabled={deck.length === 0}>
          Clear Deck
        </button>
      </div>
    </section>
  );
}

export default ViewDeck;