import Component from "../../engine/components/Component.js";

export default class TextBoxComponent extends Component {
  constructor() {
    super();

    /**
     * @type {string}
     */
    this.text = "";
    /**
     * @type {number}
     */
    this.width = 0;
    /**
     * @type {number}
     */
    this.height = 1;

    /**
     * @type {string | undefined}
     */
    this.textColor = undefined;
    /**
     * @type {string | undefined}
     */
    this.backgroundColor = undefined;
  }
}

TextBoxComponent.type = "TextBox";