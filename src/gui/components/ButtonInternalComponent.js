import Component from "../../engine/components/Component.js";

export default class ButtonInternalComponent extends Component {
  constructor() {
    super();

    this.mouseState = ButtonInternalComponent.MouseStates.Default;
  }
}

ButtonInternalComponent.type = "AsciiButtonInternal"

ButtonInternalComponent.MouseStates = {
  Default: "Default",
  Hover: "Hover",
  Active: "Active",
};