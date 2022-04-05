import { eventBus } from "../utils/eventBus";
import React from "react";

interface ExplanationState {
  show: boolean,
}

interface ExplanationProps {
  correct: string;
  explanation: any;
}

export default class Explanation extends React.Component<ExplanationProps, ExplanationState> {
  constructor (props:ExplanationProps) {
    super(props);
    this.state = {
      show: false,
    }
  }
  
  componentDidMount () {
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
        eventBus.dispatch("result", { correct: false });
      }}>Show Answer</button>
      </div>)
    }
  }
}

