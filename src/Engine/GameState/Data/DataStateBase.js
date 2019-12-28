class DataStateBase extends StateBase {
  // Just a simple base class to make the constructor simpler.
  constructor(id, dataType, container) {
    super(id, StateBase.PERSISTENCE.DATA, dataType, 
      [], [], container, StateBase.CALLBACKS.IGNORE, StateBase.CALLBACKS.IGNORE);
      
    this.attributes = DataStateBase.ATTRIBUTES.EMPTY;
  }
  
  createInstance() {
    // A virtual function that can be overriden by later classes
  }
}

DataStateBase.ATTRIBUTES.EMPTY = Object.freeze({});
