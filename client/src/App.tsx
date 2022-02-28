import './App.css';
import React from "react";
import { ApolloProvider } from '@apollo/client';
import { useQuery, gql } from "@apollo/client";
import { ApolloClient, ApolloLink, HttpLink, InMemoryCache } from "@apollo/client";
import { RestLink } from "apollo-link-rest";

const QUESTION = gql`
    query question {
        randomQuestion(subject: "AP Chemistry")
    }
`;

const httpLink = new HttpLink({
  uri: "http://localhost:4000/graphql",
});

export const client = new ApolloClient({
  cache: new InMemoryCache(),
  link: ApolloLink.from([httpLink]),
});

function getRandomQuestion() {
  client.query({ query: QUESTION })
  .then(data => {
    const result = data.data.randomQuestion;

    console.log(JSON.parse(result));
  })
  
}

function App() {
  
  
  return (
    <ApolloProvider client={client}>
      <div className="App">
        <h1>Hello World!</h1>
        <button onClick={
          async () => getRandomQuestion()
          }>a</button>
          <p></p>
      </div>
    </ApolloProvider>
  );
}

export default App;
