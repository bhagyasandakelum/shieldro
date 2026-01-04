document.addEventListener("DOMContentLoaded", async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const key = `security_${tab.id}`;
  const data = await chrome.storage.session.get(key);

  const needle = document.getElementById("needle");
  const riskText = document.getElementById("riskText");
  const detailsEl = document.getElementById("details");
  const gauge = document.querySelector(".gauge");

  if (!data[key]) {
    riskText.textContent = "No data available";
    return;
  }

  const { score, issues } = data[key];

  /* =========================
     GAUGE NEEDLE ROTATION
  ========================= */
  // Convert score (0–100) → angle (-90° to +90°)
  const angle = -90 + (score * 180) / 100;
  needle.style.transform = `rotate(${angle}deg)`;

  /* =========================
     RISK LABEL
  ========================= */
  let riskLevel = "Safe";

  if (score > 70) riskLevel = "High Risk";
  else if (score > 40) riskLevel = "Medium Risk";
  else if (score > 20) riskLevel = "Low Risk";

  riskText.textContent = riskLevel;

  /* =========================
     ANIMATED GRADIENT SPEED
  ========================= */
  if (score > 70) {
    gauge.style.animation = "spinRisk 6s linear infinite";
  } else if (score > 40) {
    gauge.style.animation = "spinRisk 12s linear infinite";
  } else {
    gauge.style.animation = "spinSafe 25s linear infinite";
  }

  /* =========================
     ISSUE LIST RENDERING
     (STRUCTURED + OWASP)
  ========================= */
  detailsEl.innerHTML = "";

  if (!issues || issues.length === 0) {
    const li = document.createElement("li");
    li.className = "issue safe";
    li.textContent = "No security issues detected";
    detailsEl.appendChild(li);
    return;
  }

  issues.forEach(issue => {
    const li = document.createElement("li");
    li.className = `issue ${issue.severity || "notice"}`;

    li.innerHTML = `
      <div class="issue-header">
        <strong>${issue.title}</strong>
        <span class="severity-tag ${issue.severity}">
          ${issue.severity.toUpperCase()}
        </span>
      </div>
      <div class="issue-desc">
        ${issue.description}
      </div>
      <div class="issue-owasp">
        OWASP: <span>${issue.owasp}</span>
      </div>
    `;

    detailsEl.appendChild(li);
  });
});
