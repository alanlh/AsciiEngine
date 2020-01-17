"use strict";
window.addEventListener("load", async function() {
  LOGGING.STATUS.DEBUG_VERBOSE = false;
  LOGGING.STATUS.DEBUG = false;
  LOGGING.STATUS.LOG = false;
  LOGGING.STATUS.PERFORMANCE = true;
  LOGGING.PERFORMANCE.LEVEL = 0;
  
  helloWorld2();
  await fileParsing();
  interactiveDialogue();
})

function helloWorld2() {
  let helloText = new TextLayer("Hello\nWorld!", {
    topLeftCoords: {x: 0, y: 0},
    priority: 0,
    fontWeight: "bold"
  });
  
  let balloon = new TextLayer(
    "  _\n" + 
    " /.\\\n" + 
    "|...|\n" + 
    " \\./\n",
    {
      priority: 10,
      formatting: {
        backgroundColor: "red"
      },
      setAsBlank: '.',
      topLeftCoords: {x: 1, y: 0}
    }
  );
  
  let balloonStem = new TextLayer(
    "|\n" + 
    "|\n" +
    "|\n",
    {
      priority: 10,
      topLeftCoords: {x: 3, y: 4}
    }
  );
  
  let balloonStemTilted1 = new TextLayer(
    " |\n" + 
    " |\n" +
    "/",
    {
      priority: 10,
      topLeftCoords: {x: 2, y: 4}
    }
  );
  
  let balloonStemTilted2 = new TextLayer(
    "  |\n" + 
    " /\n" +
    "/",
    {
      priority: 10,
      topLeftCoords: {x: 1, y: 4}
    }
  );
  
  let balloonStemTilted3 = new TextLayer(
    "  /\n" + 
    "_/\n",
    {
      priority: 10,
      topLeftCoords: {x: 0, y: 4}
    }
  );
  
  let balloonInHandClickable = new ContainerLayer(
    [balloon, balloonStem],
    {
      priority: 0,
      topLeftCoords: {x: 0, y: 0},
      events: {
        click: "balloonMove"
      },
      formatting: {
        cursor: "pointer"
      }
    }
  );
  
  let balloonInHandClicked = new ContainerLayer(
    [balloon, balloonStem],
    {
      priority: 0,
      topLeftCoords: {x: 0, y: 0},
    }
  );
  
  let balloonAway1 = new ContainerLayer(
    [balloon, balloonStemTilted1],
    {
      priority: 10,
      topLeftCoords: {x: 0, y: 0}
    }
  );
  
  let balloonAway2 = new ContainerLayer(
    [balloon, balloonStemTilted2],
    {
      priority: 10,
      topLeftCoords: {x: 0, y: 0}
    }
  );
  
  let balloonAway3 = new ContainerLayer(
    [balloon, balloonStemTilted3],
    {
      priority: 10,
      topLeftCoords: {x: 0, y: 0}
    }
  );
  
  let balloonPhases = new ConfigurationLayer(
    {
      "hold": balloonInHandClickable,
      "release": balloonInHandClicked,
      "drift": balloonAway1,
      "far": balloonAway2,
      "away": balloonAway3
    },
    {
      priority: 10,
      topLeftCoords: {x: 0, y: 0},
      defaultKey: "hold"
    }
  );
  
  let person = new TextLayer(
    "  _\n" + 
    " | |\n" + 
    " /|\\/\n" + 
    "  |\n" + 
    " / \\\n",
    {
      priority: 0,
      topLeftCoords: {x: 0, y: 0}
    }
  );
  
  let personReaching = new TextLayer(
    "  _\n" + 
    " | |\n" + 
    " /|---\n" + 
    "  |\n" + 
    " / \\\n",
    {
      priority: 0,
      topLeftCoords: {x: 0, y: 0}
    }
  );
  
  let personPhases = new ConfigurationLayer(
    {
      "hold": person,
      "reach": personReaching
    },
    {
      priority: 0,
      topLeftCoords: {x: 0, y: 0},
      defaultKey: "hold"
    }
  );
  
  let eventHandlers = {
    balloonMove: (function() {
      let iteration = 0;
      let started = false;
      let startFunc = function() {
        if (started) {
          console.error("Pressing more than once doesn't work!");
          return;
        }
        started = true;
        scene.configureElements("balloon", "release");
        scene.shiftElements("balloon", {x: 2, y: 0});
        scene.render();
        setTimeout(followup, 1000);
        iteration ++;
      }
      let followup = function() {
        scene.shiftElements("balloon", {x: 2, y: 0});
        if (iteration == 2) {
          scene.configureElements("balloon", "drift");
        } else if (iteration == 4) {
          scene.configureElements("balloon", "far");
        } else if (iteration == 6) {
          scene.configureElements("human", "reach");
          scene.shiftElements("balloon", {x: 0, y: -1});
        } else if (iteration == 8){
          scene.shiftElements("balloon", {x: 0, y: -1});
          scene.configureElements("balloon", "away");
        } 
        if (iteration >= 6 && iteration % 2 == 0) {
          scene.shiftElements("human", {x: 1, y: 0});
        }
        
        scene.render();
        if (iteration <= 12) {
          setTimeout(followup, 1000);
        }
        iteration ++;
      };
      
      return startFunc;
    })()
  };
    
  let scene = new Scene({
    divId: "hello2",
    boundingBoxDimens: Vector2.create(30, 15),
    eventHandlers: eventHandlers
  });
  
  scene.addElement("HELLO", helloText);
  scene.addElement("human dynamic", personPhases);
  scene.addElement("balloon dynamic", balloonPhases);
  scene.moveElements("dynamic", {x: 5, y: 5});
  scene.shiftElements("balloon", {x: 2, y: -5});
  scene.render();
}

async function fileParsing() {
  let textParseElements = await Parse.readDataFromFile("demo/graphics/assets/text_parse.txt");
  if (!textParseElements) {
    return;
  }
  
  let scene = new Scene({
    divId: "parsing",
    boundingBoxDimens: Vector2.create(150, 30)
  });
    
  scene.addElement("boat", textParseElements["Boat"]);
  scene.addElement("sea", textParseElements["SeaCombined"]);
  scene.render();
  let iteration = 0;
  function sail() {
    scene.shiftCamera({x: 1, y: 0});
    if (iteration % 4 == 1) {
      scene.shiftElements("boat", {x: 1, y: 1});
    } else if (iteration % 4 == 3) {
      scene.shiftElements("boat", {x: 1, y: -1});
    } else {
      scene.shiftElements("boat", {x: 1, y: 0});
    }
    scene.render();
    iteration ++;
    if (iteration < 10) {
      setTimeout(sail, 500);
    }
  }
  
  setTimeout(sail, 500);
}

function interactiveDialogue() {
  let scene = new Scene({
    divId: "interactiveDialogue",
    boundingBoxDimens: Vector2.create(50, 15)
  });
  
  let dummyTextStr1 = "  Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.\n";
  let dummyTextStr2 = "  Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.\n";
  let dummyTextStr3 = "  Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.\n";
  let dummyTextStr4 = "  Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.\n";
  let dummyText = new TextBox(dummyTextStr1 + dummyTextStr2 + dummyTextStr3 + dummyTextStr4, {
    boundingBoxDimens: Vector2.create(49, 30)
  });
  
  scene.addElement("lorem", dummyText);
  
  scene.render();
}
