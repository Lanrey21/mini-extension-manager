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

const tools = {
  StyleSpy: { action: "toggleImages" },
  GridGuides: { action: "gridOverlay" },
  LinkChecker: { action: "highlightLinks" }
};

// ------------------------------
// 2️⃣ Storage Keys
// ------------------------------
const TOGGLE_STORAGE_KEY = "extensionToggleStates";
const REMOVED_STORAGE_KEY = "removedExtensions";
const THEME_KEY = "theme";

// ------------------------------
// 3️⃣ State
// ------------------------------
let savedToggleStates = {};
let removedExtensions = [];
function updateBadge() {
  const activeCount = Object.values(savedToggleStates).filter(Boolean).length;

  chrome.action.setBadgeText({
    text: activeCount ? activeCount.toString() : ""
  });
}

// ------------------------------
// 4️⃣ Wait for DOM
// ------------------------------
document.addEventListener("DOMContentLoaded", init);

// ------------------------------
// 5️⃣ INIT
// ------------------------------
async function init() {
  const container = document.getElementById("cards-container");
  const allBtn = document.querySelector(".fb");
  const activeBtn = document.querySelector(".sb");
  const inactiveBtn = document.querySelector(".tb");
  const themeToggle = document.querySelector(".fim");

  const filterButtons = [allBtn, activeBtn, inactiveBtn];

  // Load storage
  const data = await chrome.storage.local.get([
    TOGGLE_STORAGE_KEY,
    REMOVED_STORAGE_KEY,
    THEME_KEY
  ]);

  savedToggleStates = data[TOGGLE_STORAGE_KEY] || {};
  removedExtensions = data[REMOVED_STORAGE_KEY] || [];
  updateBadge();
  // Apply theme
  if (data[THEME_KEY] === "light") {
    document.body.classList.add("light-mode");
  }

  // Render UI
  renderExtensions(container);

  // Setup features
  setupFilters(allBtn, activeBtn, inactiveBtn, filterButtons);
  setupTheme(themeToggle);
  setupEvents();

  // 🚀 NEW: Auto-apply active extensions
  applyActiveExtensions();
}

// ------------------------------
// 6️⃣ RENDER
// ------------------------------
function renderExtensions(container) {
  container.innerHTML = "";

  extensions.forEach(ext => {
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
        <span class="subtext">Quickly inspect page layout and visualize element boundaries</span>
      </p>
      <button class="remove-btn ${ext.btnClass}">Remove</button>
      ${toggleHTML}
    `;

    container.appendChild(card);
  });
}

// ------------------------------
// 7️⃣ EVENTS (UPDATED)
// ------------------------------
function setupEvents() {

  // Toggle handler
  document.addEventListener("change", async (e) => {
    if (e.target.type === "checkbox") {

      const card = e.target.closest(".mm");
      if (!card) return;

      const name = card.querySelector(".highlight").innerText.trim();
      const enabled = e.target.checked;

      // Update UI
      card.classList.toggle("active", enabled);

      // Save state
      savedToggleStates[name] = enabled;

      await chrome.storage.local.set({
        [TOGGLE_STORAGE_KEY]: savedToggleStates
      });

      updateBadge(); // 👈 ADD THIS

      // 🚀 NEW: Trigger effect on webpage
      triggerExtensionEffect(name, enabled);
    }
  });

  // Remove button
  document.addEventListener("click", async (e) => {
    if (e.target.classList.contains("remove-btn")) {

      const card = e.target.closest(".mm");
      if (!card) return;

      const name = card.querySelector(".highlight").innerText.trim();

      if (confirm(`Remove ${name}?`)) {
        removedExtensions.push(name);

        await chrome.storage.local.set({
          [REMOVED_STORAGE_KEY]: removedExtensions
        });

        delete savedToggleStates[name];
        updateBadge();
        card.remove();
      }
    }
  });
}

// ------------------------------
// 8️⃣ FILTERS
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
// 9️⃣ THEME
// ------------------------------
function setupTheme(themeToggle) {
  themeToggle.addEventListener("click", async () => {
    document.body.classList.toggle("light-mode");

    const theme = document.body.classList.contains("light-mode")
      ? "light"
      : "dark";

    await chrome.storage.local.set({
      [THEME_KEY]: theme
    });
  });
}

// ------------------------------
// 🔟 EFFECT DISPATCHER (NEW)
// ------------------------------
async function triggerExtensionEffect(name, enabled) {

  const [tab] = await chrome.tabs.query({
    active: true,
    currentWindow: true
  });

  const tool = tools[name];
  if (!tool) return;

  chrome.tabs.sendMessage(tab.id, {
    action: tool.action,
    enabled
  });

}

// ------------------------------
// 1️⃣1️⃣ AUTO APPLY (NEW)
// ------------------------------
async function applyActiveExtensions() {

  const [tab] = await chrome.tabs.query({
    active: true,
    currentWindow: true
  });

  if (!tab || !tab.id) return;

  Object.entries(savedToggleStates).forEach(([name, enabled]) => {
    if (enabled) {
      triggerExtensionEffect(name, true);
    }
  });

}