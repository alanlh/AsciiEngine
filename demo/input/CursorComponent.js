import AsciiEngine from "../../dist/engine.js";

export default class CursorComponent extends AsciiEngine.Component {
  // A blank class for now to make sure only the CursorSystem has access to it?
  constructor() {
    super();
  }
}

CursorComponent.type = "Cursor";
