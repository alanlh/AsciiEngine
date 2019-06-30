"use strict"
var LOG_PERFORMANCE = false;

window.onload = async function() {
  basicDisplay();
  prioritiesTest();
  basicAnimation();
  await constructorTests();
  await interactiveTest();
}

let interactiveTest = async function() {
  let interactiveScene = new Scene("interactiveTest");
  
  interactiveScene.setWidth(50);
  interactiveScene.setHeight(25);
  
  let assets = await readDataFromFile("Assets/InteractiveSign.txt");
  
  interactiveScene.addAnimation("sign", assets.animations["Sign"]);
    
  interactiveScene.addEventHandlers({
    "InteractiveSignLeft": function(e, scene, containers) {
      console.log("LEFT BUTTON PRESSED");
    }, 
    "InteractiveSignRight": function(e, scene, containers) {
      console.log("RIGHT BUTTON PRESSED");
    },
    "boldMouseOver": function(e, scene, containers) {
      if (LOG_PERFORMANCE) {
        var start = performance.now();
      }
      containers.frameLayer.triggerFormattingKey("bold");
      scene.render();
      if (LOG_PERFORMANCE) {
        console.log("Bold time: ", performance.now() - start);
      }
    },
    "unboldMouseLeave": function(e, scene, containers) {
      if (LOG_PERFORMANCE) {
        var start = performance.now();
      }
      containers.frameLayer.revertToDefaultFormat();
      scene.render();
      if (LOG_PERFORMANCE) {
        console.log("Unbold time: ", performance.now() - start);
      }
    },
    "updateSignText": function(e, scene, containers) {
      scene.iterateAnimation("sign", "SignFrameNewText");
      scene.render();
    },
    "revertSignText": function(e, scene, containers) {
      scene.iterateAnimation("sign", "SignFrameOldText");
      scene.render();
    }
  });
  
  interactiveScene.render();
}

let constructorTests = async function() {
  let constructorScene = new Scene("constructorTests");

  constructorScene.setWidth(100);
  constructorScene.setHeight(30);

  let drawings = await readDataFromFile("Assets/SampleDrawings.txt");

  let cityAnimation = new Animation({"city": drawings.frames["City"]});
  constructorScene.addAnimation("city", cityAnimation);
  constructorScene.shiftDrawing(["city"], {x: 0, y: 10});
  constructorScene.orderDrawing(["city"], 10);

  constructorScene.addAnimation(["boat"], drawings.animations["BoatFinal"]);
  constructorScene.shiftDrawing("boat", {x: 5, y: 6});
  
  let moonFrame = new Frame([drawings.frameLayers["MoonLayer"]]);
  let moonAnimation = new Animation({"moon": moonFrame}, "moon");
  constructorScene.addAnimation(["moon"], moonAnimation);
  constructorScene.shiftDrawing(["moon"], {x: 80, y: 0});

  constructorScene.addAnimation(["sea"], drawings.animations["SeaAnimation"]);
  constructorScene.shiftDrawing(["sea"], {x: 0, y: 19});
  constructorScene.orderDrawing(["sea"], 20);

  constructorScene.render();
  
  let renderBasic = function(iteration) {
    let start = performance.now();
    constructorScene.iterateAnimation(new Set(["boat"]));    
    if (iteration % 2 == 0) {
      constructorScene.iterateAnimation("boat", "Smoke1");
    } else {
      constructorScene.iterateAnimation("boat", "Smoke2");
    }
    constructorScene.render();
    let stop = performance.now();
    if (LOG_PERFORMANCE) {
      console.log("ConstructorTest: Iteration: ", iteration, ". Runtime: ", stop - start);
    }
    if (iteration < 25) {
      setTimeout(renderBasic, 500, iteration + 1);
    }
  }
  renderBasic(0);
}

let basicAnimation = function() {
  let animatedScene = new Scene("animationTest");

  animatedScene.setWidth(60);
  animatedScene.setHeight(10);

  let sidewalk = "  " + ("=".repeat(56)) + "  \n  " + ("=".repeat(56)) + "  "
    + ("\n".repeat(5)) + ("=".repeat(60)) + "\n" + ("=".repeat(60));

  let sidewalkLayer = new FrameLayer(sidewalk);
  let sidewalkFrame = new Frame([sidewalkLayer]);
  let sidewalkAnimation = new Animation({"sidewalk": sidewalkFrame}, "sidewalk");

  let sidkewalkId = animatedScene.addAnimation(new Set(["sidewalk"]), sidewalkAnimation);
  animatedScene.orderDrawing(["sidewalk"], 20);
  animatedScene.shiftDrawing(["sidewalk"], {x: 0, y: 2})

  //createFrameLayerFromFile("Assets/car.txt");

  let carBaseString ="\
  __________\n\
 /..........\\\n\
/............\\\n\
|..............======\n\
|__nn___________nn__C|\n\
   UU           UU";

  let carFrontWindowString = "\
|   \\\n\
|____\\\n";

  let carFrames = {};
  let carFrameIterations = [];
  for (let i = 0; i < 30; i ++ ) {
    let carFrameLayer = new FrameLayer(carBaseString, {
      coords: {x: 3 * i, y: 0},
      formatting: {backgroundColor: "blue", textColor: "white"},
      settings: {setAsBlank: "."}
    });
    let carFrontWindowLayer = new FrameLayer(carFrontWindowString, {
      coords: {x: 3 * i + 8, y: 1},
      formatting: {backgroundColor: "#666666", textColor: "white"},
      settings: {spaceHasFormatting: true}
    });
    let carFrame = new Frame([carFrameLayer, carFrontWindowLayer]);

    carFrames[i.toString()] = carFrame;
  }

  let carAnimation = new Animation(carFrames);
  animatedScene.addAnimation("car", carAnimation);
  animatedScene.shiftDrawing("car", {x: -18, y: 2});
  
  animatedScene.addAnimation("car2", carAnimation);
  animatedScene.shiftDrawing("car2", {x: 30, y: 0});
  animatedScene.orderDrawing("car2", 10);

  // Defined here because at time of writing, a good rendering implementation had not been written yet.
  let renderBasic = function(iteration) {
    let start = performance.now();
    animatedScene.render();
    let stop = performance.now();
    if (LOG_PERFORMANCE) {
      console.log("AnimationTest: Iteration: ", iteration, ". Runtime: ", stop - start);
    }
    animatedScene.iterateAnimation("car", (iteration % 30).toString());
    if (iteration < 60) {
      setTimeout(renderBasic, 100, iteration + 1);
    }
  }
  animatedScene.render();
  renderBasic(0);
}

let prioritiesTest = function() {
  let testPriorities = new Scene("priorities");

  testPriorities.setWidth(40);
  testPriorities.setHeight(10);

  let hiPriority = new Drawing("Both lines of this string\nshould_be_displayed...\n");
  // NOTE: Priority can be set at the Drawing level or within a Scene using the class names/id
  // NOTE: A low priority value means high priority.
  hiPriority.setPriority(10);
  let currPriority = hiPriority.getPriority(); // Should be 10
  let loPriority = new Drawing("You should not be able to see this line.\nOh no! The top line is covered!");

  let hiPriorityId = testPriorities.addDrawing(new Set(["first", "priority"]), hiPriority);
  let loPriorityId = testPriorities.addDrawing(new Set(["second", "priority"]), loPriority);

  testPriorities.orderDrawing(new Set(["second", "priority"]), 20);
  testPriorities.moveDrawing(new Set(["second", "priority"]), {x: 0, y: 1});
  // sampleProject.render();

  testPriorities.shiftDrawing(new Set(["priority"]), {x: 3, y: 2});
  testPriorities.render();
}

let basicDisplay = function() {
  let sampleProject = new Scene("firstScene");

  sampleProject.setWidth(50);
  sampleProject.setHeight(15);

  let helloText = "Hello,\nWorld!";
  let helloDrawing = new Drawing(helloText);

  let helloId = sampleProject.addDrawing(new Set(["hello"]), helloDrawing);
  sampleProject.moveDrawing(new Set(["hello"]), {x: 1, y: 1});

  let candy1 = new Drawing("I like candy");
  let candy2 = new Drawing("Me too!\n  \\\n   \\\n    \\o/\n");

  let candy1Id = sampleProject.addDrawing(["candies", "first"], candy1);
  let candy2Id = sampleProject.addDrawing("candies second", candy2);

  sampleProject.shiftDrawing(new Set(["candies"]), {x: 5, y: 5});
  sampleProject.shiftDrawing(new Set(["second"]), {x: 0, y: 2});

  let longmsg = new Drawing("Blah blah blah blah blah this is a long string that will not fit within the 50 character width of this scene\n");
  let longmsgId = sampleProject.addDrawing(new Set(["tempclass"]), longmsg);
  sampleProject.moveDrawing("tempclass", {x: -20, y: 12});

  sampleProject.render();
}
