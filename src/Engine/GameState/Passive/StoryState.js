"use strict";
class StoryState {
  constructor(id, container, storyParents, completionRequirements) {
    
    super(id, StateBase.PERSISTENCE.PASSIVE, StateBase.TYPES.STORY, 
      storyParents, completionRequirements.keys(), container, 
      this._handleUpdate, this._handleNotify);
    
    this.completeParents = {};
    this.remainingParents = storyParents.length;
    for (let storyParentKey of storyParents) {
      this.completeParents[storyParentKey] = false;
    }
    
    this.completionRequirements = completionRequirements;
    this.remainingRequirements = 0;
    this.requirementCompleted = {};
    for (let key in completionRequirements) {
      this.remainingRequirements ++;
      this.requirementCompleted[key] = false;
    }
  }
  
  // Single update method for all story states.
  _handleUpdate(id, status, value) {
    if (this.status == StoryState.STATUS.UNREACHED) {
      if (id in this.completeParents) {
        // This should be a StoryState object.
        
        if (this.completeParents[id] == false && status == StoryState.STATUS.COMPLETED) {
          this.incompleteParentCount --;
          this.completeParents[id] = true;
          
          if (this.incompleteParentCount == 0) {
            this.status = StoryState.STATUS.INPROGRESS;
            this.disconnectFromParents();
            this.connectToMessageBoard();
            return true;
          }
        }
      }
    }
    return false;
  }
  
  _handleNotify(eventData) {
    if (this.status == StoryState.STATUS.INPROGRESS) {
      if (id in this.completionRequirements) {
        if (!this.requirementCompleted[id]) {
          // i.e. check to make sure eventData is relevant and make sure requirement not already completed.
          if (this.completionRequirements[id](eventData)) {
            this.requirementCompleted[id] = true;
            this.remainingRequirements --;
            
            if (this.remainingRequirements == 0) {
              this.status = StoryState.STATUS.COMPLETED;
              this.mutable = false;
              this.disconnectFromMessageBoard();
              return true;
            }
          }
        }
      }
    }
    return false;
  }
}

StoryState.STATUS = {
  UNREACHED: 0,
  INPROGRESS: 1,
  COMPLETED: 2
}
