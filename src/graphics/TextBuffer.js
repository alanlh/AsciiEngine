class TextBuffer {
  constructor() {
    this._width = 0;
    this._height = 0;
  }
  
  init(width, height) {
    this._width = width;
    this._height = height;
    
    for (let y = 0; y < height; y ++) {
      this.computedStyles.push([]);
      for (let x = 0; x < width; x ++) {
        this.computedStyles[y].push(new ComputedStyle());
      }
    }
  }
  
  get width() {
    return this._width;
  }
  
  get height() {
    return this._height;
  }

}
