import Utility from "../../utility/Utility.js";

export default class AsciiRenderModule {
  constructor(agl) {
    this._agl = agl;
    
    this._entities = {};
  }
  
  addEntity({
    name: name,
    absolutePosition: absolutePosition,
    spriteList: spriteList,
    styleList: styleList,
    relativePositionList: relativePositionList,
    events: {
      hover: hoverCallback,
      click: clickCallback,
    },
  } = {
    name: Utility.generateId("AsciiEngineEntity"),
    absolutePosition: [0, 0, 0],
    spriteList: [],
    styleList: [],
    relativePositionList: [],
    events: {
      hover: () => {},
      click: () => {},
    },
  }) {
    if (spriteList.length === 0) {
      return;
    }
    
    
  }
  
  removeEntity(name) {
    
  }
  
  shiftEntity(name, shift) {
    
  }
  
  moveEntity(name, dest) {
    
  }
}
