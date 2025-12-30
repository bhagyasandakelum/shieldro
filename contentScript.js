(() => {

    console.log("Shieldro content script loaded");


  if (location.protocol === "http:") {
    chrome.runtime.sendMessage({
      type: "INSECURE_HTTP",
      url: location.href
    });
  }
})();
