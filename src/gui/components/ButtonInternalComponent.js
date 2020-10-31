import Component from "../../engine/components/Component.js";

export default class ButtonInternalComponent extends Component {
  constructor() {
    super();

    /**
     * @type {ButtonInternalComponent.MouseStates}
     */
    this.mouseState = ButtonInternalComponent.MouseStates.Default;

    /**
     * @type {boolean}
     */
    this.dataIsLocal = true;
    this.defaultFrame = ButtonInternalComponent.MouseStates.Default;
    this.hoverFrame = ButtonInternalComponent.MouseStates.Hover;
    this.activeFrame = ButtonInternalComponent.MouseStates.Active;
  }

  get frameName() {
    switch (this.mouseState) {
      case ButtonInternalComponent.MouseStates.Default:
        return this.defaultFrame;
      case ButtonInternalComponent.MouseStates.Hover:
        return this.hoverFrame;
      case ButtonInternalComponent.MouseStates.Active:
        return this.activeFrame;
    }
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