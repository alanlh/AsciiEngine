import ButtonComponent from "./components/ButtonComponent.js";
import InputFieldComponent from "./components/InputFieldComponent.js";
import TextBoxComponent from "./components/TextBoxComponent.js";

import ButtonSystem from "./systems/ButtonSystem.js";
import InputFieldSystem from "./systems/InputFieldSystem.js";
import TextBoxSystem from "./systems/TextBoxSystem.js";

const GuiElements = {
  Components: {
    Button: ButtonComponent,
    InputField: InputFieldComponent,
    TextBox: TextBoxComponent,
  },
  Systems: {
    Button: ButtonSystem,
    InputField: InputFieldSystem,
    TextBox: TextBoxSystem,
  }
}

export default GuiElements;