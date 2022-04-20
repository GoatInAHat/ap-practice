import './App.css';
import React, { useRef } from "react";
import ReactGA from 'react-ga4';
import RealisticConfetti from "./components/confetti";
import { eventBus } from "./utils/eventBus";
import StreakCounter from "./components/StreakCounter"
import Explanation from "./components/explaination"
import FallingCross from "./components/fallingcross"

ReactGA.initialize('G-EYTW17TWRX');

ReactGA.send("pageview");

const defaultCourse = "AP Chemistry"

const allQuestions:any = {'AP World History': '/ap/world-history/', 'AP US History': '/ap/us-history/', 'AP European History': '/ap/european-history/', 'AP US Government and Politics': '/ap/us-government-and-politics/', 'AP Psychology': '/ap/psychology/', 'AP Human Geography': '/ap/human-geography/', 'AP Biology': '/ap/biology/', 'AP Chemistry': '/ap/chemistry/', 'AP Macroeconomics': '/ap/macroeconomics/', 'AP Microeconomics': '/ap/microeconomics/', 'AP Statistics': '/ap/statistics/', 'AP English Language and Composition': '/ap/english-language-and-composition/', 'AP English Literature and Composition': '/ap/english-literature-and-composition/', 'AP Calculus AB': '/ap/calculus-ab/', 'AP Calculus BC': '/ap/calculus-bc/', 'AP Physics 1': '/ap/physics-1/', 'AP Physics 2': '/ap/physics-2/', 'AP Physics C: Mechanics': '/ap/physics-c-mechanics/', 'AP Physics C: Electricity and Magnetism': '/ap/physics-c-electricity-and-magnetism/', 'AP Environmental Science': '/ap/environmental-science/'};

async function getAllQuestions(subject: string) {
  const response = await fetch(`https://raw.githubusercontent.com/GoatInAHat/ap-data/main/${allQuestions[subject].split('/')[2].split('/')[0]}.json`)

  return response.json();
}

function randomQuestion(questions:[Object]) {
  const randomint = Math.floor(Math.random() * questions.length)
  return questions[randomint]
}

let xpos:number = 0;
let ypos:number = 0;

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
    return (
      <div className={this.state.classname} dangerouslySetInnerHTML={this.props.htmlcontent} onClick={this.state.clickable ? this.props.clickfunc : null}></div>
    )
  }
}

interface QuestionProps {}

interface QuestionState {
  question: string,
  answers: Object,
  correct: string,
  explanation: string,
  questionlist: any,
}

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
    this.setState({question: question.content});
    let answers = [];
    
    for (const key of Object.keys(question.answers)) {
      answers.push(
        <AnswerButton 
        correct={question['correct']}
        answerletter={key}
        // eslint-disable-next-line no-loop-func
        clickfunc={() => {
          console.log(`answer ${key} clicked`);
          eventBus.dispatch("answerclick", { answer: key });
          
          let correct = key === question['correct'];
          console.log(`Answer is ${correct ? 'correct' : 'incorrect'}`)
          
          ReactGA.event({
            category: 'Answer',
            action: correct ? 'correct' : 'incorrect',
          });

          eventBus.dispatch("result", { correct: correct });

          if (correct) {
            eventBus.dispatch("confetti", { x: xpos, y: ypos});
          } else {
            eventBus.dispatch("fallingcross", { x: xpos, y: ypos});
          }
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


    ReactGA.event({
      category: 'Question Interaction',
      action: 'new question',
    });
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
        <div className="Question" dangerouslySetInnerHTML={{__html: this.state.question
          .replace(/<pre class="pre-scrollable">/, '')
          .replace('</pre>', '')
          .replace('â€“','-')
          .replace('â€”','—')
        }}></div>
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
      <StreakCounter></StreakCounter>
      <button className='nextbutton' id='next' onClick={() => {
        console.log(`Next button clicked`);
        eventBus.dispatch("nextclick", { answer: null });
      }}>Next</button>
    </header>
  )
}

class App extends React.Component {
  _onMouseMove(mouse:MouseEvent) {
    xpos = mouse.pageX;
    ypos = mouse.pageY;
    eventBus.dispatch('mousemove', {x: mouse.pageX, y: mouse.pageY})
  }

  render () {
    return (
      <div className="App" onMouseMove={this._onMouseMove.bind(this)}>
        <Header></Header>
        <div className="QuestionWrapper">
          <div className="QuestionContent">
            <QuestionContent></QuestionContent>
            <RealisticConfetti></RealisticConfetti>
            <FallingCross></FallingCross>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
