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
      topLeftCoords: new Vector2(4, 0)
    }
  );
  
  let balloonStem = new TextLayer(
    "|\n" + 
    "|\n" +
    "|\n",
    {
      priority: 10,
      topLeftCoords: new Vector2(6, 4)
    }
  );
  
  let person = new TextLayer(
    "  _\n" + 
    " | |\n" + 
    " /|\\/\n" + 
    "  |\n" + 
    " / \\\n",
    {
      priority: 10,
      topLeftCoords: new Vector2(0, 5)
    }
  );
  
  let personBalloon = new ContainerLayer(
    [person, balloon, balloonStem],
    {
      priority: 0,
      topLeftCoords: new Vector2(0, 0)
    }
  )
    
  let scene = new Scene({
    divId: "hello2",
    boundingBoxDimens: new Vector2(30, 15)
  });
  
  scene.addElement("HELLO", helloText);
  scene.addElement("human balloon", personBalloon);
  scene.moveElements("human", new Vector2(5, 5));
  scene.render();
}
