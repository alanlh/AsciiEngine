import minesweeper from "./minesweeper/minesweeper.js";

window.onload = function() {
  minesweeper();
  hello();
}

function hello() {
  const gl = new AsciiEngine.GL.Instance("hello");
  gl.init(100, 20);

  gl.setBackgroundStyle("backgroundColor", "#87ceeb");
  
  const hello = new AsciiEngine.GL.Sprite(`
    ...  ...
 .............
..Hello,World!..
 .............
    ..   ...`, {
    setAsBlank: ".",
    spaceIsTransparent: true,
    ignoreLeadingSpaces: true,
  });
  
  const ground = new AsciiEngine.GL.Sprite((".s".repeat(80) + "\n").repeat(10), {
    setAsBlank: "s.",
    ignoreLeadingSpaces: false,
    spaceIsTransparent: false,
  });
  
  const sun = new AsciiEngine.GL.Sprite(`
    .      . 
  .          .
 .            .
 .            .
 .            .
  .          .
    .      .
`, {
    setAsBlank: ".",
    spaceIsTransparent: false,
    ignoreLeadingSpaces: true,
  });
  
  let fences = [
    new AsciiEngine.GL.Sprite(`
    ..
   .  .
... |  ...
  .    .
  .  | .
  . |  .
`, {
      setAsBlank: ".",
      spaceIsTransparent: false,
      ignoreLeadingSpaces: true,
    }), 
    new AsciiEngine.GL.Sprite(`
    ..
   .  .
...    ...
  .    .
  .|   .
  .    .
`, {
      setAsBlank: ".",
      spaceIsTransparent: false,
      ignoreLeadingSpaces: true,
    }), 
    new AsciiEngine.GL.Sprite(`
    ..
   .  .
...|   ...
  .   |.
  .   |.
  .    .
`, {
      setAsBlank: ".",
      spaceIsTransparent: false,
      ignoreLeadingSpaces: true,
    }),
  ];
  
  const cloudStyle = new AsciiEngine.GL.SpriteStyle();
  cloudStyle.setStyle("backgroundColor", "#f8f8f8");
  cloudStyle.setStyle("color", "#222222");
  
  const greenBackground = new AsciiEngine.GL.SpriteStyle();
  greenBackground.setStyle("backgroundColor", "green");
  greenBackground.fillRemainder();
  
  const yellow = new AsciiEngine.GL.SpriteStyle();
  yellow.setStyle("backgroundColor", "yellow");
  
  const fenceColor = new AsciiEngine.GL.SpriteStyle();
  fenceColor.setStyle("backgroundColor", "brown");
  let iteration = 0;
  function tick() {
    let start = performance.now();
  
    gl.draw(hello, [1, 1, 0], cloudStyle);
    gl.draw(ground, [-5, 12, 5], greenBackground);
    gl.draw(sun, [80, 2, 5], yellow);
    for (let i = 0; i < 12; i ++) {
      gl.draw(fences[i % 3], [10 * i - 15 + iteration % 10, 8, 3], fenceColor);
    }
    
    //console.log(performance.now() - start);
    start = performance.now();
    gl.render();
    //console.log(performance.now() - start);
    iteration ++;
  }

  window.setInterval(tick, 1000);
  
  const game = new AsciiEngine.Engine();
  
  game.update();
}
