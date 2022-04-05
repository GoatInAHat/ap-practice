import React from "react";
import ReactCanvasConfetti from "react-canvas-confetti";
import { eventBus } from "../utils/eventBus";

const canvasStyles:any = {
  position: "fixed",
  pointerEvents: "none",
  width: "100%",
  height: "100%",
  top: 0,
  left: 0
};

interface Props {}

interface State {
  width: number;
  height: number;
}

export default class RealisticConfetti extends React.Component<Props, State> {
  xpos: number;
  ypos: number;
  animationInstance: any;
  
  constructor(props: Props) {
    super(props);
    this.animationInstance = null;
    this.state = { width: 0, height: 0 };
    this.updateWindowDimensions = this.updateWindowDimensions.bind(this);
  }

  makeShot = (particleRatio:any, opts:any) => {
    this.animationInstance &&
      this.animationInstance({
        ...opts,
        origin: { y: this.ypos/this.state.height, x: this.xpos/this.state.width },
        particleCount: Math.floor(200 * particleRatio)
      });
  };

  fire = () => {
    this.makeShot(0.25, {
      spread: 26,
      startVelocity: 55
    });

    this.makeShot(0.2, {
      spread: 60
    });

    this.makeShot(0.35, {
      spread: 100,
      decay: 0.91,
      scalar: 0.8
    });

    this.makeShot(0.1, {
      spread: 120,
      startVelocity: 25,
      decay: 0.92,
      scalar: 1.2
    });

    this.makeShot(0.1, {
      spread: 120,
      startVelocity: 45
    });
  };

  getInstance = (instance:any) => {
    this.animationInstance = instance;
  };

  componentDidMount() {
    eventBus.on("confetti", (data:any) => {
      this.xpos = data.x;
      this.ypos = data.y;
      this.fire();
    })

    this.updateWindowDimensions();
    window.addEventListener('resize', this.updateWindowDimensions);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.updateWindowDimensions);
  }

  updateWindowDimensions() {
    this.setState({ width: window.innerWidth, height: window.innerHeight });
  }

  render() {
    return (
      <div className="confetti">
        <ReactCanvasConfetti
          refConfetti={this.getInstance}
          style={canvasStyles}
        />
      </div>
    );
  }
}
