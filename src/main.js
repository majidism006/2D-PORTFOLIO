import { dialogueData, scaleFactor } from "./constants";
import { k } from "./kaboomCtx";
import { displayDialogue, setCamScale } from "./utils";
import { currentCamScale } from "./utils";

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

k.setBackground(k.Color.fromHex("#000000"));

// Global variable to store selected character
let selectedCharacter = null;

// Welcome Scene
k.scene("welcome", () => {
  // Background
  k.add([
    k.rect(k.width(), k.height()),
    k.color(0, 0, 0),
    k.pos(0, 0)
  ]);

  // Typewriter effect for welcome text
  const fullText = "Welcome to Ismail's Website";
  let currentText = "";
  let charIndex = 0;

  const welcomeText = k.add([
    k.text("", {
      size: 48,
      font: "monogram"
    }),
    k.pos(k.center()),
    k.anchor("center"),
    k.color(255, 255, 255)
  ]);

  // Cursor for typewriter effect
  const cursor = k.add([
    k.text("|", {
      size: 48,
      font: "monogram",
    }),
    k.pos(k.center().x, k.center().y),
    k.anchor("left"),
    k.color(255, 255, 255)
  ]);

  // Blinking cursor animation
  let cursorVisible = true;
  k.loop(0.5, () => {
    cursor.opacity = cursorVisible ? 1 : 0;
    cursorVisible = !cursorVisible;
  });

  // Typewriter animation
  const typewriterLoop = k.loop(0.04, () => {
    if (charIndex < fullText.length) {
      currentText += fullText[charIndex];
      welcomeText.text = currentText;
      
      // Update cursor position
      const textWidth = welcomeText.width;
      cursor.pos.x = k.center().x + textWidth / 2;
      
      charIndex++;
    } else {
      typewriterLoop.cancel();
      // Show character selection after typing is complete + 2 seconds
      k.wait(2, () => {
        welcomeText.destroy();
        cursor.destroy();
        showCharacterSelection();
      });
    }
  });
});


// Character Selection Function
function showCharacterSelection() {
  const characters = ["male", "female", "cat"];
  const spacing = 200;
  const startX = k.center().x - spacing;

  k.add([
    k.text("Choose Your Character", {
      size: 52,
      font: "monogram",
    }),
    k.pos(k.center().x, k.center().y - 180),
    k.anchor("center"),
    k.color(255, 255, 255),
    k.z(100),
  ]);

  characters.forEach((char, index) => {
    const config = characterConfigs[char];

    // Character sprite with idle animation
    const preview = k.add([
      k.sprite(config.spriteKey, { anim: "walk-down" }),
      k.pos(startX + index * spacing, k.center().y),
      k.anchor("center"),
      k.scale(scaleFactor * 2),
      k.area(),
      k.z(100),
      "character-select",
      { char },
    ]);

    preview.onClick(() => {
      selectedCharacter = char;
      k.go("main");
    });

    // Hover bounce effect
    preview.onHoverUpdate(() => {
      preview.scale = k.vec2(scaleFactor * 2.2);
    });
    preview.onHoverEnd(() => {
      preview.scale = k.vec2(scaleFactor * 2);
    });
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
  const mapWidth = map.width * scaleFactor;
  const mapHeight = map.height * scaleFactor;


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
    const screenW = k.width() / currentCamScale;
    const screenH = k.height() / currentCamScale;

    const playerX = player.worldPos().x;
    const playerY = player.worldPos().y - 100;

    const minCamX = screenW / 2;
    const maxCamX = mapWidth - screenW / 2;
    const minCamY = screenH / 2;
    const maxCamY = mapHeight - screenH / 2;

    const camX = k.clamp(playerX, minCamX, maxCamX);
    const camY = k.clamp(playerY, minCamY, maxCamY);

    k.camPos(camX, camY);
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