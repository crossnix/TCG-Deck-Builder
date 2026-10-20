import { getCardImage } from "../cardUtils";

function Card({ card, isSelected, onSelect, onAdd }) {
  const image = getCardImage(card);

  const effect =
    card.oracle_text ||
    card.card_faces
      ?.map((face) => `${face.name}\n${face.oracle_text || ""}`)
      .join("\n\n") ||
    "No effect text available.";

  return (
    <div className={`card ${isSelected ? "selected" : ""}`} onClick={onSelect}>
      <h3>{card.name}</h3>

      {image && <img src={image} alt={card.name} className="card-image" />}

      <p className="card-type">{card.type_line}</p>

      {isSelected && (
        <div className="card-effect">
          <strong>Card Effects</strong>
          <p>{effect}</p>
        </div>
      )}

      <button
        onClick={(event) => {
          event.stopPropagation();
          onAdd();
        }}
      >
        Add to Deck
      </button>
    </div>
  );
}

export default Card;