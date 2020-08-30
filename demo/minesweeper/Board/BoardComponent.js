import { Component } from "../../../dist/engine.js";

export default class BoardComponent extends Component {
  constructor(width, height) {
    super();
    
    this.width = width;
    this.height = height;
    
    this.gameState = 0;
  }
}

BoardComponent.type = "Board";
