import ButtonComponent from "./components/ButtonComponent.js";
import InputFieldComponent from "./components/InputFieldComponent.js";

import ButtonSystem from "./systems/ButtonSystem.js";
import InputFieldSystem from "./systems/InputFieldSystem.js";

const GuiElements = {
  Components: {
    Button: ButtonComponent,
    InputField: InputFieldComponent,
  },
  Systems: {
    Button: ButtonSystem,
    InputField: InputFieldSystem,
  }
}

export default GuiElements;