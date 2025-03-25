document.addEventListener("DOMContentLoaded", function () {
    // Create floating home button
    let floatingHomeBtn = document.createElement("div");
    floatingHomeBtn.id = "floatingHomeButton";

    // Apply styles
    floatingHomeBtn.style.position = "fixed";
    floatingHomeBtn.style.bottom = "20px";
    floatingHomeBtn.style.left = "20px"; // Positioned on the bottom left
    floatingHomeBtn.style.width = "60px";
    floatingHomeBtn.style.height = "60px";
    floatingHomeBtn.style.borderRadius = "50%";
    floatingHomeBtn.style.display = "flex";
    floatingHomeBtn.style.justifyContent = "center";
    floatingHomeBtn.style.alignItems = "center";
    floatingHomeBtn.style.cursor = "pointer";
    floatingHomeBtn.style.background = "linear-gradient(to right, #50DBCB, #FFEF3D)";
    floatingHomeBtn.style.boxShadow = "0 4px 10px rgba(0,0,0,0.2)";
    floatingHomeBtn.style.transition = "transform 0.2s ease-in-out";
    floatingHomeBtn.style.overflow = "hidden"; // Ensures image stays within the circle

    // Create the image element
    let homeImg = document.createElement("img");
    homeImg.src = "https://iili.io/3TnQtrx.png";
    homeImg.alt = "Home Icon";
    homeImg.style.width = "70%"; // Adjusted for better fit
    homeImg.style.height = "70%";
    homeImg.style.objectFit = "contain"; // Ensures it scales nicely

    // Hover effect
    floatingHomeBtn.addEventListener("mouseover", function () {
        floatingHomeBtn.style.transform = "scale(1.1)";
    });

    floatingHomeBtn.addEventListener("mouseout", function () {
        floatingHomeBtn.style.transform = "scale(1)";
    });

    // Click event to navigate
    floatingHomeBtn.addEventListener("click", function () {
        window.location.href = "index.html";
    });

    // Append image to button
    floatingHomeBtn.appendChild(homeImg);

    // Append button to body
    document.body.appendChild(floatingHomeBtn);
});
