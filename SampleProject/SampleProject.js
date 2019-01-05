window.onload = function() {
  basicAnimation();
  prioritiesTest();
  basicDisplay();
}

let basicAnimation = function() {
  let animatedScene = new Scene("animationTest");

  animatedScene.setWidth(60);
  animatedScene.setHeight(20);

  let sidewalk = "  " + ("=".repeat(56)) + "  \n  " + ("=".repeat(56)) + "  "
    + ("\n".repeat(5)) + ("=".repeat(60)) + "\n" + ("=".repeat(60));

  let sidewalkLayer = new FrameLayer(sidewalk);
  let sidewalkFrame = new Frame([sidewalkLayer]);
  let sidewalkAnimation = new Animation([sidewalkFrame], [1]);

  let sidkewalkId = animatedScene.addDrawing(new Set(["sidewalk"]), sidewalkAnimation);
  animatedScene.orderDrawing(new Set(["sidewalk"]), 20);
  animatedScene.shiftDrawing(new Set(["sidewalk"]), {x: 0, y: 10})

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

  let carFrames = [];
  let carFrameIterations = [];
  for (let i = 0; i < 24; i ++ ) {
    let carFrameLayer = new FrameLayer(carBaseString, {x: 3 * (i - 6), y: 10},
      {backgroundColor: "blue", textColor: "white"}, {setAsBlank: '.'});
    let carFrontWindowLayer = new FrameLayer(carFrontWindowString, {x: 3 * i - 10, y: 11},
      {backgroundColor: "#666666", textColor: "white"}, {spaceHasFormatting: true});
    let carFrame = new Frame([carFrameLayer, carFrontWindowLayer]);

    carFrames.push(carFrame);
    carFrameIterations.push(3 - Math.ceil(Math.abs(i / 6 - 2)));
  }

  carAnimation = new Animation(carFrames, carFrameIterations);
  animatedScene.addDrawing(new Set(["car"]), carAnimation);

  // Defined here because at time of writing, a good rendering implementation had not been written yet.
  let renderBasic = function(iteration) {
    let animationStart = performance.now();
    animatedScene.render();
    let animationStop = performance.now();
    console.log("Rendering one frame took: ", animationStop - animationStart);
    carAnimation.nextFrame();
    if (iteration < 25) {
      setTimeout(renderBasic, 100, iteration + 1);
    }
  }
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

  let candy1Id = sampleProject.addDrawing(new Set(["candies", "first"]), candy1);
  let candy2Id = sampleProject.addDrawing(new Set(["candies", "second"]), candy2);

  sampleProject.shiftDrawing(new Set(["candies"]), {x: 5, y: 5});
  sampleProject.shiftDrawing(new Set(["second"]), {x: 0, y: 2});

  let longmsg = new Drawing("Blah blah blah blah blah this is a long string that will not fit within the 50 character width of this scene\n");
  let longmsgId = sampleProject.addDrawing(new Set(["tempclass"]), longmsg);
  sampleProject.moveDrawing(new Set(["tempclass"]), {x: -20, y: 12});

  sampleProject.render();
}
