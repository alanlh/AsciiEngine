import Component from "../../engine/components/Component.js";
import Sprite from "../../graphics/Sprite.js";

export default class ButtonComponent extends Component {
  constructor() {
    super();
    
    this.sprite = new Sprite("");
    this.textColor = undefined;
    this.backgroundColor = undefined;
    this.hoverColor = undefined;
    this.activeColor = undefined;
  }
}

ButtonComponent.type = "AsciiButton";