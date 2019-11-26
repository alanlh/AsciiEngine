class Clock extends MessageBoard {
  constructor(messageBoard, cyclesPerRealSecond, cyclesPerFrame) {
    super("CLOCK", messageBoard);
    this.cycles = 0;
    this.intervalId = -1;
    this.playing = false;
    
    this.cyclesPerRealSecond = cyclesPerRealSecond;
    this.cyclesPerFrame = cyclesPerFrame;
    
    this.timers = new sortedQueue(msg => {return msg.body.alertCycle});
  }
  
  init() {
    this.messageBoard.signup(this.id, this.receiveMessage);
    
    this.messageBoard.subscribe(this.id, [
      MessageTags.GameStatus,
      MessageTags.SpeedChange,
      MessageTags.TimerRequest
    ]);
    
    this.start();
  }
  
  receiveMessage(message) {
    if (message.tag === MessageTags.GameStatus) {
      // Game Play/Pause
      // TODO: Implement. Mostly necessary for testing? 
    } else if (message.tag === MessageTags.SpeedChange) {
      // TODO: Speed change. Maybe?
    } else if (message.tag === MessageTags.TimerRequest) {
      this.handleTimerRequest(message);
    } else {
      this.ERROR_MessageNotRecognized(message);
    }
  }
  
  start() {
    this.intervalId = window.setInterval(this.postTick, this.cyclesPerRealSecond);
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
    this.cycles += 1;
    
    this.messageBoard.post(new Message(
      this.id,
      MessageTags.ClockTick, 
      {
        cycleNumber: this.cycles,
        seconds: Math.floor(this.cycles / this.cyclesPerFrame),
        remainder: (this.cycles % this.cyclesPerFrame)
      }
    ));
    
    while (sortedQueue.front.body.alertCycle <= this.cycles) {
      // TODO: Check if ever less than.
      this.messageBoard.post(this.timers.dequeue());
    }
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
