class Message {
  constructor(origin, tags, body) {
    // TODO: Create deep copies.
    this.origin = origin;
    this.tags = tags;
    this.body = body;
    
    Object.freeze(this);
  }
  
  log(loggingMethod) {
    loggingMethod("Origin: ", origin, "\nTags: ", tags, "\nBody: ", body);
  }
}
