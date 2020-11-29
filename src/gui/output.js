import ButtonComponent from "./components/ButtonComponent.js";
import ClickableComponent from "./components/ClickableComponent.js";
import InputFieldComponent from "./components/InputFieldComponent.js";
import TextBoxComponent from "./components/TextBoxComponent.js";

import ButtonSystem from "./systems/ButtonSystem.js";
import ClickableSystem from "./systems/ClickableSystem.js";
import InputFieldSystem from "./systems/InputFieldSystem.js";
import TextBoxSystem from "./systems/TextBoxSystem.js";

const GuiElements = {
  Components: {
    Button: ButtonComponent,
    InputField: InputFieldComponent,
    TextBox: TextBoxComponent,
    Clickable: ClickableComponent,
  },
  Systems: {
    Button: ButtonSystem,
    InputField: InputFieldSystem,
    TextBox: TextBoxSystem,
    Clickable: ClickableSystem,
  }
}

export default GuiElements;