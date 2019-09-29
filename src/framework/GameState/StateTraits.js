class StateTraits {
  constructor(id, persistence, type, childKeys, container, update, notify) {
    this.id = id;
    this.persistence = persistence;
    this.type = type;
    this.childKeys = childKeys;
    this.container = container;
    this.update = update;
    this.notify = notify;
    Object.freeze(this);
  }
}
