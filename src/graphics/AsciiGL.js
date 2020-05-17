import Sprite from "./Sprite.js";
import SpriteStyle from "./SpriteStyle.js";
import SpriteBuilder from "./SpriteBuilder.js";
import DOMBuffer from "./DomBuffer.js";
import DrawBuffer from "./DrawBuffer.js";

import Functions from "../utility/Functions.js";

class AsciiGLInstance {
  /**
   * Creates a new AsciiGL instance and attaches it to a div and prepares it for use.
   */
  constructor(containerId) {
    console.assert(containerId, "AsciiGL constructor requires a valid HTML element id parameter.");
    let outerContainer = document.getElementById(containerId);
    console.assert(outerContainer, "AsciiGL constructor parameter containerId does not correspond to a valid HTML element.");
    console.assert(
      (outerContainer.tagName === "DIV"),
      "Container element must be a DIV"
    );
    
    while (outerContainer.lastChild) {
      outerContainer.removeChild(outerContainer.lastChild);
    }
    
    outerContainer.style.textAlign = "center";
    
    let container = document.createElement("DIV");
    
    container.style.display = "inline-block";
    container.style.fontFamily = "Courier New";
    container.style.fontSize = "1em";
    container.style.userSelect = "none";
    
    outerContainer.appendChild(container);
    
    this._container = container;
    
    // Have two so that only one is modified at any given time.
    // TODO: Later, do more testing on using 2 DOMBuffers.
    this._domBuffer = new DOMBuffer();
    // For now, just use simple objects to hold.
    this._nameBuffers = [{}, {}]
    this._drawBufferIdx = 0;
    this._activeBufferIdx = 1;
    
    this._width = 0;
    this._height = 0;
    
    this._drawBuffer = new DrawBuffer();
    
    this._currMouseOver = undefined;
    this._handler = () => {};
  }
  
  /**
   * Initializes the pre element for rendering.
   */
  init(width, height) {
    console.assert(width > 0 && height > 0, "AsciiGL must have positive dimensions.");
    
    this._width = width;
    this._height = height;
    
    this._drawBuffer.init(width, height);

    this._domBuffer.init(width, height);
    this._nameBuffers[0] = {};
    this._nameBuffers[1] = {};
    
    this._container.appendChild(this._domBuffer.getDomElement());
    
    this._setupEventListeners();
    this.render();
  }
  
  /**
   * A helper method to set up event listeners on the container.
   */
  _setupEventListeners() {
    // See below for list of event types:
    // https://www.w3schools.com/jsref/obj_mouseevent.asp
    this._container.addEventListener("mouseenter", (event) => {
      this._handler(event, "mouseentercanvas");
      let target = this._nameBuffers[this._activeBufferIdx][event.target.dataset.asciiGlId];
      this._currMouseOver = target;
      if (target) {
        this._handler(event, "mouseenter", this._currMouseOver)
      }
    });
    
    this._container.addEventListener("mouseleave", (event) => {
      // This should partially alleviate glitches where mousemove isn't triggered after the mouse leaves the canvas.
      if (this._currMouseOver) {
        this._handler(event, "mouseleave", this._currMouseOver);
      }
      this._currMouseOver = undefined;
      this._handler(event, "mouseleavecanvas");
    });

    this._container.addEventListener("mousemove", (event) => {
      let target = this._nameBuffers[this._activeBufferIdx][event.target.dataset.asciiGlId];
      
      if (target !== this._currMouseOver) {
        if (this._currMouseOver) {
          this._handler(event, "mouseleave", this._currMouseOver);
        }
        this._currMouseOver = target;
        if (target) {
          this._handler(event, "mouseenter", this._currMouseOver)
        }
      }
      this._handler(event, "mousemove", this._nameBuffers[this._activeBufferIdx][event.target.dataset.asciiGlId])
    });

    this._container.addEventListener("mousedown", (event) => {
      this._handler(event, "mousedown", this._nameBuffers[this._activeBufferIdx][event.target.dataset.asciiGlId])
    });
    
    this._container.addEventListener("mouseup", (event) => {
      this._handler(event, "mouseup", this._nameBuffers[this._activeBufferIdx][event.target.dataset.asciiGlId])
    });
    
    this._container.addEventListener("click", (event) => {
      this._handler(event, "click", this._nameBuffers[this._activeBufferIdx][event.target.dataset.asciiGlId])
    });
    
    this._container.addEventListener("contextmenu", (event) => {
      // TODO: Perhaps let user customize behavior?
      event.preventDefault();
      this._handler(event, "contextmenu", this._nameBuffers[this._activeBufferIdx][event.target.dataset.asciiGlId]);
    })
  }
  
  _flipBuffers() {
    this._drawBufferIdx = 1 - this._drawBufferIdx;
    this._activeBufferIdx = 1 - this._activeBufferIdx;
  }
  
  get width() {
    return this._width;
  }
  
  get height() {
    return this._height;
  }
  
  get backgroundStyles() {
    return this._drawBuffer.backgroundStyle;
  }
  
  getBackgroundStyle(styleName) {
    return this._drawBuffer.backgroundStyle.getStyle(styleName);
  }
  
  setBackgroundStyle(styleName, value) {
    this._drawBuffer.backgroundStyle.setStyle(styleName, value);
  }
  
  /**
   * Set by user code. handlerFunc is called when an AsciiGL mouse event occurs. 
   * 
   * handlerFunc takes in (event, target, type).
   * event is the original MouseEvent object that triggered the AsiiGL event.
   * type is the name of the triggered event, with respect to AsciiGL.
   * target is the name of the element which the event was triggered on (may be undefined)
   * 
   * The type parameter does not necessarily correspond to the type of MouseEvent.
   * AsciiGL currently reports the current events:
   * 
   * mousemove: Mouse is in the AsciiGL canvas, and has moved.
   *  The coordinates of the mouse are in the MouseEvent object. 
   * mouseenter: Mouse entered the space belonging to a new target
   * mouseleave: Mouse leaves the space belonging to the current target
   * mouseentercanvas: Mouse enters the AsciiGL canvas
   * mouseleavecanvas: Mouse leaves the AsciiGL canvas
   * mousedown: Mouse button is pressed in the AsciiGL canvas
   * mouseup: Mousebutton is released in the AsciiGL canvas
   * click: A click event was registered in the AsciiGL canvas
   * 
   */
  setHandler(handlerFunc) {
    this._handler = handlerFunc;
  }
  
  /**
   * Draws a sprite onto the canvas. 
   * Must specify a location to draw to.
   * Style determines what the text looks like.
   * name is optional, and allows it to be referenced in event listeners.
   * Different sprites may share the same name.
   */
  draw(sprite, location, style, name) {
    let id = Functions.generateId(name);
    this._drawBuffer.draw(sprite, location, style, id);
    if (name) {
      this._nameBuffers[this._drawBufferIdx][id] = name;
    }
  }
  
  /**
   * Displays the current buffer and hides the displayed one.
   * 
   * All changes until the next call to flip will be on the other buffer. 
   */
  render() {
    this._domBuffer.bind(this._drawBuffer);
    // NOTE: Intitial tests suggest having only one buffer may be more optimal...
    // If so, move the appendChild line to init.
    // 
    // Clear the current elements and attach new ones. 
    // while (this._container.lastChild) {
    //   this._container.removeChild(this._container.lastChild);
    // }
    // this._container.appendChild(this._buffers[this._drawDOMBufferIdx].getDomElement());    
    //this._flipDomBuffers();
    this._drawBuffer.clear();
    this._nameBuffers[this._activeBufferIdx] = {};
    this._flipBuffers();
  }
}

const EventTypes = {
  MOUSE_ENTER_CANVAS: "mouseentercanvas",
  MOUSE_LEAVE_CANVAS: "mouseleavecanvas",
  MOUSE_ENTER: "mouseenter",
  MOUSE_LEAVE: "mouseleave",
  MOUSE_MOVE: "mousemove",
  MOUSE_ENTER: "mouseenter",
  MOUSE_DOWN: "mousedown",
  MOUSE_UP: "mouseup",
  CLICK: "click",
  CONTEXT_MENU: "contextmenu",
}

Object.freeze(EventTypes);


const AsciiGL = {
  Instance: AsciiGLInstance,
  Sprite: Sprite,
  SpriteStyle: SpriteStyle,
  SpriteBuilder: SpriteBuilder,
  EventTypes: EventTypes,
}

Object.freeze(AsciiGL);

export default AsciiGL;
