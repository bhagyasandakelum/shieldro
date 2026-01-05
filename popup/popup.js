document.addEventListener("DOMContentLoaded", async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const key = `security_${tab.id}`;
  const data = await chrome.storage.session.get(key);

  const wheel = document.getElementById("riskWheel");
  const wheelText = document.getElementById("wheelText");
  const detailsEl = document.getElementById("details");

  if (!data[key]) {
    wheelText.textContent = "UNKNOWN";
    wheelText.style.color = "#94a3b8";
    return;
  }

  const { score = 0, issues = [] } = data[key];

  /* =========================
     RISK STATUS RESOLUTION
  ========================= */
  let status = "SECURED";
  let color = "#43A047";
  let animation = "spinSafe 25s linear infinite";

  if (score > 70) {
    status = "UNSECURED";
    color = "#E53935";
    animation = "spinRisk 6s linear infinite";
  } else if (score > 40) {
    status = "AT RISK";
    color = "#FBC02D";
    animation = "spinRisk 12s linear infinite";
  }

/* =========================
   APPLY WHEEL STATE
========================= */
wheel.style.animation = animation;

// Reset text classes
wheelText.classList.remove("warning", "danger");

if (status === "SECURED") {
  wheel.style.background = `conic-gradient(#43A047, #020617, #43A047)`;
  wheelText.style.color = "#43A047";
}

if (status === "AT RISK") {
  wheel.style.background = `conic-gradient(#FBC02D, #020617, #FBC02D)`;
  wheelText.style.color = "#FBC02D";
  wheelText.classList.add("warning");
}

if (status === "UNSECURED") {
  wheel.style.background = `conic-gradient(#E53935, #020617, #E53935)`;
  wheelText.style.color = "#E53935";
  wheelText.classList.add("danger");
}

wheelText.textContent = status;


  /* =========================
     ISSUE LIST RENDERING
     (SUPPORTS SIMPLE + STRUCTURED)
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

    // If issue is a structured object (future-ready)
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
    } 
    // If issue is a plain string (current contentScript output)
    else {
      li.textContent = issue;
    }

    detailsEl.appendChild(li);
  });
});
