class StoryState {
  constructor(id, persistence, type, parentKeys, childKeys, container) {
    super(id, persistence, type, parentKeys, childKeys, container);
    
  }

}

function StoryState(id, children, parents, completionRequirements) {
  this.id = id;
  this.children = children;
  this.parents = parents;
  this.status = StoryState.STATUS.UNREACHED;
  this.completionRequirements = [];
}

StoryState.STATUS = {
  UNREACHED: 0,
  INPROGRESS: 1,
  COMPLETED: 2
}

StoryState.Game = undefined;

StoryState.prototype.checkReached = function() {
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
StoryState.prototype.checkComplete = function() {
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
