document.addEventListener("DOMContentLoaded", async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const key = `security_${tab.id}`;
  const data = await chrome.storage.session.get(key);

  const statusEl = document.getElementById("status");
  const detailsEl = document.getElementById("details");

  if (!data[key]) {
    statusEl.textContent = "No security data available";
    statusEl.className = "status safe";
    return;
  }

  const { level, issues } = data[key];

  statusEl.className = `status ${level}`;
  statusEl.textContent =
    level === "danger"
      ? "High Risk Website"
      : level === "warning"
      ? "Security Warnings Found"
      : "Secure Website";

  detailsEl.innerHTML = "";
  issues.forEach(issue => {
    const li = document.createElement("li");
    li.textContent = issue;
    detailsEl.appendChild(li);
  });
});
