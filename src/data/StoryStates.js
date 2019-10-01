"use strict";
const generateStoryStates = function(container) {
  const StoryStates = {};
    
  function insertStoryState(id, storyParents, completionRequirements) {
    StoryStates[id] = new StoryState(id, container, storyParents, completionRequirements);
  };
  
  // id, storyParents, completionRequirements
  insertStoryState(
    "TEMPLATE",
    ["TemplateParent"],
    {
      "TemplateCompletionReq": function(status, value) {
        return true;
      }
    }
  );
  
  insertStoryState(
    "openingCinematic",
    [/** NONE **/],
    {
      "openingCinematicScene.Frame": function(status, value) {
        return value.frameNumber == value.frameCount;
      }
    }
  );


  return StoryStates;
}
