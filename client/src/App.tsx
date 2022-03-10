import './App.css';
import React, { useState } from "react";
import { gql } from "@apollo/client";
import { ApolloClient, ApolloLink, HttpLink, InMemoryCache } from "@apollo/client";

const defaultCourse = "AP Chemistry"

const allQuestions:any = {'AP World History': '/ap/world-history/', 'AP US History': '/ap/us-history/', 'AP European History': '/ap/european-history/', 'AP US Government and Politics': '/ap/us-government-and-politics/', 'AP Psychology': '/ap/psychology/', 'AP Human Geography': '/ap/human-geography/', 'AP Biology': '/ap/biology/', 'AP Chemistry': '/ap/chemistry/', 'AP Macroeconomics': '/ap/macroeconomics/', 'AP Microeconomics': '/ap/microeconomics/', 'AP Statistics': '/ap/statistics/', 'AP English Language and Composition': '/ap/english-language-and-composition/', 'AP English Literature and Composition': '/ap/english-literature-and-composition/', 'AP Calculus AB': '/ap/calculus-ab/', 'AP Calculus BC': '/ap/calculus-bc/', 'AP Physics 1': '/ap/physics-1/', 'AP Physics 2': '/ap/physics-2/', 'AP Physics C: Mechanics': '/ap/physics-c-mechanics/', 'AP Physics C: Electricity and Magnetism': '/ap/physics-c-electricity-and-magnetism/', 'AP Environmental Science': '/ap/environmental-science/'};

const httpLink = new HttpLink({
  uri: "http://localhost:4000/graphql",
});

export const client = new ApolloClient({
  cache: new InMemoryCache(),
  link: ApolloLink.from([httpLink]),
});

async function getAllQuestions(subject: String) {
  console.log(subject);
  const data = await client.query({ query: gql`
  query question { allQuestions(subject: "${subject}") }` })

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
    eventBus.on("refresh", () => {this.setState({show: false})});
  }

  componentWillUnmount () {
    eventBus.remove("answerclick", (data:any) => {this.setState({show: true})});
    eventBus.remove("nextclick", () => {this.setState({show: false})});
    eventBus.remove("refresh", () => {this.setState({show: false})});
  }

  render () {
    if (this.state.show) {
      return (
      <div className='explanation'>
        <div dangerouslySetInnerHTML={{__html: this.props.explanation}}></div>
      </div>
      )
    } else {
      return (
      <div className='explanation'>
      <button className='showanswer' onClick={() => {
        this.setState({show: true});
        eventBus.dispatch("answerclick", { answer: '' });
      }}>Show Answer</button>
      </div>)
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
    eventBus.on("refresh", () => {this.resetanswerstate()});
  }

  componentWillUnmount() {
    eventBus.remove("answerclick", (data:any) => {this.checkifcorrect(data.answer)});
    eventBus.on("nextclick", () => {this.resetanswerstate()});
    eventBus.on("refresh", () => {this.resetanswerstate()});
  }
  
  render () {
    console.log(this.props.htmlcontent);
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
  questionlist: any,
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
      questionlist: [],
    }
  }

  async fetchquestionlist(subject:string) {
    this.setState({questionlist: await getAllQuestions(subject)});
    this.refreshquestion();
  }
  
  refreshquestion () {
    const question:any = randomQuestion(this.state.questionlist);
    console.log(this.state.questionlist)
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
        )
    }
    this.setState({answers: answers});
    this.setState({correct: question.correct});
    this.setState({explanation: question.explanation});
  }

  async componentDidMount() {
    await this.fetchquestionlist(defaultCourse);
    eventBus.on("nextclick", () => {this.refreshquestion()});
    eventBus.on("refresh", async (data:any) => {await this.fetchquestionlist(data.subject);});
  }

  componentWillUnmount () {
    eventBus.remove("nextclick", () => {this.refreshquestion()});
    eventBus.on("refresh", async (data:any) => {await this.fetchquestionlist(data.subject);});
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

interface ClassSelectorProps {}

interface ClassSelectorState {
  value: any
}

class ClassSelector extends React.Component<ClassSelectorProps, ClassSelectorState> {
  constructor(props:any) {
    super(props);
    this.state = {value: defaultCourse};

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(event:any) {
    this.setState({value: event.target.value});
    eventBus.dispatch("refresh", { subject: event.target.value });
  }

  handleSubmit(event:any) {
    eventBus.dispatch("refresh", { subject: event.target.value });
    event.preventDefault();
  }

  render () {
    const optionlist = [];

    for (const key of Object.keys(allQuestions)) {
      optionlist.push(<option id={allQuestions[key]}>{key}</option>)
    }

    return (
      <select className='classes' id='classselector' value={this.state.value} onChange={this.handleChange}>
        {optionlist}
      </select>
    )
  }
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
