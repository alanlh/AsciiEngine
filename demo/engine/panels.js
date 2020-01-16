const demo_1_panels = [
  new TopLevelPanelTemplate({
    name: "main",
    panels: [{
      templateKey: "hello_panel",
      sceneId: "first_screen",
      topLeft: Vector2.create(1, 1),
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
    messageHandlers: {
      [MessageTags.ClockTick]: function() {
        let exclamationId1 = "";
        
        return function(message) {
          let frame = message.body.cycleNumber;
          if (frame % 4 == 0) {
            exclamationId1 = this.placeElement(
              "exclamation_text",
              {
                topLeft: {x: 13, y: 1},
                state: 1,
              }
            )
            this.placeElement(
              "exclamation_text",
              {
                topLeft: {x: 13, y: 6},
                state: 1,
              },
              ["exclaim!"]
            )
          } else if (frame % 4 == 3) {
            this.removeElement(exclamationId1);
            this.removeClass("exclaim!");
          }
        }
      }()
    },
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
  }),
  new PanelElementTemplate({
    name: "world_text",
    spriteId: "world",
  }),
  new PanelElementTemplate({
    name: "exclamation_text",
    spriteId: "exclamation",
    messageHandlers: {
      [MessageTags.ClockTick]: function(message) {
        let frame = message.body.cycleNumber;
        if (frame % 4 < 2) {
          this.state = (frame % 4) + 2;
        }
      }
    }
  }),
]

const demo_1_sprites = {
  "hello": new TextLayer("Hello,", {}),
  "world": new TextLayer("World", {}),
  "exclamation": new ConfigurationLayer(
    {
      1: new TextLayer("!", {}),
      2: new TextLayer("!!", {}),
      3: new TextLayer("!!!", {}),
    }, {}
  )
};
