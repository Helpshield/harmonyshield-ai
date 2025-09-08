// ScamShield Extension Popup
class PopupManager {
  constructor() {
    this.currentTab = null;
    this.scanResult = null;
    this.init();
  }

  async init() {
    await this.getCurrentTab();
    await this.loadPageStatus();
    this.setupEventListeners();
    this.loadStats();
  }

  async getCurrentTab() {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    this.currentTab = tab;
  }

  async loadPageStatus() {
    const loadingEl = document.getElementById('loading');
    const contentEl = document.getElementById('content');

    try {
      if (!this.currentTab?.url || this.isExcludedURL(this.currentTab.url)) {
        this.showStatus('safe', 'Protected Page', 'This page is automatically secure');
        return;
      }

      // Get scan result from background script
      const response = await chrome.runtime.sendMessage({
        type: 'GET_SCAN_RESULT',
        url: this.currentTab.url
      });

      if (response?.result) {
        this.scanResult = response.result;
        this.updateStatusFromResult(this.scanResult);
      } else {
        // Perform new scan
        await this.performScan();
      }
    } catch (error) {
      console.error('Error loading page status:', error);
      this.showStatus('safe', 'Unknown Status', 'Unable to scan this page');
    } finally {
      loadingEl.style.display = 'none';
      contentEl.style.display = 'block';
    }
  }

  async performScan() {
    try {
      const response = await fetch('https://hgqhgwdzsyqrjtthsmyg.supabase.co/functions/v1/url-scanner', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          url: this.currentTab.url,
          source: 'popup'
        })
      });

      if (response.ok) {
        this.scanResult = await response.json();
        this.updateStatusFromResult(this.scanResult);
      } else {
        throw new Error('Scan failed');
      }
    } catch (error) {
      this.showStatus('safe', 'Scan Failed', 'Unable to scan this page');
    }
  }

  updateStatusFromResult(result) {
    const { riskLevel, threats = [], recommendations = [] } = result;

    const statusConfig = {
      safe: {
        class: '',
        title: 'Page is Safe',
        desc: 'No threats detected'
      },
      low: {
        class: 'warning',
        title: 'Low Risk Detected',
        desc: `Potential issues: ${threats.slice(0, 2).join(', ')}`
      },
      medium: {
        class: 'warning',
        title: 'Medium Risk Detected',
        desc: `Security concerns: ${threats.slice(0, 2).join(', ')}`
      },
      high: {
        class: 'danger',
        title: 'High Risk Detected',
        desc: `Serious threats: ${threats.slice(0, 2).join(', ')}`
      },
      critical: {
        class: 'danger',
        title: 'Critical Risk Detected',
        desc: `Dangerous threats: ${threats.slice(0, 2).join(', ')}`
      }
    };

    const config = statusConfig[riskLevel] || statusConfig.safe;
    this.showStatus(config.class, config.title, config.desc);
  }

  showStatus(statusClass, title, description) {
    const statusCard = document.getElementById('status-card');
    const statusText = document.getElementById('status-text');
    const statusDesc = document.getElementById('status-desc');

    statusCard.className = `status-card ${statusClass}`;
    statusText.textContent = title;
    statusDesc.textContent = description;
  }

  async loadStats() {
    try {
      const stats = await chrome.storage.local.get(['threatsBlocked', 'scansToday']);
      
      document.getElementById('threats-blocked').textContent = stats.threatsBlocked || 0;
      document.getElementById('scans-today').textContent = stats.scansToday || 0;
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  }

  setupEventListeners() {
    document.getElementById('rescan-btn').addEventListener('click', async () => {
      document.getElementById('loading').style.display = 'block';
      document.getElementById('content').style.display = 'none';
      await this.performScan();
      document.getElementById('loading').style.display = 'none';
      document.getElementById('content').style.display = 'block';
    });

    document.getElementById('report-btn').addEventListener('click', () => {
      chrome.tabs.create({
        url: `https://hgqhgwdzsyqrjtthsmyg.lovable.app/reports?url=${encodeURIComponent(this.currentTab.url)}`
      });
    });

    document.getElementById('dashboard-btn').addEventListener('click', () => {
      chrome.tabs.create({
        url: 'https://hgqhgwdzsyqrjtthsmyg.lovable.app/dashboard'
      });
    });
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

// Initialize popup
document.addEventListener('DOMContentLoaded', () => {
  new PopupManager();
});