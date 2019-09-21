const StoryStates = {};

function insertStoryState(newState) {
  StoryStates[newState.id] = newState;
};

insertStoryState(
  new StoryState(
    "testId",
    [],
    [],
    [
      function() {
        
      }
    ]
  )
);
