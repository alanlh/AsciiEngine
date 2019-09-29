"use strict";
class StoryState {
  constructor(id, persistence, type, container, storyParents, completionRequirements) {
    
    super(id, persistence, type, storyParents.concat(completionRequirements.keys()), container, 
      this._handleUpdate);
    
    this.completeParents = {};
    this.remainingParents = storyParents.length;
    for (let storyParentKey of storyParents) {
      this.completeParents[storyParentKey] = false;
    }
    
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
            return true;
          }
        }
      }
    } else if (this.status == StoryState.STATUS.INPROGRESS) {
      if (id in this.completionRequirements) {
        if (!this.requirementCompleted[id]) {
          if (this.completionRequirements(status, value)) {
            this.requirementCompleted[id] = true;
            this.remainingRequirements --;
            
            if (this.remainingRequirements == 0) {
              this.status = StoryState.STATUS.COMPLETED;
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

StoryState.update = function() {
  if (StoryState.checkReached)
}

StoryState.checkReached = function() {
  if (this.status = StoryState.STATUS.UNREACHED) {
    for (let parent of this.parents) {
      if (parent.status < StoryState.STATUS.COMPLETED) {
        return false;
      }
    }
    this.status = StoryState.STATUS.INPROGRESS;
    return true;
  }
  return false;
}

// Checks if the story node has been completed. Returns true if so.
StoryState.checkComplete = function() {
  if (this.status == StoryState.STATUS.INPROGRESS) {
    for (let callback of this.completionRequirements) {
      if (!callback(this)) {
        return false;
      }
    }
    this.status = StoryState.STATUS.COMPLETED;
    for (let child of this.children) {
      child.checkReached();
    }
    return true;
  }
  return false;
}

StoryState.createGenerator = function(container) {
  return function(id, storyParents, completionRequirements) {
    return new StoryState(
        id,
        StateBase.PERSISTENCE.PASSIVE,
        StateBase.TYPES.STORY,
        container, 
        storyParents,
        completionRequirements
      );
  };
}
