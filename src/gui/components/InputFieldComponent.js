import Component from "../../engine/components/Component";

export default class InputFieldComponent extends Component {
  constructor() {
    super();

    /**
     * @type {number}
     */
    this.width = 0;
    /**
     * @type {number}
     */
    this.height = 1;

    /**
     * @type {string}
     */
    this.initialText = "";

    /**
     * @private
     */
    this._currentText = "";

    /**
     * @type {string}
     */
    this.textColor = undefined;
    /**
     * @type {string}
     */
    this.backgroundColor = undefined;
    /**
     * @type {string}
     */
    this.focusedColor = undefined;
    /**
     * @type {string}
     */
    this.cursorColor = undefined;

    /**
     * @type {boolean}
     */
    this.editable = false;

    /**
     * @type {number}
     */
    this.maxLength = 0;
  }

  /**
   * @returns {boolean}
   */
  get currentText() {
    return this._currentText;
  }
}

InputFieldComponent.type = "AsciiInputField";