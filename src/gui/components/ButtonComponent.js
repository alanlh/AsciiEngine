import Component from "../../engine/components/Component.js";
import Sprite from "../../graphics/Sprite.js";

export default class ButtonComponent extends Component {
  constructor() {
    super();
    
    /**
     * @type {boolean}
     * Whether or not the button's rendering data is stored locally or should be retrieved from the resource manager.
     * If the data is local, the field "sprite" must be set.
     * If the data is not local, the field "templateKey" must be set.
     */
    this.dataIsLocal = true;

    /**
     * @type {Sprite} The sprite of the button.
     */
    this.sprite = new Sprite("");
    /**
     * @type {string | undefined} The text color of the button
     */
    this.textColor = undefined;
    /**
     * @type {string | undefined} The background color of the button
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

    /**
     * @type {string} The name of the template to use. 
     */
    this.templateKey = undefined;
    /**
     * @type {string | undefined} The frame to set by default
     */
    this.defaultFrame = undefined;
    /**
     * @type {string | undefined} The frame to set on mouse hover
     */
    this.hoverFrame = undefined;
    /**
     * @type {string | undefined} The frame to set on mouse click
     */
    this.activeFrame = undefined;
  }
}

ButtonComponent.type = "AsciiButton";