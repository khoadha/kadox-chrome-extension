// Content script for Kadox AI Content Detector// Listen for messages from background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {try {
    if (message.action === "showLoading") {showLoadingModal(message.type);
      sendResponse({ success: true });
    } else if (message.action === "showResult") {showResultModal(message.type, message.data, message.originalText || message.imageUrl, message.saved);
      sendResponse({ success: true });
    } else if (message.action === "showError") {showErrorModal(message.type, message.error);
      sendResponse({ success: true });
    } else if (message.action === "showLoginPrompt") {showLoginPromptModal(message.type, message.message);
      sendResponse({ success: true });
    }
  } catch (error) {sendResponse({ success: false, error: error.message });
  }
  
  return true; // Keep message channel open for async response
});

// Show loading modal
function showLoadingModal(type) {removeExistingModal();
  
  const modal = createModal();
  modal.innerHTML = `
    <div class="kadox-modal-content">
      <div class="kadox-modal-header">
        <h3>Analyzing ${type === 'text' ? 'Text' : 'Image'}...</h3>
        <button class="kadox-close-btn" onclick="this.closest('.kadox-modal').remove()">×</button>
      </div>
      <div class="kadox-modal-body">
        <div class="kadox-loader"></div>
        <p>Please wait while we analyze the content...</p>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);}

// Show result modal
function showResultModal(type, data, content, saved) {removeExistingModal();
  
  const modal = createModal();
  const isAI = data.isAI || data.probability > 0.5;
  const probability = data.probability ? (data.probability * 100).toFixed(1) : 'N/A';
  
  let contentPreview = '';
  if (type === 'text') {
    contentPreview = `
      <div class="kadox-content-preview">
        <strong>Analyzed Text:</strong>
        <p>${escapeHtml(content.substring(0, 200))}${content.length > 200 ? '...' : ''}</p>
      </div>
    `;
  } else {
    contentPreview = `
      <div class="kadox-content-preview">
        <strong>Analyzed Image:</strong>
        <img src="${content}" alt="Analyzed image" style="max-width: 100%; max-height: 200px; margin-top: 10px; border-radius: 8px;">
      </div>
    `;
  }
  
  // Build reasons section for images
  let reasonsHtml = '';
  if (type === 'image' && data.reasons && data.reasons.length > 0) {
    reasonsHtml = `
      <div class="kadox-reasons">
        <strong>Analysis Details:</strong>
        <ul>
          ${data.reasons.map(reason => `<li>${escapeHtml(reason)}</li>`).join('')}
        </ul>
      </div>
    `;
  }
  
  // Build detailed stats for images
  let statsHtml = '';
  if (type === 'image' && data.aiProbability) {
    statsHtml = `
      <div class="kadox-stats">
        <div class="kadox-stat-item">
          <span class="kadox-stat-label">AI Probability:</span>
          <span class="kadox-stat-value ai">${data.aiProbability}</span>
        </div>
        <div class="kadox-stat-item">
          <span class="kadox-stat-label">Real Probability:</span>
          <span class="kadox-stat-value human">${data.realProbability}</span>
        </div>
        ${data.predictedResult ? `
        <div class="kadox-stat-item">
          <span class="kadox-stat-label">Type:</span>
          <span class="kadox-stat-value">${escapeHtml(data.predictedResult)}</span>
        </div>
        ` : ''}
      </div>
    `;
  }
  
  // Remaining requests (only for anonymous users)
  let remainingHtml = '';
  if (data.remainingRequests !== undefined && data.remainingRequests !== null) {
    remainingHtml = `<p class="kadox-remaining">Remaining requests: ${data.remainingRequests}</p>`;
  }
  
  // Saved notification
  let savedBadge = '';
  if (saved) {
    savedBadge = `
      <div class="kadox-saved-badge">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
        Saved to your history
      </div>
    `;
  }
  
  modal.innerHTML = `
    <div class="kadox-modal-content">
      <div class="kadox-modal-header">
        <h3>🤖 Kadox AI Detection Result</h3>
        <button class="kadox-close-btn" onclick="this.closest('.kadox-modal').remove()">×</button>
      </div>
      <div class="kadox-modal-body">
        ${contentPreview}
        <div class="kadox-result ${isAI ? 'ai-detected' : 'human-content'}">
          <div class="kadox-result-icon">
            ${isAI ? '<img src="https://blobcuakhoa.blob.core.windows.net/files/black.png" alt="AI" style="width: 48px; height: 48px; object-fit: contain;">' : '👤'}
          </div>
          <div class="kadox-result-text">
            <h4>${isAI ? 'AI-Generated Content Detected' : 'Likely Human-Generated'}</h4>
            <p>Confidence: ${probability}%</p>
            ${remainingHtml}
          </div>
        </div>
        <div class="kadox-progress-bar">
          <div class="kadox-progress-fill ${isAI ? 'ai' : 'human'}" style="width: ${probability}%"></div>
        </div>
        ${statsHtml}
        ${reasonsHtml}
        ${savedBadge}
      </div>
      <div class="kadox-modal-footer">
        <button class="kadox-btn kadox-btn-primary" onclick="this.closest('.kadox-modal').remove()">Close</button>
      </div>
    </div>
  `;  
  document.body.appendChild(modal);
}

// Show error modal
function showErrorModal(type, error) {
  removeExistingModal();
  
  const modal = createModal();
  modal.innerHTML = `
    <div class="kadox-modal-content">
      <div class="kadox-modal-header">
        <h3>Error</h3>
        <button class="kadox-close-btn" onclick="this.closest('.kadox-modal').remove()">×</button>
      </div>
      <div class="kadox-modal-body">
        <div class="kadox-error">
          <p>❌ Failed to analyze ${type}</p>
          <p class="kadox-error-message">${escapeHtml(error)}</p>
        </div>
      </div>
      <div class="kadox-modal-footer">
        <button class="kadox-btn" onclick="this.closest('.kadox-modal').remove()">Close</button>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
}

// Create modal element
function createModal() {
  const modal = document.createElement('div');
  modal.className = 'kadox-modal';
  modal.id = 'kadox-ai-detector-modal';
  
  // Close modal when clicking outside
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.remove();
    }
  });
  
  return modal;
}

// Remove existing modal
function removeExistingModal() {
  const existingModal = document.getElementById('kadox-ai-detector-modal');
  if (existingModal) {
    existingModal.remove();
  }
}

// Show login prompt modal
function showLoginPromptModal(type, customMessage) {removeExistingModal();
  
  const defaultMessage = 'You\'ve used all your free requests. Please sign in with your User ID to continue using Kadox AI Detector.';
  const message = customMessage || defaultMessage;
  
  const modal = createModal();
  modal.innerHTML = `
    <div class="kadox-modal-content" style="max-width: 420px;">
      <div class="kadox-modal-header">
        <h3>⚠️ Usage Limit Reached</h3>
        <button class="kadox-close-btn" onclick="this.closest('.kadox-modal').remove()">×</button>
      </div>
      <div class="kadox-modal-body">
        <div style="text-align: center; margin-bottom: 20px;">
          <img src="https://blobcuakhoa.blob.core.windows.net/files/black.png" alt="Kadox" style="width: 64px; height: 64px; object-fit: contain; margin-bottom: 16px;">
        </div>
        <p style="margin-bottom: 20px; color: #595959;">${escapeHtml(message)}</p>
        <div style="margin-bottom: 15px;">
          <label style="display: block; margin-bottom: 8px; font-weight: 500; color: #262626;">User ID:</label>
          <input type="text" id="kadox-userId-input" placeholder="Enter your User ID" style="width: 100%; padding: 8px 12px; border: 1px solid #d9d9d9; border-radius: 2px; font-size: 14px;">
        </div>
        <button class="kadox-btn kadox-btn-primary" onclick="kadoxSubmitUserId()" style="width: 100%;">Sign In</button>
        <p style="margin-top: 15px; font-size: 12px; color: #8c8c8c; text-align: center;">
          Don't have a User ID? <a href="https://kadox.io.vn" target="_blank" style="color: #1890ff;">Get one here</a>
        </p>
        <p style="margin-top: 8px; font-size: 12px; text-align: center;">
          <a href="#" onclick="kadoxShowUserIdGuide(); return false;" style="color: #1890ff; text-decoration: none;">❓ How to get your User ID?</a>
        </p>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  // Focus on input
  setTimeout(() => {
    document.getElementById('kadox-userId-input')?.focus();
  }, 100);
}

// Submit user ID (called from modal)
window.kadoxSubmitUserId = async function() {
  const input = document.getElementById('kadox-userId-input');
  const userId = input?.value?.trim();
  
  if (!userId) {
    alert('Please enter a valid User ID');
    return;
  }
  
  // Save to storage
  chrome.storage.sync.set({ userId }, () => {
    removeExistingModal();
    
    // Show success modal
    const modal = createModal();
    modal.innerHTML = `
      <div class="kadox-modal-content" style="max-width: 380px;">
        <div class="kadox-modal-header">
          <h3>✅ Success!</h3>
          <button class="kadox-close-btn" onclick="this.closest('.kadox-modal').remove()">×</button>
        </div>
        <div class="kadox-modal-body" style="text-align: center; padding: 30px 20px;">
          <p style="font-size: 16px; color: #262626; margin-bottom: 20px;">You've been signed in successfully!</p>
          <p style="color: #8c8c8c;">You can now continue using Kadox AI Detector.</p>
          <button class="kadox-btn kadox-btn-primary" onclick="this.closest('.kadox-modal').remove()" style="margin-top: 20px;">OK</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  });
};

// Show User ID guide (called from modal)
window.kadoxShowUserIdGuide = function() {
  removeExistingModal();
  
  const modal = createModal();
  modal.innerHTML = `
    <div class="kadox-modal-content" style="max-width: 600px;">
      <div class="kadox-modal-header">
        <h3>📖 How to Get Your User ID</h3>
        <button class="kadox-close-btn" onclick="this.closest('.kadox-modal').remove()">×</button>
      </div>
      <div class="kadox-modal-body" style="padding: 24px;">
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
      <div class="kadox-modal-footer">
        <button class="kadox-btn" onclick="kadoxBackToLogin()" style="margin-right: 8px;">Back</button>
        <button class="kadox-btn kadox-btn-primary" onclick="window.open('https://kadox.io.vn/app/profile', '_blank')">Open Profile Page</button>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
};

// Go back to login modal
window.kadoxBackToLogin = function() {
  removeExistingModal();
  
  const modal = createModal();
  modal.innerHTML = `
    <div class="kadox-modal-content" style="max-width: 420px;">
      <div class="kadox-modal-header">
        <h3>⚠️ Usage Limit Reached</h3>
        <button class="kadox-close-btn" onclick="this.closest('.kadox-modal').remove()">×</button>
      </div>
      <div class="kadox-modal-body">
        <div style="text-align: center; margin-bottom: 20px;">
          <img src="https://blobcuakhoa.blob.core.windows.net/files/black.png" alt="Kadox" style="width: 64px; height: 64px; object-fit: contain; margin-bottom: 16px;">
        </div>
        <p style="margin-bottom: 20px; color: #595959;">You've used all your free requests. Please sign in with your User ID to continue using Kadox AI Detector.</p>
        <div style="margin-bottom: 15px;">
          <label style="display: block; margin-bottom: 8px; font-weight: 500; color: #262626;">User ID:</label>
          <input type="text" id="kadox-userId-input" placeholder="Enter your User ID" style="width: 100%; padding: 8px 12px; border: 1px solid #d9d9d9; border-radius: 2px; font-size: 14px;">
        </div>
        <button class="kadox-btn kadox-btn-primary" onclick="kadoxSubmitUserId()" style="width: 100%;">Sign In</button>
        <p style="margin-top: 15px; font-size: 12px; color: #8c8c8c; text-align: center;">
          Don't have a User ID? <a href="https://kadox.io.vn" target="_blank" style="color: #1890ff;">Get one here</a>
        </p>
        <p style="margin-top: 8px; font-size: 12px; text-align: center;">
          <a href="#" onclick="kadoxShowUserIdGuide(); return false;" style="color: #1890ff; text-decoration: none;">❓ How to get your User ID?</a>
        </p>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  setTimeout(() => {
    document.getElementById('kadox-userId-input')?.focus();
  }, 100);
};

// Escape HTML to prevent XSS
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}