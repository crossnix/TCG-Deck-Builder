
const ENDPOINT = "https://basecampgenericapi.onrender.com/";

function UpdateDeck({ deck }) {
  async function update() {
    const MyDeck = assign({}, deck);
    try {
      const res = await fetch(ENDPOINT, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(MyDeck )
      });
      if (!res.ok) throw new Error(res.status);
    } catch (err) {
      onWarning(`Could not update deck: ${err.message}`);
    }
  }

  return <button onClick={update}>Update Deck</button>;
}

export default UpdateDeck;