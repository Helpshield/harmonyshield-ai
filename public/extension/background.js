// ScamShield Browser Extension Background Script
const SUPABASE_URL = "https://hgqhgwdzsyqrjtthsmyg.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhncWhnd2R6c3lxcmp0dGhzbXlnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU3MjU1OTAsImV4cCI6MjA3MTMwMTU5MH0.VBEXTbT1mUcKmn8EB0RxvJLTfQU2p4pe13vWkL63W6M";

class URLScanner {
  constructor() {
    this.cache = new Map();
    this.scanQueue = new Set();
    this.init();
  }

  async init() {
    chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
      if (changeInfo.status === 'loading' && tab.url) {
        this.scanURL(tab.url, tabId);
      }
    });

    chrome.tabs.onActivated.addListener(async (activeInfo) => {
      const tab = await chrome.tabs.get(activeInfo.tabId);
      if (tab.url) {
        this.scanURL(tab.url, activeInfo.tabId);
      }
    });
  }

  async scanURL(url, tabId) {
    if (this.isExcludedURL(url)) return;
    
    const domain = this.extractDomain(url);
    if (this.cache.has(domain)) {
      const result = this.cache.get(domain);
      this.handleScanResult(result, tabId, url);
      return;
    }

    if (this.scanQueue.has(domain)) return;
    this.scanQueue.add(domain);

    try {
      const result = await this.performScan(url);
      this.cache.set(domain, result);
      this.scanQueue.delete(domain);
      this.handleScanResult(result, tabId, url);
    } catch (error) {
      console.error('Scan error:', error);
      this.scanQueue.delete(domain);
    }
  }

  async performScan(url) {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/url-scanner`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      },
      body: JSON.stringify({
        url: url,
        source: 'extension'
      })
    });

    if (!response.ok) {
      throw new Error(`Scan failed: ${response.status}`);
    }

    return await response.json();
  }

  handleScanResult(result, tabId, url) {
    const { riskLevel, threats } = result;
    
    // Update extension badge
    this.updateBadge(tabId, riskLevel);

    // Send notification for high-risk sites
    if (['high', 'critical'].includes(riskLevel)) {
      this.showThreatNotification(url, result);
      this.sendPushNotification(url, result);
    }

    // Send result to content script
    chrome.tabs.sendMessage(tabId, {
      type: 'SCAN_RESULT',
      result: result,
      url: url
    }).catch(() => {
      // Ignore if content script not ready
    });
  }

  updateBadge(tabId, riskLevel) {
    const colors = {
      safe: '#22c55e',
      low: '#eab308',
      medium: '#f97316',
      high: '#ef4444',
      critical: '#dc2626'
    };

    const texts = {
      safe: '✓',
      low: '!',
      medium: '!!',
      high: '⚠',
      critical: '⚠'
    };

    chrome.action.setBadgeText({
      tabId: tabId,
      text: texts[riskLevel] || ''
    });

    chrome.action.setBadgeBackgroundColor({
      tabId: tabId,
      color: colors[riskLevel] || '#gray'
    });
  }

  async showThreatNotification(url, result) {
    const domain = this.extractDomain(url);
    const { riskLevel, threats } = result;

    await chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icons/icon48.png',
      title: `🛡️ ScamShield Alert: ${riskLevel.toUpperCase()} Risk Detected`,
      message: `${domain} has been flagged as potentially dangerous. Threats: ${threats.join(', ')}`,
      priority: riskLevel === 'critical' ? 2 : 1,
      requireInteraction: riskLevel === 'critical'
    });
  }

  async sendPushNotification(url, result) {
    try {
      await fetch(`${SUPABASE_URL}/functions/v1/send-push-notification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({
          type: 'threat_detected',
          url: url,
          result: result,
          source: 'extension'
        })
      });
    } catch (error) {
      console.error('Failed to send push notification:', error);
    }
  }

  extractDomain(url) {
    try {
      return new URL(url).hostname;
    } catch {
      return url;
    }
  }

  isExcludedURL(url) {
    const excluded = [
      'chrome://',
      'chrome-extension://',
      'moz-extension://',
      'about:',
      'data:',
      'javascript:'
    ];
    return excluded.some(prefix => url.startsWith(prefix));
  }
}

// Initialize scanner
new URLScanner();

// Handle extension installation
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    chrome.tabs.create({
      url: 'https://hgqhgwdzsyqrjtthsmyg.lovable.app'
    });
  }
});