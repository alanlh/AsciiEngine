export default class BlinkerComponent extends AsciiEngine.Component {
  constructor(duration) {
    super();
    
    this.cycleDuration = duration;
    this.remainingDuration = duration;
  }
  
  tick() {
    this.remainingDuration --;
    if (this.remainingDuration <= 0) {
      this.remainingDuration = this.cycleDuration;
      return true;
    }
    return false;
  }
}

BlinkerComponent.type = "Blink";
