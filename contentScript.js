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

  function detectIPInURL(url) {
  const ipRegex = /^(http|https):\/\/\d{1,3}(\.\d{1,3}){3}/;
  return ipRegex.test(url);
  }

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

  (function () {
  const url = window.location.href;
  const hostname = window.location.hostname;

  const issues = [];
  let level = "safe";

  if (detectIPInURL(url)) {
    issues.push("URL uses IP address instead of domain");
    level = "danger";
  }

  if (detectExcessiveSubdomains(hostname)) {
    issues.push("Excessive number of subdomains");
    level = "danger";
  }

  if (detectSuspiciousKeywords(url)) {
    issues.push("Suspicious keywords found in URL");
    if (level !== "danger") level = "warning";
  }

  if (detectHyphenatedDomain(hostname)) {
    issues.push("Hyphenated domain name detected");
    if (level !== "danger") level = "warning";
  }

  if (detectLongURL(url)) {
    issues.push("Unusually long URL");
    if (level !== "danger") level = "warning";
  }

  if (issues.length > 0) {
    chrome.runtime.sendMessage({
      type: "SECURITY_RESULT",
      level,
      issues
    });
  }
})();



})();
