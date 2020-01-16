class Clock extends ComponentBase {
  constructor(controller) {
    super(ComponentNames.Clock, controller);
    this.cycles = 0;
    this.intervalId = -1;
    this.playing = false;
    
    // TODO: Change this to init. 
    this.parameters.cyclesPerRealSecond = 8; // Default Value
    this.parameters.cyclesPerFrame = 1; // TODO: What is this doing?
    
    this.timers = new SortedQueue(msg => {return msg.body.alertCycle});
  }
  
  init() {
    super.init({
      // Game Play/Pause
      // TODO: Implement. Mostly necessary for testing?
      [MessageTags.GameStatus]: UtilityMethods.IGNORE,
      // TODO: Speed change. Maybe?
      [MessageTags.SpeedChange]: UtilityMethods.IGNORE,
      [MessageTags.TimerRequest]: this.handleTimerRequest
    });
    
    this.start();
  }
  
  start() {
    // TODO: Replace with lambda?
    this.intervalId = window.setInterval(this.postTick.bind(this), 1000 / this.parameters.cyclesPerRealSecond);
    this.playing = true;
  }
  
  stop() {
    LOGGING.ASSERT(this.intervalId !== -1, "Clock.intervalId is -1 even though game is playing");
    window.clearInterval(this.intervalId);
    this.playing = false;
  }
  
  postTick() {
    // Not handling integer overflow.
    // Would need to leave it running for 2-3 years for it to start breaking.
    LOGGING.PERFORMANCE.START("Game Engine Tick", 0);
    this.messageBoard.post(new Message(
      this.id,
      MessageTags.ClockTick, 
      {
        cycleNumber: this.cycles,
        seconds: Math.floor(this.cycles / this.parameters.cyclesPerRealSecond),
        remainder: (this.cycles % this.parameters.cyclesPerRealSecond)
      }
    ));
    
    while (this.timers.size > 0 && 
      this.timers.front.body.alertCycle <= this.cycles) {
      // TODO: Check if ever less than.
      this.messageBoard.post(this.timers.dequeue());
    }
    if (this.parameters.maxCycles > 0 && this.cycles >= this.parameters.maxCycles) {
      this.stop();
    }
    this.cycles += 1;
    LOGGING.PERFORMANCE.STOP("Game Engine Tick");
  }
  
  handleTimerRequest(message) {
    let alertCycle = message.body.count;
    if (message.body.measureBySeconds) {
      alertCycle *= this.cyclesPerFrame;
    }
    
    this.timers.enqueue(new Message(
      this.id,
      MessageTags.TimerAlarm,
      {
        componentId: message.id,
        key: message.key,
        alertCycle: alertCycle
      }
    ));
  }
}
