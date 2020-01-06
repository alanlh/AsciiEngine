const demo_1_config = {
  [ComponentNames.Clock]: {
    cyclesPerRealSecond: 1,
    maxCycles: 2,
  },
  [ComponentNames.Display]: {
    scenes: {
      "main": {
        name: "engine1",
        boundingBoxDimens: {x: 80, y: 20},
      },
    },
  },
  [ComponentNames.PanelManager]: {
    startScreen: "main"
  }
}
