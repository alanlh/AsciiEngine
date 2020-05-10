import Queue from "./Queue.js";

export default class MessageBoard {
  constructor() {
    this.channelSubscribers = {}; // Maps channels to their subscribers
    this.subscriptions = {}; // Maps ids to set of subscriptions
    this.receivers = {}; // Maps each id to where it receives messages.
    
    this.channelQueue = new Queue();
    this.messageQueue = new Queue();
  }
  
  getAllChannels() {
    // Is this ever used?
    return Object.keys(this.channelSubscribers);
  }
  
  getSubscriptions(id) {
    if (id in this.subscriptions) {
      return this.subscriptions[id];
    }
    console.warn("Id ", id, " not found in messageBoard");
  }
  
  getSubscribers(channel) {
    // TODO: Is this ever used?
    if (id in this.channelSubscribers) {
      return this.channelSubscribers[id];
    }
    console.warn("Id ", id, " not found in messageBoard");
  }
  
  signup(id, receiver) {
    // console.debug("Component", id, "signing up.");
    if (id in this.receivers) {
      console.warn("Id ", id, " is already signed up.");
    }
    this.receivers[id] = receiver;
    this.subscriptions[id] = new Set();
  }
  
  subscribe(id, channels) {
    if (!(id in this.receivers)) {
      // this.subscriptions[id] = new Set();
      // TODO: Create similar message when receiving. 
      console.error("Id ", id, " does not have a receiver but is signing up for messages.");
    }
    for (let channel of channels) {
      if (!(channel in this.channelSubscribers)) {
        this.channelSubscribers[channel] = new Set();
      }
      if (id in this.channelSubscribers[channel]) {
        // console.debug("Channel ", id, " is already signed up for ", channel);
        continue;
      }
      this.channelSubscribers[channel].add(id);
      this.subscriptions[id].add(channel);
    }
  }
  
  unsubscribe(id, channels) {
    if (!(id in this.subscriptions)) {
      console.warn("Channel: ", id, " does not appear in the message board");
    }
    for (let channel of channels) {
      if (!(channel in this.channelSubscribers)) {
        console.error("Channel ", channel, " does not belong the messageBoard");
        continue;
      }
      if (!(id in this.channelSubscribers[channel])) {
        console.warn("State id: ", id, " does not appear in the messageBoard list ", channel);
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
      console.warn("Id: ", id, " does not appear in the message board");
    }
    for (let channel of this.subscriptions[id]) {
      this.channelSubscribers[channel].delete(id);
      if (this.channelSubscribers[channel].size === 0) {
        delete this.channelSubscribers[channel];
      }
    }
    delete this.receivers[id];
  }
  
  // Posts message to all ids who have signed for the channel/tag.
  post(channel, message) {
    // Keep for now?
    if (channel in this.channelSubscribers) {
      for (let id of this.channelSubscribers[channel]) {
        this.receivers[id].receiveMessage(channel, message);
      }
    }
    
    return;
    
    // TODO: The below is no longer needed if all receivers don't run the callback immediately... 
    this.channelQueue.enqueue(channel);
    this.messageQueue.enqueue(message);
    
    if (this.messageQueue.size > 1) {
      // There are already messages in the queue, 
      // which means we are already handling stuff
      return;
    }
    // TODO: Consider flushing queue only in certain types of events.
    // TODO: Consider making messages handled much slower, 8 or 12. 
    // TODO: Does this method actually work?
    while (this.messageQueue.size > 0) {
      let currMessage = this.messageQueue.front;
      
      if (currMessage.tag in this.channelSubscribers) {
        for (let id of this.channelSubscribers[currMessage.tag]) {
          this.receivers[id](currMessage);
        }
      }
      
      this.messageQueue.dequeue();
    }
  }
}
