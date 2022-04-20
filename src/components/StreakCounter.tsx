import React from "react";
import { eventBus } from "../utils/eventBus";

interface FireParticleProps {
  posx: number;
  posy: number;
}

interface FireParticleState {}

class FireParticle extends React.Component<FireParticleProps, FireParticleState> {
  render() {
    return (
      <div className="fireparticle" style={{ left: this.props.posx, top: this.props.posy }}>
        🔥
      </div>
    )
  }
}

interface StreakCounterProps {}

interface StreakCounterState {
  value: number;
  highscore: number;
}

export default class StreakCounter extends React.Component<StreakCounterProps, StreakCounterState> {
  constructor (props:StreakCounterProps) {
    super(props);
    this.state = {
    value: 0,
    highscore: 0,
  }
}

increase () {
  const newScore = this.state.value + 1
  this.setState({value: newScore});
  if (newScore > this.state.highscore) {
    this.setState({highscore: newScore});
  }
}

reset () {
  this.setState({value: 0});
}

componentDidMount () {
  eventBus.on("result", (data:any) => {
    if (data.correct) {
      this.increase();
    } else {
      this.reset()
    }
  });
  eventBus.on("refresh", (data:any) => {
  this.reset();
  })
}

render () {
  return (
    <div className='StreakCounter'>
      <div className="StreakCounterInner">
        <div className="highscore">Highscore: {this.state.highscore}</div>
        <div className="score">Answer Streak: {this.state.value}</div>
      </div>
    </div>
    )
  }
}