import Component from "./Component.js";

export default class AsciiAnimateComponent extends Component {
  constructor() {
    super();
    this._name = undefined;
    this._spriteNameList = {};
    this._styleNameList = {};
    this._relativePositionList = {};
    
    this.visible = true;
    this.dataIsLocal = false;
  }
  
  get currentFrame() {
    return this._name;
  }
  
  get spriteNameList() {
    return this._spriteNameList[this.currentFrame];
  }
  
  get styleNameList() {
    return this._styleNameList[this.currentFrame];
  }
  
  get relativePositionList() {
    return this._relativePositionList[this.currentFrame];
  }
  
  addFrame(
    name,
    spriteNameList,
    styleNameList,
    relativePositionList
  ) {
    console.assert(
      spriteNameList.length === styleNameList.length &&
      spriteNameList.length === relativePositionList.length,
      "AsciiAnimateComponent inputs must be of the same length"
    );
    if (this._name === undefined) {
      this._name = name;
    }
    this._spriteNameList[name] = spriteNameList;
    this._styleNameList[name] = styleNameList;
    this._relativePositionList[name] = relativePositionList;
  }
  
  setFrame(name) {
    if (name in this._spriteNameList) {
      this._name = name;
    }
  }
}

AsciiAnimateComponent.type = "AsciiAnimate";
