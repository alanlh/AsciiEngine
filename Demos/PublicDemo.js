"use strict";
window.onload = async function() {
  LOGGING.STATUS.DEBUG_VERBOSE = false;
  LOGGING.STATUS.DEBUG = false;
  LOGGING.STATUS.LOG = false;
  LOGGING.STATUS.PERFORMANCE = true;
  LOGGING.PERFORMANCE.LEVEL = 0;
  
  helloWorld2();
}

function helloWorld2() {
  let helloText = new TextLayer("Hello\nWorld!", {
    topLeftCoords: new Vector2(0, 0),
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
      backgroundColor: "red",
      setAsBlank: '.',
      topLeftCoords: new Vector2(1, 0)
    }
  );
  
  let balloonStem = new TextLayer(
    "|\n" + 
    "|\n" +
    "|\n",
    {
      priority: 10,
      topLeftCoords: new Vector2(3, 4)
    }
  );
  
  let balloonStemTilted1 = new TextLayer(
    " |\n" + 
    " |\n" +
    "/",
    {
      priority: 10,
      topLeftCoords: new Vector2(2, 4)
    }
  );
  
  let balloonStemTilted2 = new TextLayer(
    "  |\n" + 
    " /\n" +
    "/",
    {
      priority: 10,
      topLeftCoords: new Vector2(1, 4)
    }
  );
  
  let balloonStemTilted3 = new TextLayer(
    "  /\n" + 
    "_/\n",
    {
      priority: 10,
      topLeftCoords: new Vector2(0, 4)
    }
  );
  
  let balloonInHand = new ContainerLayer(
    [balloon, balloonStem],
    {
      priority: 0,
      topLeftCoords: new Vector2(0, 0),
      events: {
        click: "balloonMove"
      }
    }
  );
  
  let balloonAway1 = new ContainerLayer(
    [balloon, balloonStemTilted1],
    {
      priority: 10,
      topLeftCoords: new Vector2(0, 0)
    }
  );
  
  let balloonAway2 = new ContainerLayer(
    [balloon, balloonStemTilted2],
    {
      priority: 10,
      topLeftCoords: new Vector2(0, 0)
    }
  );
  
  let balloonAway3 = new ContainerLayer(
    [balloon, balloonStemTilted3],
    {
      priority: 10,
      topLeftCoords: new Vector2(0, 0)
    }
  );
  
  let balloonPhases = new ConfigurationLayer(
    {
      "hold": balloonInHand,
      "drift": balloonAway1,
      "far": balloonAway2,
      "away": balloonAway3
    },
    {
      priority: 10,
      topLeftCoords: new Vector2(0, 0),
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
      topLeftCoords: new Vector2(0, 0)
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
      topLeftCoords: new Vector2(0, 0)
    }
  );
  
  let personPhases = new ConfigurationLayer(
    {
      "hold": person,
      "reach": personReaching
    },
    {
      priority: 0,
      topLeftCoords: new Vector2(0, 0),
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
        scene.shiftElements("balloon", new Vector2(2, 0));
        scene.render();
        setTimeout(followup, 1000);
        iteration ++;
      }
      let followup = function() {
        scene.shiftElements("balloon", new Vector2(2, 0));
        if (iteration == 2) {
          scene.configureElements("balloon", "drift");
        } else if (iteration == 4) {
          scene.configureElements("balloon", "far");
        } else if (iteration == 6) {
          scene.configureElements("human", "reach");
          scene.shiftElements("balloon", new Vector2(0, -1));
        } else if (iteration == 8){
          scene.shiftElements("balloon", new Vector2(0, -1));
          scene.configureElements("balloon", "away");
        } 
        if (iteration >= 6 && iteration % 2 == 0) {
          scene.shiftElements("human", new Vector2(1, 0));
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
    boundingBoxDimens: new Vector2(30, 15),
    eventHandlers: eventHandlers
  });
  
  scene.addElement("HELLO", helloText);
  scene.addElement("human dynamic", personPhases);
  scene.addElement("balloon dynamic", balloonPhases);
  scene.moveElements("dynamic", new Vector2(5, 5));
  scene.shiftElements("balloon", new Vector2(2, -5));
  scene.render();
}
