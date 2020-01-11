const demo_1_panels = [
  new PanelTemplate({
    name: "main",
    panels: [{
      templateKey: "hello_panel",
      sceneId: "main",
    }],
  }),
  new PanelTemplate({
    name: "hello_panel",
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
  }),
  new PanelTemplate({
    name: "world_panel",
    panels: [],
    elements: [{
      templateKey: "world_text",
      topLeft: {x: 0, y: 0},
    }, {
      templateKey: "world_text",
      topLeft: {x: 0, y: 5},
    }],
  }),
  new PanelElementTemplate({
    name: "hello_text",
    spriteId: "hello",
    renderElement: {},
  }),
  new PanelElementTemplate({
    name: "world_text",
    spriteId: "world",
    renderElement: {},
  }),
]

const demo_1_sprites = {
  "hello": new TextLayer("Hello,", {}),
  "world": new TextLayer("World", {}),
};
