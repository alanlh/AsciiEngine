import Component from "./Component.js";

export default class PositionComponent extends Component {
  /**
   * Creates a basic 3D position
   * @param {number} x 
   * @param {number} y 
   * @param {number} z 
   */
  constructor(x, y, z) {
    super();
    /**
     * @type {number} The x coordinate
     */
    this.x = x || 0;
    /**
     * @type {number} The y coordinate
     */
    this.y = y || 0;
    /**
     * @type {number} The z coordinate
     */
    this.z = z || 0;
  }
}

PositionComponent.type = "PositionComponent";
