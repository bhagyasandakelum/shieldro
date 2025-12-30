chrome.runtime.onMessage.addListener((message, sender) => {
  if (message.type === "INSECURE_HTTP") {
    const tabId = sender.tab.id;

    chrome.action.setBadgeText({
      tabId,
      text: "!"
    });

    chrome.action.setBadgeBackgroundColor({
      tabId,
      color: "#E53935" // red
    });

    console.log("Insecure HTTP detected:", message.url);
  }
});
