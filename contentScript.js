(() => {
  const url = window.location.href;
  const hostname = window.location.hostname;

  /* =======================
     OWASP TOP 10 MAPPING
  ======================= */
  const OWASP_MAP = {
    INSECURE_HTTP: "A02: Cryptographic Failures",
    MIXED_CONTENT: "A02: Cryptographic Failures",
    IP_URL: "A10: Server-Side Request Forgery",
    MANY_SUBDOMAINS: "A05: Security Misconfiguration",
    HYPHEN_DOMAIN: "A05: Security Misconfiguration",
    LONG_URL: "A10: Server-Side Request Forgery",
    INSECURE_FORM: "A02: Cryptographic Failures",
    SUSPICIOUS_KEYWORD: "Social Engineering / Phishing",
    TYPOSQUATTING: "Phishing / Brand Impersonation"
  };

  const issues = [];
  let score = 0;

  const breakdown = {
    http: 0,
    mixedContent: 0,
    phishing: 0,
    content: 0
  };

  /* =======================
     1. HTTP CHECK (40 pts)
  ======================= */
  if (location.protocol !== "https:") {
    breakdown.http = 40;
    score += 40;

    issues.push({
      title: "Insecure HTTP Connection",
      description: "Site does not use HTTPS encryption",
      owasp: OWASP_MAP.INSECURE_HTTP,
      severity: "danger"
    });
  }

  /* =======================
     2. MIXED CONTENT (20 pts)
  ======================= */
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

      issues.push({
        title: "Mixed Content Detected",
        description: `${mixedCount} insecure resource${mixedCount > 1 ? "s" : ""} loaded over HTTP`,
        owasp: OWASP_MAP.MIXED_CONTENT,
        severity: "warning"
      });
    }
  }

  /* =======================
     3. PHISHING HEURISTICS (20 pts)
  ======================= */
  let phishingScore = 0;

  const detectIPInURL = (url) =>
    /^(http|https):\/\/\d{1,3}(\.\d{1,3}){3}/.test(url);

  const detectExcessiveSubdomains = (hostname) =>
    hostname.split(".").length > 4;

  const detectHyphenatedDomain = (hostname) =>
    hostname.includes("-");

  const detectLongURL = (url) =>
    url.length > 75;

  if (detectIPInURL(url)) {
    phishingScore += 10;
    issues.push({
      title: "IP Address Used in URL",
      description: "Legitimate sites rarely use raw IP addresses",
      owasp: OWASP_MAP.IP_URL,
      severity: "danger"
    });
  }

  if (detectExcessiveSubdomains(hostname)) {
    phishingScore += 5;
    issues.push({
      title: "Excessive Subdomains",
      description: "Suspiciously deep subdomain structure",
      owasp: OWASP_MAP.MANY_SUBDOMAINS,
      severity: "warning"
    });
  }

  if (detectHyphenatedDomain(hostname)) {
    phishingScore += 3;
    issues.push({
      title: "Hyphenated Domain Name",
      description: "Common phishing domain pattern",
      owasp: OWASP_MAP.HYPHEN_DOMAIN,
      severity: "notice"
    });
  }

  if (detectLongURL(url)) {
    phishingScore += 2;
    issues.push({
      title: "Unusually Long URL",
      description: "Long URLs are often used to hide malicious paths",
      owasp: OWASP_MAP.LONG_URL,
      severity: "notice"
    });
  }

  /* =======================
     4. TYPOSQUATTING CHECK
  ======================= */
  const popularDomains = ["google", "facebook", "amazon", "paypal", "microsoft", "apple", "twitter", "instagram", "linkedin", "netflix"];

  const getLevenshteinDistance = (a, b) => {
    const matrix = [];
    for (let i = 0; i <= b.length; i++) matrix[i] = [i];
    for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        if (b.charAt(i - 1) == a.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            Math.min(matrix[i][j - 1] + 1, matrix[i - 1][j] + 1)
          );
        }
      }
    }
    return matrix[b.length][a.length];
  };

  const domainBase = hostname.split('.').slice(-2, -1)[0]; // simplistic domain extraction

  if (domainBase) {
    for (const target of popularDomains) {
      if (domainBase !== target) {
        const dist = getLevenshteinDistance(domainBase, target);
        if (dist === 1 || (dist === 2 && domainBase.length > 6)) { // Close match but not identical
          phishingScore += 15;
          issues.push({
            title: "Potential Typosquatting",
            description: `Domain '${domainBase}' looks suspiciously like '${target}'`,
            owasp: OWASP_MAP.TYPOSQUATTING,
            severity: "danger"
          });
          break; // Only report one match
        }
      }
    }
  }

  breakdown.phishing = Math.min(20, phishingScore);
  score += breakdown.phishing;


  /* =======================
     5. CONTENT & FORM ANALYSIS (20 pts)
  ======================= */
  let contentScore = 0;

  // Form Security Check
  const forms = document.querySelectorAll('form');
  let insecureForms = 0;
  forms.forEach(form => {
    const action = form.getAttribute('action');
    if (action && action.startsWith('http://')) {
      insecureForms++;
    }
  });

  if (insecureForms > 0) {
    contentScore += 15;
    issues.push({
      title: "Insecure Form Submission",
      description: `Found ${insecureForms} form(s) submitting data over unencrypted HTTP`,
      owasp: OWASP_MAP.INSECURE_FORM,
      severity: "danger"
    });
  }

  // Suspicious Keyword Check
  const bodyText = document.body.innerText.toLowerCase();
  const keywords = ["verify your account", "urgent action required", "confirm password", "social security number", "credit card details"];
  let foundKeywords = [];

  keywords.forEach(kw => {
    if (bodyText.includes(kw)) {
      foundKeywords.push(kw);
    }
  });

  if (foundKeywords.length > 0) {
    contentScore += 5;
    issues.push({
      title: "Suspicious Content Detected",
      description: `Page contains high-risk phrases: "${foundKeywords.slice(0, 2).join('", "')}"...`,
      owasp: OWASP_MAP.SUSPICIOUS_KEYWORD,
      severity: "warning"
    });
  }

  breakdown.content = Math.min(20, contentScore);
  score += breakdown.content;

  /* =======================
     FINAL SCORE & LEVEL
  ======================= */
  score = Math.min(100, score);

  let level = "safe";
  if (score > 70) level = "danger";
  else if (score > 40) level = "warning";
  else if (score > 20) level = "notice";

  /* =======================
     SEND RESULT
  ======================= */
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
