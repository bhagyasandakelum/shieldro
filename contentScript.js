(() => {
  const url = window.location.href;
  const hostname = window.location.hostname;

  const issues = [];
  let score = 0;
  const breakdown = {
    http: 0,
    mixedContent: 0,
    phishing: 0
  };

  // 1. HTTP Check (40 pts)
  if (location.protocol !== "https:") {
    breakdown.http = 40;
    score += 40;
    issues.push("Site is not using HTTPS");
  }

  // 2. Mixed Content Check (20 pts)
  if (location.protocol === "https:") {
    let mixedCount = 0;

    const checkMixed = (selector, attr) => {
      document.querySelectorAll(selector).forEach(el => {
        const src = el.getAttribute(attr);
        if (src && src.startsWith("http://")) mixedCount++;
      });
    };

    checkMixed("img", "src");
    checkMixed("script", "src");
    checkMixed("iframe", "src");

    if (mixedCount > 0) {
      breakdown.mixedContent = Math.min(20, mixedCount * 5);
      score += breakdown.mixedContent;
      issues.push(`Mixed content detected (${mixedCount} insecure resource${mixedCount > 1 ? 's' : ''})`);
    }
  }

  // 3. Phishing URL heuristics (20 pts max)
  let phishingScore = 0;

  const detectIPInURL = (url) => /^(http|https):\/\/\d{1,3}(\.\d{1,3}){3}/.test(url);
  const detectExcessiveSubdomains = (hostname) => hostname.split('.').length > 4;
  const detectHyphenatedDomain = (hostname) => hostname.includes("-");
  const detectLongURL = (url) => url.length > 75;

  if (detectIPInURL(url)) {
    phishingScore += 10;
    issues.push("URL uses IP address");
  }

  if (detectExcessiveSubdomains(hostname)) {
    phishingScore += 5;
    issues.push("Excessive subdomains");
  }

  if (detectHyphenatedDomain(hostname)) {
    phishingScore += 3;
    issues.push("Hyphenated domain name detected");
  }

  if (detectLongURL(url)) {
    phishingScore += 2;
    issues.push("Unusually long URL");
  }

  breakdown.phishing = Math.min(20, phishingScore);
  score += breakdown.phishing;

  // Final score capped at 100
  score = Math.min(100, score);

  // Determine level based on score
  let level = "safe";
  if (score > 70) level = "danger";
  else if (score > 40) level = "warning";
  else if (score > 20) level = "notice";

  chrome.runtime.sendMessage({
    type: "SECURITY_RESULT",
    payload: {
      score,
      breakdown,
      level,
      issues
    }
  });
})();
