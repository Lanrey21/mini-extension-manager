gridOverlay: (enabled) => {
  const existing = document.getElementById("grid-overlay");

  if (enabled) {
    if (existing) return; // prevent duplicates

    const overlay = document.createElement("div");
    overlay.id = "grid-overlay";

    overlay.style.position = "fixed";
    overlay.style.top = "0";
    overlay.style.left = "0";
    overlay.style.width = "100vw";
    overlay.style.height = "100vh";
    overlay.style.pointerEvents = "none";
    overlay.style.zIndex = "999999";

    overlay.style.backgroundImage = `
      linear-gradient(to right, rgba(0,0,0,0.15) 1px, transparent 1px),
      linear-gradient(to bottom, rgba(0,0,0,0.15) 1px, transparent 1px)
    `;
    overlay.style.backgroundSize = "20px 20px";

    // ✅ start invisible
    overlay.style.opacity = "0";
    overlay.style.transition = "opacity 0.25s ease";

    document.body.appendChild(overlay);

    // ✅ fade in (next frame so transition works)
    requestAnimationFrame(() => {
      overlay.style.opacity = "0.6";
    });

  } else {
    if (!existing) return;

    // ✅ fade out
    existing.style.opacity = "0";

    // ✅ remove after animation finishes
    setTimeout(() => {
      existing.remove();
    }, 250);
  }
},