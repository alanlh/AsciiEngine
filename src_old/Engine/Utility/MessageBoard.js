class MessageBoard {
  constructor() {
    this.signUpLists = {};
    this.completeLists = {}; // Maps keys to set of signups
  }
  
  getAllActiveIds() {
    // Is this ever used?
    return Object.keys(this.signUpLists);
  }
  
  getSignUpList(key) {
    if (key in this.signUpLists) {
      return this.signUpLists[key];
    }
    LOGGING.WARN("Key ", key, " not found in messageBoard");
  }
  
  requestSignUp(selfId, keys) {
    if (!(selfId in this.completeLists)) {
      this.completeLists[selfId] = new Set();
    }
    for (let key of keys) {
      if (!(key in this.signUpLists)) {
        this.signUpLists[key] = new Set();
      }
      if (selfId in this.signUpLists[key]) {
        LOGGING.WARN("State Id ", selfId, " already appears in messageBoard key ", key);
        continue;
      }
      this.signUpLists[key].add(selfId);
      this.completeLists[selfId].add(key);
    }
  }
  
  dropOut(selfId, keys) {
    if (!(selfId in this.completeLists)) {
      LOGGING.WARN("State id: ", selfId, " does not appear in the message board");
    }
    for (let key of keys) {
      if (!(key in this.signUpLists)) {
        LOGGING.ERROR("Key ", key, " does not belong the messageBoard");
        continue;
      }
      if (!(selfId in this.signUpLists[key])) {
        LOGGING.WARN("State id: ", selfId, " does not appear in the messageBoard list ", key);
      }
      this.signUpLists[key].delete(selfId);
      if (this.signUpLists[key].size == 0) {
        delete this.signUpLists[key];
      }
      
      this.completeLists[selfId].delete(key);
    }
    if (this.completeLists[selfId].size == 0) {
      delete this.completeLists[selfId];
    }
  }
  
  dropOutAll(selfId) {
    if (!(selfId in this.completeLists)) {
      LOGGING.WARN("State id: ", selfId, " does not appear in the message board");
    }
    for (let key of this.completeLists[selfId]) {
      dropOut(selfId, [key]);
    }
    // TODO: assert that selfId has been removed from completeLists
  }
}
