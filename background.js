const TAB_SECURITY = {};
const PRIORITY = { safe: 0, notice: 1, warning: 2, danger: 3 };

function setBadge(tabId, level) {
  const map = {
    danger: { text: "!", color: "#E53935" },
    warning: { text: "!", color: "#FB8C00" },
    notice: { text: "•", color: "#FBC02D" },
    safe: { text: "✓", color: "#43A047" }
  };

  chrome.action.setBadgeText({ tabId, text: map[level].text });
  chrome.action.setBadgeBackgroundColor({ tabId, color: map[level].color });
}

chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
  if (changeInfo.status === "loading") {
    TAB_SECURITY[tabId] = {
      level: "safe",
      issues: [],
      score: 0
    };
    chrome.storage.session.set({ [`security_${tabId}`]: TAB_SECURITY[tabId] });
  }
});

chrome.runtime.onMessage.addListener((msg, sender) => {
  if (msg.type !== "SECURITY_RESULT") return;
  if (!sender.tab || sender.tab.id < 0) return;

  const tabId = sender.tab.id;
  const { level, issues, score } = msg.payload;

  if (!TAB_SECURITY[tabId]) {
    TAB_SECURITY[tabId] = { level: "safe", issues: [], score: 0 };
  }

  // Update level if new is higher priority
  if (PRIORITY[level] > PRIORITY[TAB_SECURITY[tabId].level]) {
    TAB_SECURITY[tabId].level = level;
  }

  // Merge issues and update score
  TAB_SECURITY[tabId].issues = Array.from(new Set([...TAB_SECURITY[tabId].issues, ...issues]));
  TAB_SECURITY[tabId].score = score;

  setBadge(tabId, TAB_SECURITY[tabId].level);

  chrome.storage.session.set({ [`security_${tabId}`]: TAB_SECURITY[tabId] });
});
