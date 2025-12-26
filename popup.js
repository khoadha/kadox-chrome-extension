// Popup script for Kadox AI Content Detector

document.addEventListener('DOMContentLoaded', () => {
  loadSettings();
  loadRecentActivity();
  
  // Save settings button
  document.getElementById('saveSettings').addEventListener('click', saveSettings);
});

// Load saved settings
async function loadSettings() {
  const settings = await chrome.storage.sync.get(['apiEndpointText', 'apiEndpointImage', 'apiKey']);
  
  if (settings.apiEndpointText) {
    document.getElementById('apiEndpointText').value = settings.apiEndpointText;
  }
  
  if (settings.apiEndpointImage) {
    document.getElementById('apiEndpointImage').value = settings.apiEndpointImage;
  }
  
  if (settings.apiKey) {
    document.getElementById('apiKey').value = settings.apiKey;
  }
}

// Save settings
async function saveSettings() {
  const apiEndpointText = document.getElementById('apiEndpointText').value.trim();
  const apiEndpointImage = document.getElementById('apiEndpointImage').value.trim();
  const apiKey = document.getElementById('apiKey').value.trim();
  
  await chrome.storage.sync.set({
    apiEndpointText,
    apiEndpointImage,
    apiKey
  });
  
  showStatus('Settings saved successfully!', 'success');
}

// Show status message
function showStatus(message, type) {
  const statusElement = document.getElementById('saveStatus');
  statusElement.textContent = message;
  statusElement.className = `status ${type}`;
  
  setTimeout(() => {
    statusElement.style.display = 'none';
  }, 3000);
}

// Load recent activity
async function loadRecentActivity() {
  const { recentActivity } = await chrome.storage.local.get(['recentActivity']);
  const activityContainer = document.getElementById('recentActivity');
  
  if (!recentActivity || recentActivity.length === 0) {
    activityContainer.innerHTML = '<p class="empty-state">No recent analysis</p>';
    return;
  }
  
  activityContainer.innerHTML = '';
  
  // Show last 5 activities
  recentActivity.slice(0, 5).forEach(activity => {
    const item = document.createElement('div');
    item.className = `activity-item ${activity.isAI ? 'ai' : 'human'}`;
    
    const time = new Date(activity.timestamp).toLocaleString();
    
    item.innerHTML = `
      <div class="type">${activity.type}</div>
      <div class="result">${activity.isAI ? '🤖 AI-Generated' : '👤 Human-Generated'} (${activity.confidence}%)</div>
      <div class="time">${time}</div>
    `;
    
    activityContainer.appendChild(item);
  });
}

// Listen for storage changes to update recent activity
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'local' && changes.recentActivity) {
    loadRecentActivity();
  }
});
