import { useState, useEffect } from "react";

async function DeleteDeck (deck) {
    //const deckObj = Object.assign({}, deck);
    //const [myDeck, setmyDeck] = useState(deckObj);

    //const jsonDeck = JSON.stringify(myDeck);
    //
    
    await fetch(`https://basecampgenericapi.onrender.com/`, {
        method: "DELETE"
    })
}

