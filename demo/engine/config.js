const demo_1_config = {
  [ComponentNames.Clock]: {
    cyclesPerRealSecond: 2,
    maxCycles: 0,
  },
  [ComponentNames.Display]: {
    scenes: {
      "first_screen": {
        name: "engine1",
        boundingBoxDimens: {x: 40, y: 8},
      },
    },
  },
  [ComponentNames.PanelManager]: {
    startScreen: "main"
  }
}
