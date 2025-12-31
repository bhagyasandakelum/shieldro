# Shieldro 🛡️

A Chrome extension that detects insecure websites and warns users in real time.

---

## Overview

Secure Site Guardian helps users identify insecure web pages by:

- Detecting sites loaded over HTTP (not secure)
- Detecting HTTPS pages loading insecure HTTP resources (mixed content)
- Displaying clear visual badges to indicate security status:
  - 🔴 Red badge for insecure HTTP pages
  - 🟡 Yellow badge for mixed content warnings
  - 🟢 Green badge for secure pages

This extension runs completely in the browser and does **not** collect any personal data.

---

## Features

- HTTP detection  
- Mixed content detection (images, scripts, iframes)  
- Badge notifications in the Chrome toolbar  
- Popup UI to show site security status (basic)  

---

## Installation

1. Clone or download this repository.  
2. Open Chrome and go to `chrome://extensions`.  
3. Enable **Developer mode**.  
4. Click **Load unpacked** and select the project folder.  
5. Test the extension by visiting HTTP and HTTPS sites.

---
## Project Structure

secure-site-guardian/
├── manifest.json
├── background.js
├── contentScript.js
├── popup/
│ ├── popup.html
│ ├── popup.js
│ └── popup.css
└── icons/
├── icon16.png
├── icon32.png
├── icon48.png
└── icon128.png


---

## Usage

- Red badge means the site is loaded over HTTP (not secure).  
- Yellow badge means mixed content detected on an HTTPS page.  
- Green badge means no issues detected.  

---

## Contributing

Contributions, issues, and feature requests are welcome!  
Feel free to open a pull request or an issue.

---

## License

MIT License — free to use and modify.

---

## Contact

For questions or feedback, please open an issue or contact the maintainer.



