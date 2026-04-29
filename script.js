// ------------------------------
// 3️⃣ State
// ------------------------------
let savedToggleStates = {};
let removedExtensions = [];

function updateBadge() {
  const activeCount = Object.values(savedToggleStates).filter(Boolean).length;

  if (typeof chrome !== "undefined" && chrome.action) {
    chrome.action.setBadgeText({
      text: activeCount ? activeCount.toString() : ""
    });
  }
}

// ------------------------------
// 5️⃣ INIT
// ------------------------------
async function init() {
  const container = document.getElementById("cards-container");

  if (!container) {
    console.error("Container not found");
    return;
  }

  // Temporary basic state
  savedToggleStates = {};
  removedExtensions = [];

  // Force render only
  renderExtensions(container);
}
// ------------------------------
// 7️⃣ EVENTS (SAFE VERSION)
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

      if (typeof chrome !== "undefined" && chrome.storage) {
        await chrome.storage.local.set({
          [TOGGLE_STORAGE_KEY]: savedToggleStates
        });
      }

      updateBadge();

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

        if (typeof chrome !== "undefined" && chrome.storage) {
          await chrome.storage.local.set({
            [REMOVED_STORAGE_KEY]: removedExtensions
          });
        }

        delete savedToggleStates[name];
        updateBadge();
        card.remove();
      }
    }
  });
}

// ------------------------------
// 🔟 EFFECT DISPATCHER (SAFE)
// ------------------------------
async function triggerExtensionEffect(name, enabled) {
  if (typeof chrome === "undefined" || !chrome.tabs) return;

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
// 1️⃣1️⃣ AUTO APPLY (SAFE)
// ------------------------------
async function applyActiveExtensions() {
  if (typeof chrome === "undefined" || !chrome.tabs) return;

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