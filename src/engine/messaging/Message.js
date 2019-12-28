class Message {
  constructor(origin, tag, body) {
    // TODO: Create deep copies.
    this.origin = origin;
    this.tag = tag;
    this.body = body;
    
    Object.freeze(this);
  }
  
  log(loggingMethod) {
    loggingMethod("Origin: ", this.origin, "\nTag: ", this.tag, "\nBody: ", this.body);
  }
}
