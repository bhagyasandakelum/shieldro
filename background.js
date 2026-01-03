const TAB_SECURITY = {};
const PRIORITY = { safe: 0, warning: 1, danger: 2 };

function setBadge(tabId, level) {
  const map = {
    danger: { text: "!", color: "#E53935" },
    warning: { text: "!", color: "#FBC02D" },
    safe: { text: "✓", color: "#43A047" }
  };

  chrome.action.setBadgeText({ tabId, text: map[level].text });
  chrome.action.setBadgeBackgroundColor({
    tabId,
    color: map[level].color
  });
}

/* ---------------------------
   RESET STATE ON NAVIGATION
---------------------------- */
chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
  if (changeInfo.status === "loading") {
    TAB_SECURITY[tabId] = {
      level: "safe",
      issues: []
    };

    chrome.storage.session.set({
      [`security_${tabId}`]: TAB_SECURITY[tabId]
    });
  }
});

/* ---------------------------
   CONTENT SCRIPT RESULTS
---------------------------- */
chrome.runtime.onMessage.addListener((msg, sender) => {
  if (msg.type !== "SECURITY_RESULT") return;
  if (!sender.tab || sender.tab.id < 0) return;

  const tabId = sender.tab.id;

  if (!TAB_SECURITY[tabId]) {
    TAB_SECURITY[tabId] = { level: "safe", issues: [] };
  }

  if (PRIORITY[msg.level] > PRIORITY[TAB_SECURITY[tabId].level]) {
    TAB_SECURITY[tabId].level = msg.level;
  }

  TAB_SECURITY[tabId].issues.push(...msg.issues);

  setBadge(tabId, TAB_SECURITY[tabId].level);

  chrome.storage.session.set({
    [`security_${tabId}`]: TAB_SECURITY[tabId]
  });
});

/* ---------------------------
   SECURITY HEADERS (HTTPS ONLY)
---------------------------- */
const REQUIRED_HEADERS = [
  "content-security-policy",
  "strict-transport-security",
  "x-frame-options",
  "x-content-type-options"
];

chrome.webRequest.onHeadersReceived.addListener(
  details => {
    if (details.tabId < 0) return;
    if (details.type !== "main_frame") return;
    if (!details.url.startsWith("https://")) return;

    const tabId = details.tabId;
    if (!TAB_SECURITY[tabId]) return;

    const headers = details.responseHeaders || [];
    const present = headers.map(h => h.name.toLowerCase());

    const missing = REQUIRED_HEADERS.filter(h => !present.includes(h));
    if (missing.length === 0) return;

    if (TAB_SECURITY[tabId].level !== "danger") {
      TAB_SECURITY[tabId].level = "warning";
    }

    missing.forEach(h => {
      TAB_SECURITY[tabId].issues.push(`Missing security header: ${h}`);
    });

    setBadge(tabId, TAB_SECURITY[tabId].level);

    chrome.storage.session.set({
      [`security_${tabId}`]: TAB_SECURITY[tabId]
    });
  },
  { urls: ["<all_urls>"] },
  ["responseHeaders"]
);
