"use strict";
const generateStoryStates = function(container) {
  const StoryStates = {};
  
  const generateStoryState = StoryState.createGenerator(container);
  
  function insertStoryState(id, storyParents, completionRequirements) {
    StoryStates[id] = generateStoryState(id, storyParents, completionRequirements);
  };
  
  // id, storyParents, completionRequirements
  insertStoryState(
    "testId",
    [],
    {
      
    }
  );


  return StoryStates;
}
