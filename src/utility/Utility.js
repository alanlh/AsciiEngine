import AssetLoader from "./AssetLoader.js";
import Parser from "./Parser.js";
import MessageBoard from "./MessageBoard.js";
import MessageReceiver from "./MessageReceiver.js";

// A selection of tools and data structures to export.
const Utility = {
  Parser: Parser,
  AssetLoader: AssetLoader,
  MessageBoard: MessageBoard,
  MessageReceiver: MessageReceiver,
}

Object.freeze(Utility);
export default Utility;
