document.addEventListener("DOMContentLoaded", () => {
  const noticeStatus = "enabled";

  if (noticeStatus !== "enabled") return;

  const style = document.createElement("style");
  style.textContent = `
    .notice-box {
      position: fixed;
      top: 20px;
      right: 20px;
      width: 280px;
      background: rgba(20, 20, 30, 0.95);
      border-radius: 8px;
      padding: 12px;
      font-family: "Segoe UI", Arial, sans-serif;
      color: #fff;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
      border-left: 4px solid #ffd000;
      z-index: 9999;
    }

    .notice-box-header {
      font-weight: bold;
      font-size: 14px;
      color: #ffd000;
      margin-bottom: 10px;
      display: flex;
      align-items: center;
      gap: 6px;
      position: relative;
      padding-bottom: 6px;
    }

    /* faint glowing divider */
    .notice-box-header::after {
      content: "";
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      height: 1px;
      background: rgba(255, 255, 255, 0.4);
      box-shadow: 0 0 6px rgba(255, 255, 255, 0.5);
    }

    .notice-box-body {
      font-size: 13px;
      line-height: 1.4;
      color: #dcdcdc;
    }
  `;
  document.head.appendChild(style);

  // Create box
  const box = document.createElement("div");
  box.className = "notice-box";
  box.innerHTML = `
    <div class="notice-box-header"><strong>⚠ ONGOING UPDATES</strong></div>
    <div class="notice-box-body">
      Throughout September you will notice numerous changes across the Vocadecks site, 
      such as updated graphic designs, and services to make the game more playable and interactive.
    </div>
  `;

  // Add to page
  document.body.appendChild(box);
});
