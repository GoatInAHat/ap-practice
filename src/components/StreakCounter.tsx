import React from "react";
import { eventBus } from "../utils/eventBus";

interface StreakCounterState {
value: number;
}

interface StreakCounterProps {}

export default class StreakCounter extends React.Component<StreakCounterProps, StreakCounterState> {
constructor (props:StreakCounterProps) {
    super(props);
    this.state = {
    value: 0,
    }
}

increase () {
    this.setState({value: this.state.value + 1});
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
        <p className='StreakLabel'>Answer Streak:</p>
        <p className='StreakValue'>{this.state.value}</p>
    </div>
    )
}
}