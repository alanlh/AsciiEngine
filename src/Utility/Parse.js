"use strict";
const Parse = {
  readDataFromFile: async function(filename) {
    LOGGING.PERFORMANCE.START("readDataFromFile", 0);
    let makeRequest = async function(filename) {
      return new Promise(function(resolve, reject) {
        let fileRequest = new XMLHttpRequest();
        fileRequest.open("GET", filename);
        fileRequest.onreadystatechange = function() {
          if (fileRequest.readyState === 4) {
            if (fileRequest.status === 200 || fileRequest.status === 0) {
              let text = fileRequest.responseText;
              resolve(text);
            } else {
              LOGGING.ERROR("HTTP Request for file ", filename, " returned status code: ", file.status)
            }
          }
        }
        fileRequest.send();
      });
    }

    let fileString = await makeRequest(filename);
    
    let fileData = Parse.readDataFromString(fileString);
    LOGGING.PERFORMANCE.STOP("readDataFromFile");
    return fileData;
  },
  readDataFromString: function(dataString) {
    const parsedLayers = {};
    
    const parseDelimiter = dataString.split("\n", 1)[0] + '\n';
    const layers = dataString.split(parseDelimiter);
    // TODO: Verify that there is data.
    // TODO: Assert that components[0] is empty. 
    for (let i = 1; i < layers.length; i ++) {
      if (layers[i].length === 0) {
        continue;
      }
      const layer = layers[i];
      const title = layers[i].split("\n", 1)[0];
      const name = title.split(":")[0].trim();
      // TODO: Verify name. Should not repeat. 
      let body = Parse.parseBody(layers[i].substring(layers[i].indexOf("\n") + 1));
      const type = title.split(":")[1].trim();
      let constructedLayer = undefined;
      switch (type) {
        case "Text":
          constructedLayer = Parse.constructTextLayer(body);
          break;
        case "Configuration":
          constructedLayer = Parse.constructConfigurationLayer(body, parsedLayers);
          break;
        case "Container":
          constructedLayer = Parse.constructContainerLayer(body, parsedLayers);
          break;
        default:
          LOGGING.ERROR("Layer type ", type, " does not exist or is not supported");
      }
      // TODO: Verify constructedLayer is valid.
      parsedLayers[name] = constructedLayer;
    }
    return parsedLayers;
  },
  parseBody: function(body) {
    let netBrackets = 0;
    let dataIndex = 0;
    for (; dataIndex < body.length; dataIndex ++) {
      if (body.charAt(dataIndex) === '{') {
        netBrackets ++;
      } else if (body.charAt(dataIndex) === '}') {
        netBrackets --;
        if (netBrackets === 0) {
          break;
        }
      }
    }
    
    let dataString = body.substring(0, dataIndex + 1);
    let data = undefined;
    try {
      data = JSON.parse(dataString);
    } catch (e) {
      Parse.printJSONError(dataString, e);
    }
    
    let content = body.substring(body.indexOf("\n", dataIndex) + 1);
    return {data: data, content: content};
  },
  printJSONError: function(string, e) {
    LOGGING.ERROR("JSON Error: ", error, "\n",
      "At string: ", string
    );
  },
  constructTextLayer: function(body) {
    let text = body.content.replace(/\r/g, '');
    return new TextLayer(text, body.data);
  },
  constructConfigurationLayer: function(body, parsedLayers) {
    let childLayers = JSON.parse(body.content);
    for (let childName in childLayers) {
      if (childName in parsedLayers) {
        childLayers[childName] = parsedLayers[childName];
      } else {
        LOGGING.WARN("Configuration Layer child name ", childName, " does not exist in file.");
      }
    }
    return new ConfigurationLayer(childLayers, body.data);
  },
  constructContainerLayer: function(body, parsedLayers) {
    let childLayers = [];
    let childLayerNames = body.content.split(/\r?\n/);
    for (let i = 0; i < childLayerNames.length; i ++) {
      if (childLayerNames[i].length > 0) {
        let childLayer = parsedLayers[childLayerNames[i]];
        childLayers.push(childLayer);
      }
    }
    return new ContainerLayer(childLayers, body.data);
  }
}

Object.freeze(Parse);
