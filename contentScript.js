(() => {
  const issues = [];

  // 1. HTTP check
  if (location.protocol === "http:") {
    chrome.runtime.sendMessage({
      type: "SECURITY_RESULT",
      level: "danger",
      issues: ["Site is using insecure HTTP"]
    });
    return;
  }

  // 2. Mixed content check (only on HTTPS)
  const check = (selector, attr) => {
    document.querySelectorAll(selector).forEach(el => {
      const src = el.getAttribute(attr);
      if (src && src.startsWith("http://")) {
        issues.push(`Mixed content: ${selector} → ${src}`);
      }
    });
  };

  check("img", "src");
  check("script", "src");
  check("iframe", "src");

  if (issues.length > 0) {
    chrome.runtime.sendMessage({
      type: "SECURITY_RESULT",
      level: "warning",
      issues
    });
  } else {
    chrome.runtime.sendMessage({
      type: "SECURITY_RESULT",
      level: "safe",
      issues: []
    });
  }
})();
