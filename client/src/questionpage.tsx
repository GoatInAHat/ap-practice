import React from "react";
import { useQuery, gql } from "@apollo/client";

const QUESTION = gql`
    query question {
        randomQuestion(subject: "AP Chemistry")
    }
`;

function questionpage () {
    const { loading, error, data } = useQuery(QUESTION);
    
    if (loading) return <p>Loading...</p>;
    
    if (error) return <p>Error :(</p>;

    return (
        <div>
            <h1>{data.randomQuestion}</h1>
        </div>
    );
}

export default questionpage;