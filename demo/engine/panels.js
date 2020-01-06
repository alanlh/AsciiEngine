const demo_1_panels = {
  "main": {
    panels: [{
      templateKey: "pane"
    }],
  },
  "pane": {
    panels: [],
    elements: [{
      templateKey: "text",
      topLeft: {x: 0, y: 0},
    }, {
      templateKey: "text",
      topLeft: {x: 0, y: 5},
    }],
    messageHandlers: {},
    sceneId: "main",
  },
  "text": {
    spriteId: "hello",
    renderElement: {},
  },
}

const demo_1_sprites = {
  "hello": new TextLayer("Hello", {})
};
