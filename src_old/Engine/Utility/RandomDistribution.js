class RandomDistribution {
  /**
  * Takes in a set of whatever, each with an associated weight. 
  **/
  constructor(distribution) {
    this._distributionIds = [];
    this._cumulativeValues = [];
    this._total = 0;
    for (let id in distribution) {
      this._total += distribution[id];
      this._size ++;
      this._distributionIds.push(id);
      this._cumulativeValues.push(this._total);
    }
  }
  
  // Returns a random id. 
  getRandom() {
    let randInt = UtilityMethods.generateRandomInt(0, this._total);
    for (let i = 0; i < this._size; i ++) {
      if (randInt < this._cumulativeValues[i]) {
        return this._distributionIds[i];
      }
    }
    LOGGING.ERROR("Random Distribution returning bad value?", randInt, this._total);
    return this._distributionIds[this._size - 1];
  }
}
