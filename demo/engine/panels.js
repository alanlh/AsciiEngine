const demo_1_panels = {
  "main": {
    panels: [{
      templateKey: "hello_panel"
    }],
  },
  "hello_panel": {
    panels: [{
      templateKey: "world_panel",
      topLeft: {x: 8, y: 1},
    }],
    elements: [{
      templateKey: "hello_text",
      topLeft: {x: 0, y: 0},
    }, {
      templateKey: "hello_text",
      topLeft: {x: 0, y: 5},
    }],
    messageHandlers: {},
    sceneId: "main",
  },
  "world_panel": {
    panels: [],
    elements: [{
      templateKey: "world_text",
      topLeft: {x: 0, y: 0},
    }, {
      templateKey: "world_text",
      topLeft: {x: 0, y: 5},
    }],
  },
  "hello_text": {
    spriteId: "hello",
    renderElement: {},
  }, 
  "world_text": {
    spriteId: "world",
    renderElement: {},
  },
};

const demo_1_sprites = {
  "hello": new TextLayer("Hello,", {}),
  "world": new TextLayer("World", {}),
};
