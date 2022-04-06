import React from "react";
import { eventBus } from "../utils/eventBus";

interface Props {}

interface State {
  show: boolean;
}

export default class FallingCross extends React.Component<Props, State> {
  xpos: number;
  ypos:number;

  constructor (props: Props) {
    super(props);
    this.state = { show: false }
  }

  trigger(data:any) {
    this.xpos = data.x;
    this.ypos = data.y;
    this.setState({ show: true })
    setInterval(() => {
      this.setState({ show: false })
    }, 100)
  }
  
  componentDidMount() {
    eventBus.on("fallingcross", (data:any) => {this.trigger(data)})
  }

  componentWillUnmount() {
    eventBus.remove("fallingcross", (data:any) => {this.trigger(data)})
  }

  render () {
    return (
      <div className={this.state.show ? "showcross" : "hidecross"} style={{ left: this.xpos-10, top: this.ypos-10, position: "absolute" }}>
        ❌
      </div>
    )
  }
}