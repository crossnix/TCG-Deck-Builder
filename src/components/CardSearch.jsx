import { useState } from "react";

function CardSearch({ setCards }) {
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  async function searchCards(event) {
    event.preventDefault();

    if (!search.trim()) {
      return;
    }

    setLoading(true);

    try {
      const query = encodeURIComponent(search.trim());

      const response = await fetch(
        `https://api.scryfall.com/cards/search?q=${query}`
      );

      if (!response.ok) {
        throw new Error("No cards found");
      }

      const data = await response.json();

      setCards(data.data || []);
    } catch (error) {
      console.error("Search failed:", error);
      setCards([]);
      alert("No cards found. Try another search.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={searchCards}>
      <input
        type="text"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        placeholder="Search Magic cards..."
      />

      <button type="submit" disabled={loading}>
        {loading ? "Searching..." : "Search"}
      </button>
    </form>
  );
}

export default CardSearch;