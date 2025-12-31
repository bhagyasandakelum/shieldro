(() => {
  const issues = [];

  // Check protocol
  const pageIsHTTPS = location.protocol === "https:";

  if (!pageIsHTTPS) {
    chrome.runtime.sendMessage({
      type: "INSECURE_HTTP",
      url: location.href
    });
    return;
  }

  // Mixed content checks
  const checkElements = (selector, attr) => {
    document.querySelectorAll(selector).forEach(el => {
      const src = el.getAttribute(attr);
      if (src && src.startsWith("http://")) {
        issues.push({
          type: "MIXED_CONTENT",
          tag: selector,
          url: src
        });
      }
    });
  };

  checkElements("img", "src");
  checkElements("script", "src");
  checkElements("iframe", "src");

  if (issues.length > 0) {
    chrome.runtime.sendMessage({
      type: "MIXED_CONTENT",
      issues
    });
  } else {
    chrome.runtime.sendMessage({
      type: "SECURE_SITE"
    });
  }
})();
