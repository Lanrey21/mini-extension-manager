// ------------------------------
// 1️⃣ Extensions Array
// ------------------------------
const extensions = [
  { name: "DevLens", img: "./assets/images/logo-devlens.svg", active: false, btnClass: "btn-1", toggle: "checkbox" },
  { name: "SpeedBoost", img: "./assets/images/logo-speed-boost.svg", active: false, btnClass: "btn-2", toggle: "checkbox" },
  { name: "StyleSpy", img: "./assets/images/logo-style-spy.svg", active: true, btnClass: "btn-3", toggle: "switch" },
  { name: "JSONWizard", img: "./assets/images/logo-json-wizard.svg", active: false, btnClass: "btn-1", toggle: "checkbox" },
  { name: "TabMaster Pro", img: "./assets/images/logo-tab-master-pro.svg", active: false, btnClass: "btn-2", toggle: "checkbox" },
  { name: "ViewportBuddy", img: "./assets/images/logo-viewport-buddy.svg", active: true, btnClass: "btn-3", toggle: "switch" },
  { name: "Markup Notes", img: "./assets/images/logo-markup-notes.svg", active: false, btnClass: "btn-1", toggle: "checkbox" },
  { name: "GridGuides", img: "./assets/images/logo-grid-guides.svg", active: true, btnClass: "btn-2", toggle: "switch" },
  { name: "Palette Picker", img: "./assets/images/logo-palette-picker.svg", active: false, btnClass: "btn-3", toggle: "checkbox" },
  { name: "LinkChecker", img: "./assets/images/logo-link-checker.svg", active: true, btnClass: "btn-1", toggle: "switch" },
  { name: "DOM Snapshot", img: "./assets/images/logo-dom-snapshot.svg", active: false, btnClass: "btn-2", toggle: "checkbox" },
  { name: "ConsolePlus", img: "./assets/images/logo-console-plus.svg", active: false, btnClass: "btn-3", toggle: "checkbox" }
];

// ------------------------------
// 2️⃣ Tools (Extension Mapping)
// ------------------------------
const tools = {
  "GridGuides": { action: "gridOverlay" },
  "LinkChecker": { action: "highlightLinks" },
  "DOM Snapshot": { action: "domSnapshot" }
};

// ------------------------------
// 3️⃣ State
// ------------------------------
let savedToggleStates = {};
let removedExtensions = [];

// ------------------------------
// 4️⃣ INIT
// ------------------------------
document.addEventListener("DOMContentLoaded", init);

function init() {
  const container = document.getElementById("cards-container");
  const allBtn = document.querySelector(".fb");
  const activeBtn = document.querySelector(".sb");
  const inactiveBtn = document.querySelector(".tb");
  const themeToggle = document.querySelector(".fim");

  if (!container) return;

  // Load saved state
  savedToggleStates = JSON.parse(localStorage.getItem("toggles")) || {};
  removedExtensions = JSON.parse(localStorage.getItem("removed")) || [];
  const savedTheme = localStorage.getItem("theme");

  if (savedTheme === "light") {
    document.body.classList.add("light-mode");
  }

  renderExtensions(container);
  setupEvents();
  setupFilters(allBtn, activeBtn, inactiveBtn, [allBtn, activeBtn, inactiveBtn]);
  setupTheme(themeToggle);

  applyActiveExtensions();

  const resetBtn = document.getElementById("reset-btn");

if (resetBtn) {
  resetBtn.addEventListener("click", () => {
    const confirmReset = confirm("Reset all extensions?");

    if (!confirmReset) return;

    localStorage.clear();
    location.reload();
  });
}
}

// ------------------------------
// 5️⃣ RENDER
// ------------------------------
function renderExtensions(container) {
  container.innerHTML = "";

  extensions.forEach((ext, index) => {
    if (removedExtensions.includes(ext.name)) return;

    const isActive = savedToggleStates[ext.name] ?? ext.active;

    const card = document.createElement("div");
    card.classList.add("mm");
    if (isActive) card.classList.add("active");

    const toggleHTML =
      ext.toggle === "switch"
        ? `<label class="switch">
             <input type="checkbox" ${isActive ? "checked" : ""}>
             <span class="slider"></span>
           </label>`
        : `<div class="checkbox-con">
             <input type="checkbox" ${isActive ? "checked" : ""}>
           </div>`;

    card.innerHTML = `
      <img src="${ext.img}" alt="${ext.name}">
      <p>
        <span class="highlight">${ext.name}</span><br>
        <span class="subtext">Quickly inspect page layout</span>
      </p>
      <button class="remove-btn ${ext.btnClass}">Remove</button>
      ${toggleHTML}
    `;
    card.style.animationDelay = `${index * 0.08}s`;

    container.appendChild(card);
  });
}

// ------------------------------
// 6️⃣ EVENTS
// ------------------------------
function setupEvents() {

  // Toggle
  document.addEventListener("change", (e) => {
    if (e.target.type === "checkbox") {
      const card = e.target.closest(".mm");
      if (!card) return;

      const name = card.querySelector(".highlight").innerText.trim();
      const enabled = e.target.checked;

      card.classList.toggle("active", enabled);
      savedToggleStates[name] = enabled;

      localStorage.setItem("toggles", JSON.stringify(savedToggleStates));

      // Extension trigger
      triggerExtensionEffect(name, enabled);
    }
  });

  // Remove
  document.addEventListener("click", (e) => {
    if (e.target.classList.contains("remove-btn")) {
      const card = e.target.closest(".mm");
      if (!card) return;

      const name = card.querySelector(".highlight").innerText.trim();

      removedExtensions.push(name);
      localStorage.setItem("removed", JSON.stringify(removedExtensions));

      card.remove();
    }
  });
}

// ------------------------------
// 7️⃣ FILTERS
// ------------------------------
function setupFilters(allBtn, activeBtn, inactiveBtn, filterButtons) {

  function setActiveFilter(activeButton) {
    filterButtons.forEach(btn => btn.classList.remove("active-filter"));
    activeButton.classList.add("active-filter");
  }

  function getCards() {
    return document.querySelectorAll(".mm");
  }

  allBtn.addEventListener("click", () => {
    setActiveFilter(allBtn);
    getCards().forEach(card => card.style.display = "grid");
  });

  activeBtn.addEventListener("click", () => {
    setActiveFilter(activeBtn);
    getCards().forEach(card => {
      card.style.display = card.classList.contains("active") ? "grid" : "none";
    });
  });

  inactiveBtn.addEventListener("click", () => {
    setActiveFilter(inactiveBtn);
    getCards().forEach(card => {
      card.style.display = !card.classList.contains("active") ? "grid" : "none";
    });
  });
}

// ------------------------------
// 8️⃣ THEME
// ------------------------------
function setupTheme(toggleBtn) {
  if (!toggleBtn) return;

  toggleBtn.addEventListener("click", () => {
    document.body.classList.toggle("light-mode");

    const isLight = document.body.classList.contains("light-mode");
    localStorage.setItem("theme", isLight ? "light" : "dark");
  });
}

// ------------------------------
// 9️⃣ EXTENSION EFFECTS
// ------------------------------
async function triggerExtensionEffect(name, enabled) {
  if (typeof chrome === "undefined" || !chrome.tabs) return;

  const [tab] = await chrome.tabs.query({
    active: true,
    currentWindow: true
  });

  if (!tab || !tab.id) return;

  const tool = tools[name];
  if (!tool) return;

  chrome.tabs.sendMessage(tab.id, {
    action: tool.action,
    enabled
  });
}

// ------------------------------
// 🔟 APPLY ACTIVE ON LOAD
// ------------------------------
function applyActiveExtensions() {
  if (typeof chrome === "undefined" || !chrome.tabs) return;

  Object.entries(savedToggleStates).forEach(([name, enabled]) => {
    if (enabled) {
      triggerExtensionEffect(name, true);
    }
  });
}