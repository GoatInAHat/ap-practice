import './App.css';
import React, { useState } from "react";
import { gql } from "@apollo/client";
import { ApolloClient, ApolloLink, HttpLink, InMemoryCache } from "@apollo/client";

let currentCourse = "AP Chemistry"

const allQuestions:any = {'AP World History': '/ap/world-history/', 'AP US History': '/ap/us-history/', 'AP European History': '/ap/european-history/', 'AP US Government and Politics': '/ap/us-government-and-politics/', 'AP Psychology': '/ap/psychology/', 'AP Human Geography': '/ap/human-geography/', 'AP Biology': '/ap/biology/', 'AP Chemistry': '/ap/chemistry/', 'AP Macroeconomics': '/ap/macroeconomics/', 'AP Microeconomics': '/ap/microeconomics/', 'AP Statistics': '/ap/statistics/', 'AP English Language and Composition': '/ap/english-language-and-composition/', 'AP English Literature and Composition': '/ap/english-literature-and-composition/', 'AP Calculus AB': '/ap/calculus-ab/', 'AP Calculus BC': '/ap/calculus-bc/', 'AP Physics 1': '/ap/physics-1/', 'AP Physics 2': '/ap/physics-2/', 'AP Physics C: Mechanics': '/ap/physics-c-mechanics/', 'AP Physics C: Electricity and Magnetism': '/ap/physics-c-electricity-and-magnetism/', 'AP Environmental Science': '/ap/environmental-science/'};

const httpLink = new HttpLink({
  uri: "http://localhost:4000/graphql",
});

export const client = new ApolloClient({
  cache: new InMemoryCache(),
  link: ApolloLink.from([httpLink]),
});

async function getAllQuestions(subject: String) {
  const data = await client.query({ query: gql`
  query question { allQuestions(subject: "${currentCourse}") }` })

  return JSON.parse(data.data.allQuestions);
}

function randomQuestion(questions:[Object]) {
  const randomint = Math.floor(Math.random() * questions.length)
  return questions[randomint]
}


interface ExplanationState {
  show: boolean,
}

interface ExplanationProps {
  correct: string;
  explanation: any;
}

class Explanation extends React.Component<ExplanationProps, ExplanationState> {
  constructor (props:any) {
    super(props);
    this.state = {
      show: false,
    }
  }
  
  componentDidMount() {
    eventBus.on("answerclick", (data:any) => {this.setState({show: true})});
    eventBus.on("nextclick", () => {this.setState({show: false})});
  }

  render () {
    if (this.state.show) {
      return (
      <>
      <div className='correctanswer'>
        <b>Correct Answer:</b>
        <p>{this.props.correct}</p>
      </div>
      <div className='explanation'>
        <b>Explanation:</b>
        <p>{this.props.explanation
        .replace(`(${this.props.correct}) `, '')
        .replace(`${this.props.correct}-`, '')
        .replace(/^[a-zA-Z]\s/, '')
        }</p>
      </div>
      </>)
    } else {
      return (<button className='showanswer' onClick={() => {
        this.setState({show: true});
        eventBus.dispatch("answerclick", { answer: '' });
      }}>Show Answer</button>)
    }
  }
}


interface AnswerButtonProps {
  htmlcontent: any,
  clickfunc: any,
  answerletter: any,
  correct: string,
}

interface AnswerButtonState {
  classname: string,
  clickable: boolean,
}

class AnswerButton extends React.Component<AnswerButtonProps, AnswerButtonState> {
  constructor (props:any) {
    super(props);
    this.state = {
      classname: 'answer',
      clickable: true,
    }
  }

  checkifcorrect(key:string) {
    console.log(`${this.props.answerletter}: ${key} correct: ${this.props.correct}`)
    this.setState({clickable: false});
    if (this.props.answerletter === this.props.correct) {
      this.setState({classname: this.state.classname + ' correct'});
    } else if (key === this.props.answerletter) {
      this.setState({classname: this.state.classname + ' incorrect'});
    } else if (key !== this.props.answerletter) {
      this.setState({classname: this.state.classname + ' disabled'});
    }
  }

  resetanswerstate () {
    this.setState({
      classname: 'answer',
      clickable: true,
    });
  }
  
  componentDidMount() {
    eventBus.on("answerclick", (data:any) => {this.checkifcorrect(data.answer)});
    eventBus.on("nextclick", () => {this.resetanswerstate()});
  }

  componentWillUnmount() {
    eventBus.remove("answerclick", (data:any) => {this.checkifcorrect(data.answer)});
    eventBus.on("nextclick", () => {this.resetanswerstate()});
  }
  
  render () {
    return (
      <div className={this.state.classname} dangerouslySetInnerHTML={this.props.htmlcontent} onClick={this.state.clickable ? this.props.clickfunc : null}></div>
    )
  }
}

interface QuestionProps {
}

interface QuestionState {
  question: string,
  answers: Object,
  correct: string,
  explanation: string,
}

const eventBus = {
  on(event:any, callback:any) {
    document.addEventListener(event, (e) => callback(e.detail));
  },
  dispatch(event:any, data:any) {
    document.dispatchEvent(new CustomEvent(event, { detail: data }));
  },
  remove(event:any, callback:any) {
    document.removeEventListener(event, callback);
  },
};

class Question extends React.Component<QuestionProps, QuestionState> {
  constructor (props:any) {
    super(props);
    this.state = {
      question: '',
      answers: [],
      correct: '',
      explanation: '',
    }
  }
  
  async refreshquestion () {
    const question:any = randomQuestion(await getAllQuestions("AP Chemistry"));
    this.setState({question: question.content});
    let answers = [];
    for (const key of Object.keys(question.answers)) {
      answers.push(
      <AnswerButton 
      correct={question['correct']}
      answerletter={key}
      clickfunc={() => {
        console.log(`answer ${key} clicked`);
        eventBus.dispatch("answerclick", { answer: key });
      }}
      htmlcontent={{__html: `<div> <p>${key}</p> ${question['answers'][key]
      .replace(/<input name="[0-9]+" type="radio" value="[a-zA-Z]"\/>/, '')
      .replace('<div class="radio">', '')
      .replace('</div>', '')
      .replace(`${key}. `, '')} </div>`
    }}
      ></AnswerButton>
      )}
    this.setState({answers: answers});
    this.setState({correct: question.correct});
    this.setState({explanation: question.explanation});
  }

  componentDidMount() {
    this.refreshquestion();
    eventBus.on("nextclick", () => {this.refreshquestion()});
  }

  componentWillUnmount () {
    eventBus.remove("nextclick", () => {this.refreshquestion()});
  }

  render () {
    return (
      <>
        <div className="Question" dangerouslySetInnerHTML={{__html: this.state.question}}></div>
        {this.state.answers}
        <Explanation correct={this.state.correct} explanation={this.state.explanation}></Explanation>
      </>
      
    )
  }
}


class QuestionContent extends React.Component<QuestionProps, QuestionState> {
  constructor(props:Object) {
    super(props);
    this.setState({});
  }

  forceUpdateHandler(){
    this.forceUpdate();
  };

  render() {
    return (
      <Question></Question>
    )
  }
}

function ClassSelector () {
  const [classes, setclasses]:any = useState(null);

  const optionlist = [];

  for (const key of Object.keys(allQuestions)) {
    if (key === currentCourse) {
      optionlist.push(<option id={allQuestions[key]} selected>{key}</option>)
    } else {
      optionlist.push(<option id={allQuestions[key]}>{key}</option>)
    }
  }

  return (
    <select className='classes' id='classselector'>
      {optionlist}
    </select>
  )
}

function Header() {
  return (
    <header className="header">
      <ClassSelector></ClassSelector>
      <button className='nextbutton' id='next' onClick={() => {
        console.log(`Next button clicked`);
        eventBus.dispatch("nextclick", { answer: null });
      }}>Next</button>
    </header>
  )
}

class App extends React.Component {
  
  render () {
    return (
      <div className="App">
        <Header></Header>
        <QuestionContent></QuestionContent>
      </div>
    );
  }
  
}

export default App;
