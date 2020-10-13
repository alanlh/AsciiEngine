const AssetLoader = {
  /**
   * 
   * @param {string} filename The file name to load
   */
  loadFileAsString: async function(filename) {
    let request = async function(filename) {
      return new Promise(function(resolve, reject) {
        let file = new XMLHttpRequest();
        file.open("GET", filename);
        file.onreadystatechange = function() {
          if (file.readyState === 4) {
            if (file.status === 200 || file.status === 0) {
              let text = file.responseText;
              resolve(text);
            } else {
              console.error("HTTP Request returned status code: ", file.status);
            }
          }
        }
        file.send();
      });
    }
    let fileString = await request(filename);
    return fileString;
  },
}

Object.freeze(AssetLoader);
export default AssetLoader;
