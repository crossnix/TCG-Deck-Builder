import { useState, useEffect } from "react";


async function CreateDeck (deck) {
    const deckObj = Object.assign({}, deck);
    const [myDeck, setmyDeck] = useState(deckObj);

    const jsonDeck = JSON.stringify(myDeck);

    console.log(jsonDeck);

    const url = "https://basecampgenericapi.onrender.com/";
    const response = await fetch(url, {
        method: "POST",
        headers: {
        "Content-Type": "application/json"
        },
        body: jsonDeck
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    console.log("Server response:", data);
}

export default CreateDeck;