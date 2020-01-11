const demo_1_config = {
  [ComponentNames.Clock]: {
    cyclesPerRealSecond: 1,
    maxCycles: 2,
  },
  [ComponentNames.Display]: {
    scenes: {
      "main": {
        name: "engine1",
        boundingBoxDimens: {x: 40, y: 7},
      },
    },
  },
  [ComponentNames.PanelManager]: {
    startScreen: "main"
  }
}
