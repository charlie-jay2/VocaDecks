document.addEventListener("DOMContentLoaded", function () {
    // Create floating button
    let floatingBtn = document.createElement("div");
    floatingBtn.id = "floatingNewsletter";

    // Apply styles
    floatingBtn.style.position = "fixed";
    floatingBtn.style.bottom = "20px";
    floatingBtn.style.right = "20px";
    floatingBtn.style.width = "60px";
    floatingBtn.style.height = "60px";
    floatingBtn.style.borderRadius = "50%";
    floatingBtn.style.display = "flex";
    floatingBtn.style.justifyContent = "center";
    floatingBtn.style.alignItems = "center";
    floatingBtn.style.cursor = "pointer";
    floatingBtn.style.background = "linear-gradient(to right, #50DBCB, #FFEF3D)";
    floatingBtn.style.boxShadow = "0 4px 10px rgba(0,0,0,0.2)";
    floatingBtn.style.transition = "transform 0.2s ease-in-out";
    floatingBtn.style.overflow = "hidden"; // Ensures image stays within the circle

    // Create the image element
    let img = document.createElement("img");
    img.src = "https://iili.io/3TnPOcN.png";
    img.alt = "Newsletter Icon";
    img.style.width = "70%"; // Adjusted for better fit
    img.style.height = "70%";
    img.style.objectFit = "contain"; // Ensures it scales nicely

    // Hover effect
    floatingBtn.addEventListener("mouseover", function () {
        floatingBtn.style.transform = "scale(1.1)";
    });

    floatingBtn.addEventListener("mouseout", function () {
        floatingBtn.style.transform = "scale(1)";
    });

    // Click event to navigate
    floatingBtn.addEventListener("click", function () {
        window.location.href = "newsletter-signup.html";
    });

    // Append image to button
    floatingBtn.appendChild(img);

    // Append button to body
    document.body.appendChild(floatingBtn);
});
