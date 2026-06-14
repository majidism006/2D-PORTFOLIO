import { playOpenSound, playCloseSound } from "./music";

export function displayDialogue(text, onDisplayEnd) {
  const dialogueUI = document.getElementById("textbox-container");
  const dialogue = document.getElementById("dialogue");
  const textbox = document.getElementById("textbox");

  dialogueUI.style.display = "block";
  playOpenSound();
  let index = 0;
  let currentText = "";
  const intervalRef = setInterval(() => {
    if (index < text.length) {
      currentText += text[index];
      dialogue.innerHTML = currentText;
      index++;
      return;
    }

    clearInterval(intervalRef);
  }, 10);

  const closeBtn = document.getElementById("close");

  let closed = false;
  function close() {
    if (closed) return;
    closed = true;
    playCloseSound();
    onDisplayEnd();
    dialogueUI.style.display = "none";
    dialogue.innerHTML = "";
    clearInterval(intervalRef);
    closeBtn.removeEventListener("click", close);
    removeEventListener("keydown", onKeyDown);
    removeEventListener("mousedown", onOutsideClick);
  }

  const walkKeys = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"];
  function onKeyDown(key) {
    if (key.code === "Enter") {
      close();
      return;
    }
    // Arrow keys mean the user wants to walk around, not read — close it.
    // Ignore auto-repeat so holding a key into an object doesn't insta-close.
    if (!key.repeat && walkKeys.includes(key.code)) {
      close();
    }
  }

  function onOutsideClick(e) {
    // Let clicks inside the textbox through so links and the button still work.
    if (textbox.contains(e.target)) return;
    close();
  }

  closeBtn.addEventListener("click", close);
  addEventListener("keydown", onKeyDown);

  // Defer attaching the click listener so the very click/tap that triggered
  // this dialogue doesn't immediately close it.
  setTimeout(() => {
    if (!closed) addEventListener("mousedown", onOutsideClick);
  }, 0);
}

export let currentCamScale = 1;

export function setCamScale(k) {
  const resizeFactor = k.width() / k.height();
  if (resizeFactor < 1) {
    currentCamScale = 0.8;
    k.camScale(k.vec2(currentCamScale));
  } else {
    currentCamScale = 1.3;
    k.camScale(k.vec2(currentCamScale));
  }
}
