/* ================================
   In-memory tab security state
================================ */
const TAB_SECURITY = {};
const PRIORITY = { safe: 0, notice: 1, warning: 2, danger: 3 };

/* ================================
   Security Header Risk Model
================================ */
const SECURITY_HEADERS = {
  "strict-transport-security": 8,
  "content-security-policy": 6,
  "x-frame-options": 3,
  "x-content-type-options": 3
};

/* ================================
   Badge Helper
================================ */
function setBadge(tabId, level) {
  const map = {
    danger: { text: "!", color: "#E53935" },
    warning: { text: "!", color: "#FB8C00" },
    notice: { text: "•", color: "#FBC02D" },
    safe: { text: "✓", color: "#43A047" }
  };

  chrome.action.setBadgeText({ tabId, text: map[level].text });
  chrome.action.setBadgeBackgroundColor({
    tabId,
    color: map[level].color
  });
}

/* ================================
   Reset state on navigation
================================ */
chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
  if (changeInfo.status === "loading") {
    TAB_SECURITY[tabId] = {
      level: "safe",
      issues: [],
      score: 0
    };

    chrome.storage.session.set({
      [`security_${tabId}`]: TAB_SECURITY[tabId]
    });
  }
});

/* ================================
   Content Script Results
================================ */
chrome.runtime.onMessage.addListener((msg, sender) => {
  if (msg.type !== "SECURITY_RESULT") return;
  if (!sender.tab || sender.tab.id < 0) return;

  const tabId = sender.tab.id;
  const { level, issues, score } = msg.payload;

  if (!TAB_SECURITY[tabId]) {
    TAB_SECURITY[tabId] = { level: "safe", issues: [], score: 0 };
  }

  // Increase severity only if higher priority
  if (PRIORITY[level] > PRIORITY[TAB_SECURITY[tabId].level]) {
    TAB_SECURITY[tabId].level = level;
  }

  // Merge issues safely
  TAB_SECURITY[tabId].issues = Array.from(
    new Set([...TAB_SECURITY[tabId].issues, ...issues])
  );

  // Score from content script (HTTP + mixed + phishing)
  TAB_SECURITY[tabId].score = score;

  setBadge(tabId, TAB_SECURITY[tabId].level);

  chrome.storage.session.set({
    [`security_${tabId}`]: TAB_SECURITY[tabId]
  });
});

/* ================================
   Security Header Analysis
================================ */
chrome.webRequest.onHeadersReceived.addListener(
  (details) => {
    if (details.tabId < 0) return;
    if (details.type !== "main_frame") return;
    if (!details.url.startsWith("https://")) return;

    const tabId = details.tabId;
    if (!TAB_SECURITY[tabId]) return;

    const headers = details.responseHeaders || [];
    const presentHeaders = headers.map(h => h.name.toLowerCase());

    let headerScore = 0;
    const headerIssues = [];

    for (const [header, points] of Object.entries(SECURITY_HEADERS)) {
      if (!presentHeaders.includes(header)) {
        headerScore += points;
        headerIssues.push(`Missing security header: ${header}`);
      }
    }

    if (headerIssues.length === 0) return;

    // Update score (cap at 100)
    TAB_SECURITY[tabId].score = Math.min(
      100,
      TAB_SECURITY[tabId].score + headerScore
    );

    // Merge issues
    TAB_SECURITY[tabId].issues = Array.from(
      new Set([...TAB_SECURITY[tabId].issues, ...headerIssues])
    );

    // Recalculate level from score
    const score = TAB_SECURITY[tabId].score;
    if (score > 70) TAB_SECURITY[tabId].level = "danger";
    else if (score > 40) TAB_SECURITY[tabId].level = "warning";
    else if (score > 20) TAB_SECURITY[tabId].level = "notice";
    else TAB_SECURITY[tabId].level = "safe";

    setBadge(tabId, TAB_SECURITY[tabId].level);

    chrome.storage.session.set({
      [`security_${tabId}`]: TAB_SECURITY[tabId]
    });
  },
  { urls: ["<all_urls>"] },
  ["responseHeaders"]
);
