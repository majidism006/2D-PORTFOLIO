import { dialogueData, scaleFactor } from "./constants";
import { k } from "./kaboomCtx";
import { displayDialogue, setCamScale } from "./utils";

// Character configurations
const characterConfigs = {
  male: {
    spriteKey: "male-spritesheet",
    anims: {
      "idle-down": 1128,
      "walk-down": { from: 1128, to: 1131, loop: true, speed: 8 },
      "idle-side": 1175,
      "walk-side": { from: 1175, to: 1178, loop: true, speed: 8 },
      "idle-up": 1222,
      "walk-up": { from: 1222, to: 1225, loop: true, speed: 8 },
    }
  },
  female: {
    spriteKey: "female-spritesheet", 
    anims: {
      "idle-down": 1144,
      "walk-down": { from: 1144, to: 1147, loop: true, speed: 8 },
      "idle-side": 1191,
      "walk-side": { from: 1191, to: 1194, loop: true, speed: 8 },
      "idle-up": 1238,
      "walk-up": { from: 1238, to: 1241, loop: true, speed: 8 },
    }
  },
  cat: {
    spriteKey: "cat-spritesheet",
    anims: {
      "idle-down": 1457,
      "walk-down": { from: 1457, to: 1460, loop: true, speed: 8 },
      "idle-side": 1457,
      "walk-side": { from: 1457, to: 1460, loop: true, speed: 8 },
      "idle-up": 1457,
      "walk-up": { from: 1457, to: 1460, loop: true, speed: 8 },
    }
  }
};

// Load all character spritesheets (adjust paths as needed)
k.loadSprite("male-spritesheet", "./Untitled_Artwork.png", {
  sliceX: 47,
  sliceY: 35,
  anims: characterConfigs.male.anims
});

k.loadSprite("female-spritesheet", "./Untitled_Artwork.png", {
  sliceX: 47,
  sliceY: 35,
  anims: characterConfigs.female.anims
});

k.loadSprite("cat-spritesheet", "./Untitled_Artwork.png", {
  sliceX: 47,
  sliceY: 35,
  anims: characterConfigs.cat.anims
});

k.loadSprite("map", "./newmap.png");

k.setBackground(k.Color.fromHex("#311047"));

// Global variable to store selected character
let selectedCharacter = null;

// Welcome Scene
k.scene("welcome", () => {
  // Background
  k.add([
    k.rect(k.width(), k.height()),
    k.color(49, 16, 71),
    k.pos(0, 0)
  ]);

  // Welcome text
  const welcomeText = k.add([
    k.text("Welcome to Ismail's Website", {
      size: 48,
      font: "monospace"
    }),
    k.pos(k.center()),
    k.anchor("center"),
    k.color(255, 255, 255),
    k.scale(0)
  ]);

  // Animate welcome text
  k.tween(0, 1, 1, (val) => {
    welcomeText.scale = k.vec2(val);
  }, k.easings.easeOutBack);

  // Show character selection after 2 seconds
  k.wait(2, () => {
    showCharacterSelection();
  });
});

// Character Selection Function
function showCharacterSelection() {
  // Create overlay
  const overlay = k.add([
    k.rect(k.width(), k.height()),
    k.color(0, 0, 0),
    k.opacity(0.7),
    k.pos(0, 0),
    k.z(100)
  ]);

  // Create selection popup
  const popup = k.add([
    k.rect(600, 400),
    k.color(60, 30, 90),
    k.pos(k.center()),
    k.anchor("center"),
    k.outline(4, k.Color.WHITE),
    k.z(101)
  ]);

  // Title
  k.add([
    k.text("Select Your Character", {
      size: 32,
      font: "monospace"
    }),
    k.pos(k.center().x, k.center().y - 120),
    k.anchor("center"),
    k.color(255, 255, 255),
    k.z(102)
  ]);

  // Character buttons
  const buttonWidth = 120;
  const buttonHeight = 80;
  const buttonSpacing = 150;
  
  // Male character button
  const maleButton = k.add([
    k.rect(buttonWidth, buttonHeight),
    k.color(70, 130, 180),
    k.pos(k.center().x - buttonSpacing, k.center().y),
    k.anchor("center"),
    k.outline(2, k.Color.WHITE),
    k.area(),
    k.z(102),
    "character-button"
  ]);

  k.add([
    k.text("Male", {
      size: 16,
      font: "monospace"
    }),
    k.pos(k.center().x - buttonSpacing, k.center().y - 10),
    k.anchor("center"),
    k.color(255, 255, 255),
    k.z(103)
  ]);

  // Female character button
  const femaleButton = k.add([
    k.rect(buttonWidth, buttonHeight),
    k.color(220, 20, 60),
    k.pos(k.center().x, k.center().y),
    k.anchor("center"),
    k.outline(2, k.Color.WHITE),
    k.area(),
    k.z(102),
    "character-button"
  ]);

  k.add([
    k.text("Female", {
      size: 16,
      font: "monospace"
    }),
    k.pos(k.center().x, k.center().y - 10),
    k.anchor("center"),
    k.color(255, 255, 255),
    k.z(103)
  ]);

  // Cat character button
  const catButton = k.add([
    k.rect(buttonWidth, buttonHeight),
    k.color(255, 140, 0),
    k.pos(k.center().x + buttonSpacing, k.center().y),
    k.anchor("center"),
    k.outline(2, k.Color.WHITE),
    k.area(),
    k.z(102),
    "character-button"
  ]);

  k.add([
    k.text("Cat", {
      size: 16,
      font: "monospace"
    }),
    k.pos(k.center().x + buttonSpacing, k.center().y - 10),
    k.anchor("center"),
    k.color(255, 255, 255),
    k.z(103)
  ]);

  // Button hover effects
  function addHoverEffect(button) {
    button.onHoverUpdate(() => {
      button.scale = k.vec2(1.1);
    });
    
    button.onHoverEnd(() => {
      button.scale = k.vec2(1);
    });
  }

  addHoverEffect(maleButton);
  addHoverEffect(femaleButton);
  addHoverEffect(catButton);

  // Button click handlers
  maleButton.onClick(() => {
    selectedCharacter = "male";
    k.go("main");
  });

  femaleButton.onClick(() => {
    selectedCharacter = "female";
    k.go("main");
  });

  catButton.onClick(() => {
    selectedCharacter = "cat";
    k.go("main");
  });
}

// Main game scene
k.scene("main", async () => {
  // If no character selected, go back to welcome
  if (!selectedCharacter) {
    k.go("welcome");
    return;
  }

  const mapData = await (await fetch("./newmap.json")).json();
  const layers = mapData.layers;

  const map = k.add([k.sprite("map"), k.pos(0), k.scale(scaleFactor)]);

  // Create player with selected character
  const characterConfig = characterConfigs[selectedCharacter];
  const player = k.make([
    k.sprite(characterConfig.spriteKey, { anim: "idle-down" }),
    k.area({
      shape: new k.Rect(k.vec2(0, 3), 10, 10),
    }),
    k.body(),
    k.anchor("center"),
    k.pos(),
    k.scale(scaleFactor),
    {
      speed: 250,
      direction: "down",
      isInDialogue: false,
      characterType: selectedCharacter
    },
    "player",
  ]);

  for (const layer of layers) {
    if (layer.name === "boundaries") {
      for (const boundary of layer.objects) {
        map.add([
          k.area({
            shape: new k.Rect(k.vec2(0), boundary.width, boundary.height),
          }),
          k.body({ isStatic: true }),
          k.pos(boundary.x, boundary.y),
          boundary.name,
        ]);

        if (boundary.name) {
          player.onCollide(boundary.name, () => {
            player.isInDialogue = true;
            displayDialogue(
              dialogueData[boundary.name],
              () => (player.isInDialogue = false)
            );
          });
        }
      }

      continue;
    }

    if (layer.name === "spawnpoints") {
      for (const entity of layer.objects) {
        if (entity.name === "player") {
          player.pos = k.vec2(
            (map.pos.x + entity.x) * scaleFactor,
            (map.pos.y + entity.y) * scaleFactor
          );
          k.add(player);
          continue;
        }
      }
    }
  }

  setCamScale(k);

  k.onResize(() => {
    setCamScale(k);
  });

  k.onUpdate(() => {
    k.camPos(player.worldPos().x, player.worldPos().y - 100);
  });

  k.onMouseDown((mouseBtn) => {
    if (mouseBtn !== "left" || player.isInDialogue) return;

    const worldMousePos = k.toWorld(k.mousePos());
    player.moveTo(worldMousePos, player.speed);

    const mouseAngle = player.pos.angle(worldMousePos);

    const lowerBound = 50;
    const upperBound = 125;

    if (
      mouseAngle > lowerBound &&
      mouseAngle < upperBound &&
      player.curAnim() !== "walk-up"
    ) {
      player.play("walk-up");
      player.direction = "up";
      return;
    }

    if (
      mouseAngle < -lowerBound &&
      mouseAngle > -upperBound &&
      player.curAnim() !== "walk-down"
    ) {
      player.play("walk-down");
      player.direction = "down";
      return;
    }

    if (Math.abs(mouseAngle) > upperBound) {
      player.flipX = false;
      if (player.curAnim() !== "walk-side") player.play("walk-side");
      player.direction = "right";
      return;
    }

    if (Math.abs(mouseAngle) < lowerBound) {
      player.flipX = true;
      if (player.curAnim() !== "walk-side") player.play("walk-side");
      player.direction = "left";
      return;
    }
  });

  function stopAnims() {
    if (player.direction === "down") {
      player.play("idle-down");
      return;
    }
    if (player.direction === "up") {
      player.play("idle-up");
      return;
    }

    player.play("idle-side");
  }

  k.onMouseRelease(stopAnims);

  k.onKeyRelease(() => {
    stopAnims();
  });

  k.onKeyDown((key) => {
    const keyMap = [
      k.isKeyDown("right"),
      k.isKeyDown("left"),
      k.isKeyDown("up"),
      k.isKeyDown("down"),
    ];

    let nbOfKeyPressed = 0;
    for (const key of keyMap) {
      if (key) {
        nbOfKeyPressed++;
      }
    }

    if (nbOfKeyPressed > 1) return;

    if (player.isInDialogue) return;
    if (keyMap[0]) {
      player.flipX = false;
      if (player.curAnim() !== "walk-side") player.play("walk-side");
      player.direction = "right";
      player.move(player.speed, 0);
      return;
    }

    if (keyMap[1]) {
      player.flipX = true;
      if (player.curAnim() !== "walk-side") player.play("walk-side");
      player.direction = "left";
      player.move(-player.speed, 0);
      return;
    }

    if (keyMap[2]) {
      if (player.curAnim() !== "walk-up") player.play("walk-up");
      player.direction = "up";
      player.move(0, -player.speed);
      return;
    }

    if (keyMap[3]) {
      if (player.curAnim() !== "walk-down") player.play("walk-down");
      player.direction = "down";
      player.move(0, player.speed);
    }
  });

  // Add character change button (press C to change character)
  k.onKeyPress("c", () => {
    if (!player.isInDialogue) {
      k.go("welcome");
    }
  });
});

// Start with welcome scene
k.go("welcome");