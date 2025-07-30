document.addEventListener("DOMContentLoaded", () => {
  // --- CONFIGURATION ---
  const buttonImagePath = "./Assets/FULLSCREEN_BUTtON.png";
  const fontURL = "./Fonts/Panton.otf";

  // --- LOAD FONT ---
  const fontFace = new FontFace("Panton", `url(${fontURL})`);
  fontFace.load().then((loadedFace) => {
    document.fonts.add(loadedFace);
  });

  // --- CREATE FULLSCREEN BUTTON ---
  const fullscreenBtn = document.createElement("button");
  fullscreenBtn.id = "fullscreenBtn";
  fullscreenBtn.style.position = "fixed";
  fullscreenBtn.style.top = "50%";
  fullscreenBtn.style.left = "50%";
  fullscreenBtn.style.transform = "translate(-50%, -50%)";
  fullscreenBtn.style.backgroundColor = "transparent";
  fullscreenBtn.style.border = "none";
  fullscreenBtn.style.cursor = "pointer";
  fullscreenBtn.style.zIndex = "10000";
  fullscreenBtn.style.padding = "0";
  fullscreenBtn.style.width = "auto";
  fullscreenBtn.style.height = "auto";
  fullscreenBtn.style.display = "none";

  const btnImg = document.createElement("img");
  btnImg.src = buttonImagePath;
  btnImg.style.width = "400px";
  btnImg.style.maxWidth = "90vw";
  btnImg.style.maxHeight = "90vh";
  btnImg.style.height = "auto";
  btnImg.style.transition =
    "transform 0.3s ease-in-out, filter 0.3s ease-in-out";

  fullscreenBtn.appendChild(btnImg);
  document.body.appendChild(fullscreenBtn);

  fullscreenBtn.addEventListener("mouseenter", () => {
    btnImg.style.transform = "scale(1.05)";
    btnImg.style.filter = "invert(1)";
  });

  fullscreenBtn.addEventListener("mouseleave", () => {
    btnImg.style.transform = "scale(1)";
    btnImg.style.filter = "none";
  });

  // --- CREATE BLUR OVERLAY ---
  const blurOverlay = document.createElement("div");
  blurOverlay.style.position = "fixed";
  blurOverlay.style.top = "0";
  blurOverlay.style.left = "0";
  blurOverlay.style.width = "100vw";
  blurOverlay.style.height = "100vh";
  blurOverlay.style.background = "transparent";
  blurOverlay.style.opacity = "0.85";
  blurOverlay.style.backdropFilter = "blur(8px)";
  blurOverlay.style.zIndex = "9998";
  blurOverlay.style.display = "none";
  blurOverlay.style.pointerEvents = "none";
  document.body.appendChild(blurOverlay);

  function isFullScreen() {
    return (
      document.fullscreenElement ||
      document.webkitFullscreenElement ||
      document.mozFullScreenElement ||
      document.msFullscreenElement
    );
  }

  function setInteractable(interactable) {
    if (interactable) {
      blurOverlay.style.display = "none";
      blurOverlay.style.pointerEvents = "none";
    } else {
      blurOverlay.style.display = "block";
      blurOverlay.style.pointerEvents = "auto";
    }
  }

  function checkFullscreenStatus() {
    if (!isFullScreen()) {
      fullscreenBtn.style.display = "block";
      setInteractable(false);
    } else {
      fullscreenBtn.style.display = "none";
      setInteractable(true);
    }
  }

  fullscreenBtn.addEventListener("click", () => {
    const docElm = document.documentElement;
    if (docElm.requestFullscreen) {
      docElm.requestFullscreen();
    } else if (docElm.mozRequestFullScreen) {
      docElm.mozRequestFullScreen();
    } else if (docElm.webkitRequestFullscreen) {
      docElm.webkitRequestFullscreen();
    } else if (docElm.msRequestFullscreen) {
      docElm.msRequestFullscreen();
    }
  });

  document.addEventListener("fullscreenchange", checkFullscreenStatus);
  document.addEventListener("webkitfullscreenchange", checkFullscreenStatus);
  document.addEventListener("mozfullscreenchange", checkFullscreenStatus);
  document.addEventListener("MSFullscreenChange", checkFullscreenStatus);

  // Initial check
  checkFullscreenStatus();
});
