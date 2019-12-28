class CollisionDetector extends Map2D {
  constructor() {
    super();
  }
  
  /**
    TODO: 
    Check collision on any new set of points. 
    Check collision if we wanted to swap out points from one ID. 
    Swap method for above case. 
  **/
  
  checkShiftCollision(id, vec2) {
    if (!(id in this._idMap[id])) {
      return false;
    }
    // First check if there is collision. 
    for (let pt of this._idMap[id]) {
      let newPt = Vector.add(pt, vec2);
      // Check if new point not empty and not occupied by self. 
      if (this.contains(newPt) && (this.get(newPt) !== id)) {
        return false;
      }
    }
    return true;
  }
  
  shift(id, vec2) {
    if (checkShiftCollision(id, vec2)) {
      return false;
    }
    let oldVecs = this.removeId(id);
    for (let vec of oldVecs) {
      this.insert(id, Vector2.add(vec, vec2));
    }
    return true;
  }
}
