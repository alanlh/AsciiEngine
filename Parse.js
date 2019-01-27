// Functions for reading ASCII data from files

async function readDataFromFile(filename) {
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
  console.debug("Splitter: ", splitter);
  // TODO: Verify that there is data
  let components = dataString.split(splitter);
  // TODO: Verify that components[0] is empty string
  for (let i = 1; i < components.length; i ++) {
    if (components[i].length === 0) {
      continue;
    }
    console.debug("Component: ", components[i]);
    let title = components[i].split("\n", 1)[0];
    let name = title.split(":")[0].trim()
    let type = title.split(":")[1].trim()
    if (type === "Animation") {
      animationJobs[name] = createAnimationFromString(components[i], frameJobs);
      console.debug(animationJobs);
    } else if (type === "Frame") {
      frameJobs[name] = createFrameFromString(components[i], frameLayerJobs);
      console.debug(frameJobs);
    } else if (type === "FrameLayer") {
      frameLayerJobs[name] = createFrameLayerFromString(components[i]);
      console.debug(frameLayerJobs);
    } else {
      console.error("Improper type name.")
    }
  }
  return {animations: animationJobs, frames: frameJobs, frameLayers: frameLayerJobs};
}

function createAnimationFromString(string, frameJobs) {
  /**
  Data in the following format:
  Frame Name, iterations
  Frame Name, iterations
  ...
  **/

  let splitString = parseOptions(string);
  let data = splitString.data;
  let frameNames = data.split("\n");
  let frames = [];
  let iterations = [];
  for (let i = 0; i < frameNames.length; i ++) {
    if (frameNames[i].length > 0) {
      let name = frameNames[i].split(",")[0].trim();
      frames.push(frameJobs[name]);
      iterations.push(Number(frameNames[i].split(",")[1].trim()));
    }
  }

  return new Animation(frames, iterations, splitString.options);
}

function createFrameFromString(string, frameLayerJobs) {
  /**
  Data in following format:
  FrameLayerName
  FrameLayerName
  ...
  **/

  let splitString = parseOptions(string);
  let data = splitString.data;
  let frameLayerNames = data.split(/\r?\n/);

  let frameLayers = [];
  for (let i = 0; i < frameLayerNames.length; i ++) {
    if (frameLayerNames[i].length > 0) {
      let frameLayer = frameLayerJobs[frameLayerNames[i]];
      frameLayers.push(frameLayerJobs[frameLayerNames[i]]);
    }
  }

  return new Frame(frameLayers);
}

function createFrameLayerFromString(string) {
  /**
    Data section is just the drawing.
    Formatting and coordinates should be within JSON
  **/
  let splitString = parseOptions(string);
  let data = splitString.data;
  data = data.replace(/\r/g, '');

  let options = splitString.options;

  let coordinates = options.coordinates || {x: 0, y: 0};
  let formatting = options.formatting || {};

  return new FrameLayer(data, coordinates, formatting, options);
}

function parseOptions(string) {
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
  let options = JSON.parse(optionsString);

  let data = string.substring(string.indexOf("\n", optionsIndex) + 1);
  return {options: options, data: data};
}
