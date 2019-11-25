class MessageBoard {
  constructor() {
    this.channelSubscribers = {}; // Maps channels to their subscribers
    this.subscriptions = {}; // Maps ids to set of subscriptions
    this.receivers = {}; // Maps each id to where it receives messages. 
  }
  
  getAllChannels() {
    // Is this ever used?
    return Object.keys(this.channelSubscribers);
  }
  
  getSubscriptions(id) {
    if (id in this.subscriptions) {
      return this.subscriptions[id];
    }
    LOGGING.WARN("Id ", id, " not found in messageBoard");
  }
  
  getSubscribers(channel) {
    // TODO: Is this ever used?
    if (id in this.channelSubscribers) {
      return this.channelSubscribers[id];
    }
    LOGGING.WARN("Id ", id, " not found in messageBoard");
  }
  
  signup(id, receiver) {
    if (id in this.receivers) {
      LOGGING.WARN("Id ", id, " is already signed up.");
    }
    this.receivers[id] = receiver;
    this.subscriptions[id] = new Set();
  }
  
  subscribe(id, channels) {
    if (!(id in this.receivers)) {
      // this.subscriptions[id] = new Set();
      // TODO: Create similar message when receiving. 
      LOGGING.ERROR("Id ", id, " does not have a receiver but is signing up for messages.");
    }
    for (let channel of channels) {
      if (!(channel in this.channelSubscribers)) {
        this.channelSubscribers[channel] = new Set();
      }
      if (id in this.channelSubscribers[channel]) {
        LOGGING.WARN("Channel ", id, " is already signed up for ", channel);
        continue;
      }
      this.channelSubscribers[channel].add(id);
      this.subscriptions[id].add(channel);
    }
  }
  
  unsubscribe(id, channels) {
    if (!(id in this.subscriptions)) {
      LOGGING.WARN("Channel: ", id, " does not appear in the message board");
    }
    for (let channel of channels) {
      if (!(channel in this.channelSubscribers)) {
        LOGGING.ERROR("Channel ", channel, " does not belong the messageBoard");
        continue;
      }
      if (!(id in this.channelSubscribers[channel])) {
        LOGGING.WARN("State id: ", id, " does not appear in the messageBoard list ", channel);
      }
      this.channelSubscribers[channel].delete(id);
      if (this.channelSubscribers[channel].size === 0) {
        delete this.channelSubscribers[channel];
      }
      this.subscriptions[id].delete(channel);
    }
  }
  
  withdraw(id) {
    if (!(id in this.subscriptions)) {
      LOGGING.WARN("Id: ", id, " does not appear in the message board");
    }
    for (let channel of this.subscriptions[id]) {
      this.channelSubscribers[channel].delete(id);
      if (this.channelSubscribers[channel].size === 0) {
        delete this.channelSubscribers[channel];
      }
    }
    delete this.receivers[id]
  }
  
  // Posts message to all Ids who have signed for any of the channels in 
  post(message) {
    // TODO: Is there a more efficient way to do this (without creating new Set object)?
    let combinedIds = new Set();
    for (let tag of message.tags) {
      if (tag in this.channelSubscribers) {
        for (let id of this.channelSubscribers[tag]) {
          combinedIds.add(id);
        }
      }
    }
    for (let id of combinedIds) {
      this.receivers[id](message);
    }
  }
}
