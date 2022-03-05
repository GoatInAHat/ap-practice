import './App.css';
import React, { useEffect, useState } from "react";
import { ApolloProvider, selectHttpOptionsAndBody } from '@apollo/client';
import { useQuery, gql } from "@apollo/client";
import { ApolloClient, ApolloLink, HttpLink, InMemoryCache } from "@apollo/client";
import { useLazyQuery } from '@apollo/client';

const QUESTIONS = gql`
    query question {
        allQuestions(subject: "AP Chemistry")
    }
`;

const httpLink = new HttpLink({
  uri: "http://localhost:4000/graphql",
});

export const client = new ApolloClient({
  cache: new InMemoryCache(),
  link: ApolloLink.from([httpLink]),
});

async function getAllQuestions(subject: String) {
  const data = await client.query({ query: gql`
    query question { allQuestions(subject: "AP Chemistry") }` })
  
  return JSON.parse(data.data.allQuestions).questions;
}

function randomQuestion(questions:[Object]) {
  console.log(questions)
  const randomint = Math.floor(Math.random() * questions.length)
  return questions[randomint]
}

function AnswerButton (key:String, text:String) {
  return text
}

interface QuestionProps {
}

interface QuestionState {
  content: any;
}

function Question () {
  const [question, setquestion]:any = useState(null);

  useEffect(() => {
    async function getQuestion() {
      const question:any = randomQuestion(await getAllQuestions("AP Chemistry"));
      setquestion(question.html);
    }
    getQuestion();
  }, []);

  return (
    <div className="Question" dangerouslySetInnerHTML={{__html: question}}></div>
  )
}

class QuestionContent extends React.Component<QuestionProps, QuestionState> {
  constructor(props:Object) {
    super(props);
    this.setState({});
  }

  render() {
    
    return (
      <Question></Question>
    )
  }
}

function App() {
  
  return (
    <ApolloProvider client={client}>
      <div className="App">
        <button onClick={
          async () => console.log(randomQuestion(await getAllQuestions("AP Chemistry")))
          }>a</button>
          <p></p>
        <QuestionContent></QuestionContent>
      </div>
    </ApolloProvider>
  );
}

export default App;
