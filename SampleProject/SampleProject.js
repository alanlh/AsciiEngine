let sampleProject;
let helloDrawing;
let candy1, candy2;
let longmsg;

let prioritiesTest;
let hiPriority, loPriority;

window.onload = function() {
  basicDisplay();
  testPriorities();
}

let basicDisplay = function() {
  sampleProject = new Scene("firstScene");

  sampleProject.setWidth(50);
  sampleProject.setHeight(15);

  helloText = "Hello,\nWorld!";
  helloDrawing = new Drawing(helloText);

  let helloId = sampleProject.addDrawing(new Set(["hello"]), helloDrawing);
  sampleProject.moveDrawing(new Set(["hello"]), {x: 1, y: 1});

  candy1 = new Drawing("I like candy");
  candy2 = new Drawing("Me too!\n  \\\n   \\\n    \\o/\n");

  let candy1Id = sampleProject.addDrawing(new Set(["candies", "first"]), candy1);
  let candy2Id = sampleProject.addDrawing(new Set(["candies", "second"]), candy2);

  sampleProject.shiftDrawing(new Set(["candies"]), {x: 5, y: 5});
  sampleProject.shiftDrawing(new Set(["second"]), {x: -2, y: 2});

  longmsg = new Drawing("Blah blah blah blah blah this is a long string that will not fit within the 50 character width of this scene\n");
  let longmsgId = sampleProject.addDrawing(new Set(["tempclass"]), longmsg);
  sampleProject.moveDrawing(new Set(["tempclass"]), {x: -20, y: 12});

  sampleProject.render();
}

let testPriorities = function() {
  testPriorities = new Scene("priorities");

  testPriorities.setWidth(40);
  testPriorities.setHeight(10);

  hiPriority = new Drawing("Both lines of this string\nshould be displayed...");
  // NOTE: Priority can be set at the Drawing level or within a Scene using the class names/id
  // NOTE: A low priority value means high priority.
  hiPriority.setPriority(10);
  let currPriority = hiPriority.getPriority(); // Should be 10
  loPriority = new Drawing("You should not be able to see this line.\nOh no! The top line is covered!");

  let hiPriorityId = testPriorities.addDrawing(new Set(["first", "priority"]), hiPriority);
  let loPriorityId = testPriorities.addDrawing(new Set(["second", "priority"]), loPriority);

  testPriorities.orderDrawing(new Set(["second", "priority"]), 20);
  testPriorities.moveDrawing(new Set(["second", "priority"]), {x: 0, y: 1});
  // sampleProject.render();

  testPriorities.shiftDrawing(new Set(["priority"]), {x: 3, y: 2});
  testPriorities.render();
}
