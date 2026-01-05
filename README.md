# 🛡️ Shieldro – Browser Security Awareness Extension

Shieldro is a Chrome browser extension that analyzes website security in real time and presents the results in a **clear, visual, and user‑friendly way**. It helps users instantly understand whether a website is **Secured**, **At Risk**, or **Unsecured**—without requiring deep technical knowledge.

---

## 🚀 Features

### 🔐 Transport Security Detection

* Detects insecure **HTTP** websites
* Warns against potential **man‑in‑the‑middle (MITM)** risks

### ⚠️ Mixed Content Analysis

* Identifies HTTPS pages loading insecure HTTP resources
* Detects scripts, images, iframes, and other mixed content issues

### 🎣 Phishing & URL Risk Heuristics

Analyzes suspicious URL patterns such as:

* IP‑based URLs
* Excessive subdomains
* Hyphenated domains
* Abnormally long URLs

### 🧩 Security Header Inspection

Checks for critical HTTP security headers:

* Content‑Security‑Policy (CSP)
* Strict‑Transport‑Security (HSTS)
* X‑Frame‑Options
* X‑Content‑Type‑Options

### 📊 Risk Scoring Engine

* Aggregates all findings into a single risk score
* Categorizes sites into:

  * 🟢 **SECURED**
  * 🟡 **AT RISK**
  * 🔴 **UNSECURED**

### 🎨 Visual Security Wheel

* Animated, color‑coded wheel
* Red or yellow for insecure states
* Calm green for secured websites
* Center text clearly displays security status

---

## 🧠 Why Shieldro Is Important

### 👤 For Everyday Users

* Prevents entering credentials on unsafe websites
* Reduces phishing and data‑theft risks
* Improves security awareness effortlessly

### 🎓 For Students & Developers

* Demonstrates real‑world browser security checks
* Practical implementation of OWASP concepts
* Ideal cybersecurity portfolio project

### 🏢 For Organizations

* Adds an extra layer of user‑side security
* Helps mitigate social‑engineering attacks
* Complements enterprise security controls

---

## 🏗️ How It Works

1. **Content Scripts** analyze the active webpage:

   * HTTPS usage
   * Mixed content
   * Suspicious URL patterns

2. **Background Service Worker**:

   * Inspects HTTP response headers
   * Calculates risk score
   * Stores analysis securely in session storage

3. **Popup UI**:

   * Displays an animated security wheel
   * Shows security status and detected issues

> All analysis is performed **locally in the browser**.

---

## 🔒 Privacy & Security

Shieldro is privacy‑first by design:

* ❌ No tracking
* ❌ No analytics
* ❌ No data collection
* ❌ No external API calls

Your browsing data **never leaves your device**.

---

## 📂 Project Structure

```
shieldro/
├── manifest.json
├── background.js
├── contentScript.js
├── popup/
│   ├── popup.html
│   ├── popup.css
│   └── popup.js
└── icons/
    ├── icon16.png
    ├── icon32.png
    ├── icon48.png
    └── icon128.png
```

---

## 🛠️ Installation (Developer Mode)

1. Clone the repository:

   ```bash
   git clone https://github.com/your-username/shieldro.git
   ```
2. Open Chrome and navigate to:

   ```
   chrome://extensions
   ```
3. Enable **Developer mode**
4. Click **Load unpacked**
5. Select the project directory

---

## 🧪 Use Cases

* Checking website security before logging in
* Detecting phishing attempts early
* Teaching browser security concepts
* Academic and cybersecurity portfolio projects

---

## 🧭 Future Enhancements

* OWASP Top 10 mapping per issue
* Domain reputation caching
* Security history per site
* Exportable security reports
* Advanced CSP strength evaluation

---

## 👨‍💻 Developed By

**ZeroAxill**
Cybersecurity‑focused browser security tooling

---

## 📜 License

This project is licensed under the **MIT License**.

---

⭐ If you find this project useful, consider giving it a star to support open‑source security tools.
