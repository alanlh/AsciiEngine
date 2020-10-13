import Component from "../../engine/components/Component.js";
import Sprite from "../../graphics/Sprite.js";

export default class ButtonComponent extends Component {
  constructor() {
    super();
    
    /**
     * @type {Sprite} The sprite of the button.
     */
    this.sprite = new Sprite("");
    /**
     * @type {string} The text color of the button
     */
    this.textColor = undefined;
    /**
     * @type {string?} The background color of the button
     */
    this.backgroundColor = undefined;
    /**
     * @type {string | undefined} The background color of the button when hovered
     */
    this.hoverColor = undefined;
    /**
     * @type {string | undefined} The background color of the button when clicked
     */
    this.activeColor = undefined;
  }
}

ButtonComponent.type = "AsciiButton";