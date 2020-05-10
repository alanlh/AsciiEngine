export default class Component {
  /**
   * Base class for components.
   * All derived components must specify a static "name" property. 
   */
  constructor() {
    if (this.constructor === Component) {
      throw new TypeError("Components cannot be instantiated directly!");
    }
  }
  
  get type() {
    return this.constructor.type;
  }
}
