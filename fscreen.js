// FScreen.js

// Function to request full screen for the entire document
function requestFullScreen() {
    if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen();
    } else if (document.documentElement.mozRequestFullScreen) { // Firefox
        document.documentElement.mozRequestFullScreen();
    } else if (document.documentElement.webkitRequestFullscreen) { // Chrome, Safari and Opera
        document.documentElement.webkitRequestFullscreen();
    } else if (document.documentElement.msRequestFullscreen) { // IE/Edge
        document.documentElement.msRequestFullscreen();
    }
}

// Function to exit full screen mode
function exitFullScreen() {
    if (document.exitFullscreen) {
        document.exitFullscreen();
    } else if (document.mozCancelFullScreen) { // Firefox
        document.mozCancelFullScreen();
    } else if (document.webkitExitFullscreen) { // Chrome, Safari and Opera
        document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) { // IE/Edge
        document.msExitFullscreen();
    }
}

// Toggle fullscreen without using localStorage
function toggleFullScreen() {
    if (!document.fullscreenElement &&
        !document.mozFullScreenElement &&
        !document.webkitFullscreenElement &&
        !document.msFullscreenElement) {
        requestFullScreen();
        fullscreenIcon.textContent = "Exit Fullscreen";
    } else {
        exitFullScreen();
        fullscreenIcon.textContent = "Go Fullscreen";
    }
}

// Create a fullscreen icon in the top left
function createFullscreenIcon() {
    const icon = document.createElement("div");
    icon.id = "fullscreen-icon";
    icon.textContent = "Go Fullscreen"; // default text
    icon.style.position = "fixed";
    icon.style.top = "10px";
    icon.style.left = "10px";
    icon.style.padding = "10px 15px";
    icon.style.backgroundColor = "#50dbcb";
    icon.style.color = "black";
    icon.style.fontSize = "16px";
    icon.style.fontWeight = "bold";
    icon.style.borderRadius = "5px";
    icon.style.cursor = "pointer";
    icon.style.zIndex = "10000";
    icon.style.transition = "background-color 0.3s ease";
    icon.addEventListener("mouseover", () => {
        icon.style.backgroundColor = "#ffef3d";
    });
    icon.addEventListener("mouseout", () => {
        icon.style.backgroundColor = "#50dbcb";
    });
    icon.addEventListener("click", toggleFullScreen);
    document.body.appendChild(icon);
    return icon;
}

// Update the fullscreen icon text based on current state
function updateFullscreenIcon() {
    if (document.fullscreenElement ||
        document.mozFullScreenElement ||
        document.webkitFullscreenElement ||
        document.msFullscreenElement) {
        fullscreenIcon.textContent = "Exit Fullscreen";
    } else {
        fullscreenIcon.textContent = "Go Fullscreen";
    }
}

// Listen for fullscreen change events to update the icon text
document.addEventListener("fullscreenchange", updateFullscreenIcon);
document.addEventListener("mozfullscreenchange", updateFullscreenIcon);
document.addEventListener("webkitfullscreenchange", updateFullscreenIcon);
document.addEventListener("msfullscreenchange", updateFullscreenIcon);

// On DOMContentLoaded, create the icon and always default to "Go Fullscreen"
document.addEventListener("DOMContentLoaded", () => {
    window.fullscreenIcon = createFullscreenIcon();
});
