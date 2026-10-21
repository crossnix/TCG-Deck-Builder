import { useState, useEffect } from "react";

async function ReadDeck () {
    const [myDeck, setmyDeck] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetch("https://basecampgenericapi.onrender.com/")
            .then((res) => res.json())
            .then((json) => {
                setMyDeck(json);
                setLoading(false);
            })
        .catch((err) => {
            setError(err.message);
            setLoading(false);
        });
    }, []);
    console.log(myDeck);
    return myDeck;
}

export default ReadDeck;