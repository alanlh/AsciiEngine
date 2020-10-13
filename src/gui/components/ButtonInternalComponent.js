import Component from "../../engine/components/Component.js";

export default class ButtonInternalComponent extends Component {
  constructor() {
    super();

    /**
     * @type {ButtonInternalComponent.MouseStates}
     */
    this.mouseState = ButtonInternalComponent.MouseStates.Default;
  }
}

ButtonInternalComponent.type = "AsciiButtonInternal"

/**
 * @enum {string} 
 */
ButtonInternalComponent.MouseStates = {
  Default: "Default",
  Hover: "Hover",
  Active: "Active",
};