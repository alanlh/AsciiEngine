// Functions for reading ASCII data from files
async function readDataFromFile(filename) {
  "use strict"
  // Code referenced from here
  // https://stackoverflow.com/questions/48969495/in-javascript-how-do-i-should-i-use-async-await-with-xmlhttprequest

  let makeRequest = async function(filename) {
    return new Promise(function(resolve, reject) {
      let file = new XMLHttpRequest();
      file.open("GET", filename);
      file.onreadystatechange = function() {
        if (file.readyState === 4) {
          if (file.status === 200 || file.status === 0) {
            let text = file.responseText;
            resolve(text);
          } else {
            console.error("HTTP Request returned status code: ", file.status)
          }
        }
      }
      file.send();
    });
  }

  let fileString = await makeRequest(filename);

  return parseFromString(fileString);
}

function parseFromString(dataString) {
  "use strict"
  /**
--CODE--
NAME: Type
{
  [Options in JSON format]
  Note that there must be an opening and closing bracket, even for Frames
}
[Data:

]
--CODE--
  **/
  let animationJobs = {};
  let frameJobs = {};
  let frameLayerJobs = {};

  let splitter = dataString.split("\n", 1)[0] + '\n';
  // TODO: Verify that there is data
  let components = dataString.split(splitter);
  // TODO: Verify that components[0] is empty string
  for (let i = 1; i < components.length; i ++) {
    if (components[i].length === 0) {
      continue;
    }
    let title = components[i].split("\n", 1)[0];
    let name = title.split(":")[0].trim()
    let type = title.split(":")[1].trim()
    // Check to make sure that no two have the same name. 
    if (type === "Animation") {
      animationJobs[name] = createAnimationFromString(components[i], frameJobs);
    } else if (type === "Frame") {
      frameJobs[name] = createFrameFromString(components[i], frameLayerJobs);
    } else if (type === "FrameLayer") {
      frameLayerJobs[name] = createFrameLayerFromString(components[i]);
    } else {
      console.error("Improper type name.")
    }
  }
  return {animations: animationJobs, frames: frameJobs, frameLayers: frameLayerJobs};
}

function createAnimationFromString(string, frameJobs) {
  "use strict"
  /**
  There are no options for this. 
  Can Use either format. In the former case, the frame name will not be included.
  Frame Name : Default Name, [Alternate Name], ...
  Frame Name, [Alternate Name]
  **/

  let jsonData = parseOptions(string);
  let data = jsonData.data;
  let frameNames = data.split("\n");
  let frames = {};
  // TODO: Add more formatting checks. 
  for (let i = 0; i < frameNames.length; i ++) {
    if (frameNames[i].length > 0) {
      let splits = frameNames[i].split(":");
      let labels = "";
      let frameName = "";
      if (splits.length == 1) {
        labels = splits[0];
        frameName = splits[0].split(",")[0].trim();
      } else if (splits.length == 2) {
        frameName = splits[0].trim();
        labels = splits[1];      
      } else {
        console.warn("Possible improper formatting. Multiple colons.")
      }
      labels = labels.split(",");
      for (let j = 0; j < labels.length; j ++) {
        // Check if name has already been used. 
        if (labels[j].length > 0) {
          let label = labels[j].trim();
          frames[label] = frameJobs[frameName];
        }
      }
    }
  }
  
  return new Animation(frames, jsonData.options);
}

function createFrameFromString(string, frameLayerJobs) {
  "use strict"
  /**
  Data in following format:
  FrameLayerName
  FrameLayerName
  ...
  **/

  let jsonData = parseOptions(string);
  let data = jsonData.data;
  let frameLayerNames = data.split(/\r?\n/);

  let frameLayers = [];
  for (let i = 0; i < frameLayerNames.length; i ++) {
    if (frameLayerNames[i].length > 0) {
      let frameLayer = frameLayerJobs[frameLayerNames[i]];
      frameLayers.push(frameLayerJobs[frameLayerNames[i]]);
    }
  }

  return new Frame(frameLayers, jsonData);
}

function createFrameLayerFromString(string) {
  "use strict"
  /**
    Data section is just the drawing.
    Formatting and coordinates should be within JSON
  **/
  let jsonData = parseOptions(string);
  let data = jsonData.data;
  data = data.replace(/\r/g, '');

  let options = jsonData.options;

  return new FrameLayer(data, options);
}

function printJSONError(string, error) {
  "use strict"
  console.error("JSON Error: " + error + "\nString: \n" + string);
}

function parseOptions(string) {
  "use strict"
  string = string.substring(string.indexOf("\n") + 1);
  let netBrackets = 0;
  let optionsIndex = 0;
  for (; optionsIndex < string.length; optionsIndex ++) {
    if (string.charAt(optionsIndex) === '{') {
      netBrackets ++;
    } else if (string.charAt(optionsIndex) === '}') {
      netBrackets --;
      if (netBrackets === 0) {
        break;
      }
    }
  }

  let optionsString = string.substring(0, optionsIndex + 1);
  let options = {};
  try {
    options = JSON.parse(optionsString);
  } catch (e) {
    printJSONError(optionsString, e);
  }

  let data = string.substring(string.indexOf("\n", optionsIndex) + 1);
  return {options: options, data: data};
}
