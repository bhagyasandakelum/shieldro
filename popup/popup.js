document.addEventListener("DOMContentLoaded", async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const key = `security_${tab.id}`;
  const data = await chrome.storage.session.get(key);

  const wheel = document.getElementById("riskWheel");   // outer ring
  const wheelText = document.getElementById("wheelText"); // center text or icon container
  const detailsEl = document.getElementById("details");

  if (!data[key]) {
    wheelText.textContent = "UNKNOWN";
    wheelText.style.color = "#94a3b8";
    // Default neutral wheel styling
    wheel.style.background = `conic-gradient(#64748b, #020617, #64748b)`;
    wheel.classList.remove("glow-safe", "glow-warning", "glow-danger");
    return;
  }

  const { score = 0, issues = [] } = data[key];

  /* =========================
     RISK STATUS RESOLUTION
  ========================= */
  let status = "SECURED";
  let color = "#43A047";
  let glowClass = "glow-safe";
  let animation = "spinSafe 25s linear infinite";

  if (score > 70) {
    status = "UNSECURED";
    color = "#E53935";
    glowClass = "glow-danger";
    animation = "spinRisk 6s linear infinite";
  } else if (score > 40) {
    status = "AT RISK";
    color = "#FBC02D";
    glowClass = "glow-warning";
    animation = "spinRisk 12s linear infinite";
  }

  /* =========================
     APPLY WHEEL STATE
  ========================= */

  // Remove previous glow classes
  wheel.classList.remove("glow-safe", "glow-warning", "glow-danger");
  wheel.classList.add(glowClass);

  // Set animated gradient background
  wheel.style.background = `conic-gradient(${color}, #020617, ${color})`;
  wheel.style.animation = animation;

  // Clear previous content inside wheelText
  wheelText.innerHTML = "";

  if (status === "SECURED") {
    // Show green checkmark icon (SVG inline)
    const checkmarkSVG = `
      <svg xmlns="http://www.w3.org/2000/svg" 
           width="48" height="48" viewBox="0 0 24 24" 
           fill="none" stroke="${color}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" >
        <path d="M20 6L9 17l-5-5" />
      </svg>
    `;
    wheelText.innerHTML = checkmarkSVG;
    wheelText.style.color = color; // Just in case, but SVG strokes color itself
    wheelText.classList.remove("warning", "danger");
  } else {
    // Show status text for risk
    wheelText.textContent = status;
    wheelText.style.color = color;
    wheelText.classList.remove("warning", "danger");

    if (status === "AT RISK") {
      wheelText.classList.add("warning");
    } else if (status === "UNSECURED") {
      wheelText.classList.add("danger");
    }
  }

  /* =========================
     ISSUE LIST RENDERING
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
    li.className = "issue";

    if (typeof issue === "object") {
      const severity = issue.severity || "notice";
      li.classList.add(severity);

      li.innerHTML = `
        <div class="issue-header">
          <strong>${issue.title || "Security Finding"}</strong>
          <span class="severity-tag ${severity}">
            ${severity.toUpperCase()}
          </span>
        </div>
        <div class="issue-desc">
          ${issue.description || ""}
        </div>
        ${
          issue.owasp
            ? `<div class="issue-owasp">
                 OWASP: <span>${issue.owasp}</span>
               </div>`
            : ""
        }
      `;
    } else {
      li.textContent = issue;
    }

    detailsEl.appendChild(li);
  });
});
