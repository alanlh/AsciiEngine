let sampleProject;
let helloDrawing;
let candy1, candy2;
let longmsg;

window.onload = function() {
  sampleProject = new Scene("firstScene");

  sampleProject.setWidth(50);
  sampleProject.setHeight(20);

  helloText = "Hello,\nWorld!";
  helloDrawing = new Drawing(helloText);

  let helloId = sampleProject.addDrawing(new Set(["hello"]), helloDrawing);
  sampleProject.moveDrawing(new Set(["hello"]), {x: 1, y: 1});

  candy1 = new Drawing("I like candy");
  candy2 = new Drawing("Me too!\n  \\    \n   \\   \n    \\o/\n");

  let candy1Id = sampleProject.addDrawing(new Set(["candies", "first"]), candy1);
  let candy2Id = sampleProject.addDrawing(new Set(["candies", "second"]), candy2);

  sampleProject.shiftDrawing(new Set(["candies"]), {x: 5, y: 5});
  sampleProject.shiftDrawing(new Set(["second"]), {x: -2, y: 2});

  longmsg = new Drawing("Blah blah blah blah blah this is a long string that will not fit within the 50 character width of this scene\n");
  let longmsgId = sampleProject.addDrawing(new Set(["tempclass"]), longmsg);
  sampleProject.moveDrawing(new Set(["tempclass"]), {x: -20, y: 15});

  sampleProject.render();
}
