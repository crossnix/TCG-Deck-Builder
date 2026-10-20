export function getCardImage(card) {
  return (
    card.image_uris?.normal ||
    card.card_faces?.[0]?.image_uris?.normal ||
    card.card_images?.[0]?.image_url ||
    ""
  );
}

export function normalizeYugiohCards(cards = []) {
  return cards.map((card) => ({
    ...card,
    id: String(card.id),
    type_line: card.type,
    oracle_text: card.desc,
    image_uris: { normal: card.card_images?.[0]?.image_url },
    game: "yugioh",
  }));
}

export function isExtraDeckCard(card) {
  return /fusion|synchro|xyz|link/i.test(card.type_line || card.type || "");
}