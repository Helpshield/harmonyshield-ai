// ScamShield Content Script
class ScamShieldContent {
  constructor() {
    this.warningOverlay = null;
    this.scanResult = null;
    this.init();
  }

  init() {
    // Listen for scan results from background script
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.type === 'SCAN_RESULT') {
        this.handleScanResult(message.result, message.url);
      }
    });

    // Scan links on page
    this.scanPageLinks();
    
    // Monitor for new links added dynamically
    this.observePageChanges();
  }

  handleScanResult(result, url) {
    this.scanResult = result;
    
    if (['high', 'critical'].includes(result.riskLevel)) {
      this.showWarningOverlay(result);
    }
  }

  showWarningOverlay(result) {
    if (this.warningOverlay) return;

    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(239, 68, 68, 0.95);
      z-index: 999999;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    `;

    overlay.innerHTML = `
      <div style="
        background: white;
        padding: 2rem;
        border-radius: 1rem;
        max-width: 500px;
        margin: 1rem;
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
        text-align: center;
      ">
        <div style="font-size: 4rem; margin-bottom: 1rem;">🛡️</div>
        <h1 style="color: #dc2626; font-size: 1.5rem; margin-bottom: 1rem; font-weight: bold;">
          WARNING: ${result.riskLevel.toUpperCase()} RISK DETECTED
        </h1>
        <p style="color: #374151; margin-bottom: 1rem; line-height: 1.5;">
          This website has been flagged by ScamShield as potentially dangerous.
        </p>
        <div style="background: #fef2f2; padding: 1rem; border-radius: 0.5rem; margin-bottom: 1.5rem;">
          <p style="color: #991b1b; font-weight: 600; margin-bottom: 0.5rem;">Detected Threats:</p>
          <p style="color: #7f1d1d;">${result.threats.join(', ')}</p>
        </div>
        <div style="display: flex; gap: 1rem; justify-content: center;">
          <button id="scamshield-leave" style="
            background: #dc2626;
            color: white;
            padding: 0.75rem 1.5rem;
            border: none;
            border-radius: 0.5rem;
            font-weight: 600;
            cursor: pointer;
          ">Leave Safely</button>
          <button id="scamshield-continue" style="
            background: #6b7280;
            color: white;
            padding: 0.75rem 1.5rem;
            border: none;
            border-radius: 0.5rem;
            font-weight: 600;
            cursor: pointer;
          ">Continue Anyway</button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);
    this.warningOverlay = overlay;

    // Add event listeners
    overlay.querySelector('#scamshield-leave').addEventListener('click', () => {
      window.history.back();
    });

    overlay.querySelector('#scamshield-continue').addEventListener('click', () => {
      this.removeWarningOverlay();
    });
  }

  removeWarningOverlay() {
    if (this.warningOverlay) {
      this.warningOverlay.remove();
      this.warningOverlay = null;
    }
  }

  scanPageLinks() {
    const links = document.querySelectorAll('a[href]');
    links.forEach(link => {
      this.checkLink(link);
    });
  }

  async checkLink(link) {
    const href = link.href;
    if (!href || href.startsWith('#') || href.startsWith('javascript:')) return;

    try {
      const response = await fetch('https://hgqhgwdzsyqrjtthsmyg.supabase.co/functions/v1/quick-url-check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ url: href })
      });

      if (response.ok) {
        const result = await response.json();
        if (['high', 'critical'].includes(result.riskLevel)) {
          this.markDangerousLink(link, result);
        }
      }
    } catch (error) {
      // Silently fail for link checking
    }
  }

  markDangerousLink(link, result) {
    link.style.cssText += `
      border: 2px solid #ef4444 !important;
      background: #fef2f2 !important;
      color: #dc2626 !important;
      position: relative;
    `;

    link.title = `⚠️ ScamShield Warning: This link has been flagged as ${result.riskLevel} risk`;
    
    // Add warning icon
    const warningIcon = document.createElement('span');
    warningIcon.innerHTML = ' ⚠️';
    warningIcon.style.cssText = 'color: #ef4444; font-weight: bold;';
    link.appendChild(warningIcon);
  }

  observePageChanges() {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const links = node.querySelectorAll ? node.querySelectorAll('a[href]') : [];
            links.forEach(link => this.checkLink(link));
          }
        });
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }
}

// Initialize content script
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new ScamShieldContent());
} else {
  new ScamShieldContent();
}