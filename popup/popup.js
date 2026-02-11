document.addEventListener("DOMContentLoaded", async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const key = `security_${tab.id}`;
  const data = await chrome.storage.session.get(key);

  // UI Elements
  const heroSection = document.getElementById("heroSection");
  const scoreValEl = document.getElementById("scoreValue");
  const scoreRing = document.querySelector(".progress-ring__circle");
  const statusBadge = document.getElementById("statusBadge");
  const issuesList = document.getElementById("issuesList");
  const httpsStatus = document.getElementById("httpsStatus");
  const contentStatus = document.getElementById("contentStatus");
  const phishingStatus = document.getElementById("phishingStatus");

  if (!data[key]) {
    statusBadge.textContent = "Analyzing...";
    return;
  }

  const { score = 0, issues = [], breakdown } = data[key];

  // Calculate final score logic (inverse of risk)
  // The current logic seems to be: 0 is safe, 100 is dangerous.
  // Let's invert it for the UI "Trust Score": 100 - riskScore
  const trustScore = Math.max(0, 100 - score);

  // Update Score Ring
  const radius = scoreRing.r.baseVal.value;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (trustScore / 100) * circumference;

  scoreRing.style.strokeDashoffset = offset;
  scoreValEl.textContent = trustScore;

  // Determine Status Concept
  let statusConfig = {
    label: "SECURE",
    color: "#10b981", // green
    bg: "rgba(16, 185, 129, 0.1)"
  };

  if (trustScore < 50) {
    statusConfig = { label: "DANGEROUS", color: "#ef4444", bg: "rgba(239, 68, 68, 0.1)" };
  } else if (trustScore < 80) {
    statusConfig = { label: "CAUTION", color: "#f59e0b", bg: "rgba(245, 158, 11, 0.1)" };
  }

  // Apply Status Styles
  scoreRing.style.stroke = statusConfig.color;
  statusBadge.textContent = statusConfig.label;
  statusBadge.style.color = statusConfig.color;
  statusBadge.style.background = statusConfig.bg;
  statusBadge.style.borderColor = statusConfig.color;

  // Update Detail Grid
  // HTTPS Check
  const hasHttpIssue = issues.some(i => i.owasp.includes("Cryptographic"));
  httpsStatus.textContent = hasHttpIssue ? "Weak" : "Secure";
  httpsStatus.className = `metric-value ${hasHttpIssue ? "text-danger" : "text-success"}`;

  // Content Check
  const hasContentIssue = issues.some(i => i.title.includes("Content") || i.title.includes("Form"));
  contentStatus.textContent = hasContentIssue ? "Risky" : "Safe";
  contentStatus.className = `metric-value ${hasContentIssue ? "text-warning" : "text-success"}`;

  // Phishing Check
  const hasPhishing = issues.some(i => i.title.includes("Phishing") || i.title.includes("Typosquatting") || i.title.includes("IP"));
  phishingStatus.textContent = hasPhishing ? "Detected" : "Clean";
  phishingStatus.className = `metric-value ${hasPhishing ? "text-danger" : "text-success"}`;

  // Populate Issues List
  issuesList.innerHTML = "";

  if (issues.length === 0) {
    issuesList.innerHTML = `
        <li class="issue-item" style="justify-content: center; opacity: 0.7;">
          <span style="font-size: 11px;">✨ No security threats found.</span>
        </li>
      `;
  } else {
    issues.forEach(issue => {
      const li = document.createElement("li");
      li.className = "issue-item";

      let severityColor = "text-secondary";
      let icon = "⚠️";

      if (issue.severity === "danger") {
        severityColor = "text-danger";
        icon = "🚫";
      } else if (issue.severity === "warning") {
        severityColor = "text-warning";
        icon = "qp";
      } else {
        icon = "ℹ️";
      }

      li.innerHTML = `
          <div class="issue-icon">${icon}</div>
          <div class="issue-content">
            <div class="issue-title ${severityColor}">${issue.title}</div>
            <div class="issue-desc">${issue.description}</div>
          </div>
        `;
      issuesList.appendChild(li);
    });
  }
});
