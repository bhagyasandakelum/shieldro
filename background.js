chrome.runtime.onMessage.addListener((message, sender) => {
  const tabId = sender.tab.id;

  if (message.type === "INSECURE_HTTP") {
    chrome.action.setBadgeText({ tabId, text: "!" });
    chrome.action.setBadgeBackgroundColor({
      tabId,
      color: "#E53935" // red
    });
  }

  if (message.type === "MIXED_CONTENT") {
    chrome.action.setBadgeText({ tabId, text: "!" });
    chrome.action.setBadgeBackgroundColor({
      tabId,
      color: "#FBC02D" // yellow
    });

    // Store issues for popup
    chrome.storage.session.set({
      [tabId]: message.issues
    });
  }

  if (message.type === "SECURE_SITE") {
    chrome.action.setBadgeText({ tabId, text: "✓" });
    chrome.action.setBadgeBackgroundColor({
      tabId,
      color: "#43A047" // green
    });
  }
});
