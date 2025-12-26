// Popup script for Kadox AI Content Detector

document.addEventListener('DOMContentLoaded', () => {
  loadUserStatus();
  loadRecentActivity();
  
  // Login button
  document.getElementById('loginBtn').addEventListener('click', showLoginPrompt);
  
  // How to get User ID link
  document.getElementById('howToGetUserId').addEventListener('click', (e) => {
    e.preventDefault();
    showUserIdGuide();
  });
  
  // Logout button
  document.getElementById('logoutBtn').addEventListener('click', logout);
  
  // Update usage stats periodically
  setInterval(updateUsageStats, 5000);
});

// Load user status
async function loadUserStatus() {
  const { userId, deviceId, saveHistory } = await chrome.storage.sync.get(['userId', 'deviceId', 'saveHistory']);
  
  // Ensure device ID exists
  if (!deviceId) {
    const newDeviceId = generateDeviceId();
    await chrome.storage.sync.set({ deviceId: newDeviceId });
  }
  
  // Update UI based on login status
  if (userId) {
    document.getElementById('accountType').textContent = 'Signed In';
    document.getElementById('accountType').style.color = '#52c41a';
    document.getElementById('loginBtn').style.display = 'none';
    document.getElementById('logoutBtn').style.display = 'block';
    document.getElementById('anonymousStats').style.display = 'none';
    document.getElementById('saveHistoryWrapper').style.display = 'inline-flex';
    
    // Set save history checkbox
    document.getElementById('saveHistory').checked = saveHistory !== false; // default true
  } else {
    document.getElementById('accountType').textContent = 'Anonymous';
    document.getElementById('accountType').style.color = 'rgba(0, 0, 0, 0.85)';
    document.getElementById('loginBtn').style.display = 'block';
    document.getElementById('logoutBtn').style.display = 'none';
    document.getElementById('anonymousStats').style.display = 'block';
    document.getElementById('saveHistoryWrapper').style.display = 'none';
  }
  
  // Load usage stats
  updateUsageStats();
  
  // Save history checkbox listener
  document.getElementById('saveHistory').addEventListener('change', async (e) => {
    await chrome.storage.sync.set({ saveHistory: e.target.checked });
  });
}

// Show login prompt
async function showLoginPrompt() {
  const userId = prompt('Please enter your User ID to continue using Kadox AI Detector:');
  
  if (userId && userId.trim()) {
    await chrome.storage.sync.set({ userId: userId.trim() });
    loadUserStatus();
    showNotification('Signed in successfully!');
  }
}

// Logout
async function logout() {
  await chrome.storage.sync.remove('userId');
  loadUserStatus();
  showNotification('Signed out successfully');
}

// Update usage stats
async function updateUsageStats() {
  const { userId, textRemainingRequests, imageRemainingRequests, lastTextRequestDate, lastImageRequestDate } = await chrome.storage.local.get([
    'userId', 
    'textRemainingRequests', 
    'imageRemainingRequests',
    'lastTextRequestDate',
    'lastImageRequestDate'
  ]);
  
  if (userId) {
    // Signed in users have unlimited usage
    return;
  }
  
  // Anonymous users - use API response data
  const today = new Date().toDateString();
  const textCountEl = document.getElementById('textCount');
  const imageCountEl = document.getElementById('imageCount');
  
  // Text remaining (reset if new day)
  let textRemaining = 10;
  if (lastTextRequestDate === today && textRemainingRequests !== undefined) {
    textRemaining = textRemainingRequests;
  }
  
  // Image remaining (reset if new day)
  let imageRemaining = 3;
  if (lastImageRequestDate === today && imageRemainingRequests !== undefined) {
    imageRemaining = imageRemainingRequests;
  }
  
  textCountEl.textContent = `${textRemaining}/10`;
  imageCountEl.textContent = `${imageRemaining}/3`;
  
  // Color coding for text
  if (textRemaining === 0) {
    textCountEl.style.color = '#ff4d4f';
  } else if (textRemaining <= 3) {
    textCountEl.style.color = '#faad14';
  } else {
    textCountEl.style.color = '#52c41a';
  }
  
  // Color coding for image
  if (imageRemaining === 0) {
    imageCountEl.style.color = '#ff4d4f';
  } else if (imageRemaining <= 1) {
    imageCountEl.style.color = '#faad14';
  } else {
    imageCountEl.style.color = '#52c41a';
  }
}

// Generate a unique device ID
function generateDeviceId() {
  const characters = '0123456789abcdef';
  let deviceId = '';
  for (let i = 0; i < 17; i++) {
    deviceId += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return deviceId;
}

// Show notification
function showNotification(message) {
  const statusDiv = document.createElement('div');
  statusDiv.className = 'ant-message';
  statusDiv.style.cssText = 'position: fixed; top: 16px; left: 50%; transform: translateX(-50%); background: white; padding: 10px 16px; border-radius: 2px; box-shadow: 0 3px 6px -4px rgba(0,0,0,.12), 0 6px 16px 0 rgba(0,0,0,.08); z-index: 9999;';
  statusDiv.textContent = message;
  document.body.appendChild(statusDiv);
  
  setTimeout(() => {
    statusDiv.remove();
  }, 3000);
}



// Load recent activity
async function loadRecentActivity() {
  const { recentActivity } = await chrome.storage.local.get(['recentActivity']);
  const activityContainer = document.getElementById('recentActivity');
  
  if (!recentActivity || recentActivity.length === 0) {
    activityContainer.innerHTML = `
      <div class="ant-empty">
        <div class="ant-empty-image">📊</div>
        <p class="ant-empty-description">No recent analysis</p>
      </div>
    `;
    return;
  }
  
  activityContainer.innerHTML = '';
  
  // Show last 5 activities
  recentActivity.slice(0, 5).forEach(activity => {
    const item = document.createElement('div');
    item.className = 'ant-list-item';
    
    const time = new Date(activity.timestamp).toLocaleString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
    
    const iconSvg = activity.type === 'text' 
      ? '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>'
      : '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>';
    
    const badgeClass = activity.isAI ? 'ant-badge-warning' : 'ant-badge-success';
    const badgeText = activity.isAI ? 'AI' : 'Human';
    
    item.innerHTML = `
      <div class="ant-list-item-meta">
        <div class="ant-list-item-meta-avatar" style="color: #1890ff;">${iconSvg}</div>
        <div class="ant-list-item-meta-content">
          <div class="ant-list-item-meta-title">
            ${activity.type === 'text' ? 'Text Analysis' : 'Image Analysis'}
            <span class="ant-badge ${badgeClass}" style="margin-left: 8px;">${badgeText} ${activity.confidence}%</span>
          </div>
          <div class="ant-list-item-meta-description">${time}</div>
        </div>
      </div>
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

// Show User ID guide modal
function showUserIdGuide() {
  // Create overlay
  const overlay = document.createElement('div');
  overlay.id = 'userIdGuideOverlay';
  overlay.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.45); z-index: 9999; display: flex; align-items: center; justify-content: center;';
  
  // Create modal
  const modal = document.createElement('div');
  modal.style.cssText = 'background: white; border-radius: 2px; box-shadow: 0 3px 6px -4px rgba(0,0,0,.12); max-width: 500px; width: 90%; max-height: 80vh; overflow-y: auto;';
  
  modal.innerHTML = `
    <div style="padding: 16px 24px; border-bottom: 1px solid #f0f0f0; display: flex; justify-content: space-between; align-items: center;">
      <h3 style="margin: 0; font-size: 16px; font-weight: 500;">📖 How to Get Your User ID</h3>
      <button id="closeGuideBtn" style="background: none; border: none; font-size: 20px; cursor: pointer; color: rgba(0,0,0,0.45);">×</button>
    </div>
    <div style="padding: 24px;">
      <div style="background: #f0f2f5; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
        <h4 style="margin: 0 0 15px 0; font-size: 15px; color: #262626; font-weight: 500;">Follow these steps:</h4>
        <ol style="margin: 0; padding-left: 20px; line-height: 1.8;">
          <li style="margin-bottom: 8px;">Create an account at <a href="https://kadox.io.vn" target="_blank" style="color: #1890ff;">kadox.io.vn</a></li>
          <li style="margin-bottom: 8px;">Log in to your account</li>
          <li style="margin-bottom: 8px;">Go to: <a href="https://kadox.io.vn/app/profile" target="_blank" style="color: #1890ff;">kadox.io.vn/app/profile</a></li>
          <li style="margin-bottom: 8px;">Your <strong>User ID</strong> is located below the profile image</li>
        </ol>
      </div>
      
    </div>
    <div style="padding: 10px 16px; border-top: 1px solid #f0f0f0; display: flex; justify-content: flex-end; gap: 8px;">
      <button id="openProfileBtn" class="ant-btn ant-btn-primary" style="height: 32px; padding: 4px 15px; font-size: 14px; border-radius: 2px; border: 1px solid #1890ff; background: #1890ff; color: white; cursor: pointer;">
        Open Profile Page
      </button>
    </div>
  `;
  
  overlay.appendChild(modal);
  document.body.appendChild(overlay);
  
  // Close button handler
  document.getElementById('closeGuideBtn').addEventListener('click', () => {
    overlay.remove();
  });
  
  // Click outside to close
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      overlay.remove();
    }
  });
  
  // Open profile button handler
  document.getElementById('openProfileBtn').addEventListener('click', () => {
    window.open('https://kadox.io.vn/app/profile', '_blank');
  });
}