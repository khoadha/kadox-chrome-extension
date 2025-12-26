// Content script for Kadox AI Content Detector

// Listen for messages from background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "showLoading") {
    showLoadingModal(message.type);
  } else if (message.action === "showResult") {
    showResultModal(message.type, message.data, message.originalText || message.imageUrl);
  } else if (message.action === "showError") {
    showErrorModal(message.type, message.error);
  }
});

// Show loading modal
function showLoadingModal(type) {
  removeExistingModal();
  
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
  
  document.body.appendChild(modal);
}

// Show result modal
function showResultModal(type, data, content) {
  removeExistingModal();
  
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
        <img src="${content}" alt="Analyzed image" style="max-width: 100%; max-height: 200px; margin-top: 10px;">
      </div>
    `;
  }
  
  modal.innerHTML = `
    <div class="kadox-modal-content">
      <div class="kadox-modal-header">
        <h3>AI Detection Result</h3>
        <button class="kadox-close-btn" onclick="this.closest('.kadox-modal').remove()">×</button>
      </div>
      <div class="kadox-modal-body">
        ${contentPreview}
        <div class="kadox-result ${isAI ? 'ai-detected' : 'human-content'}">
          <div class="kadox-result-icon">
            ${isAI ? '🤖' : '👤'}
          </div>
          <div class="kadox-result-text">
            <h4>${isAI ? 'AI-Generated Content Detected' : 'Likely Human-Generated'}</h4>
            <p>Confidence: ${probability}%</p>
            ${data.details ? `<p class="kadox-details">${escapeHtml(data.details)}</p>` : ''}
          </div>
        </div>
        <div class="kadox-progress-bar">
          <div class="kadox-progress-fill ${isAI ? 'ai' : 'human'}" style="width: ${probability}%"></div>
        </div>
      </div>
      <div class="kadox-modal-footer">
        <button class="kadox-btn" onclick="this.closest('.kadox-modal').remove()">Close</button>
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

// Escape HTML to prevent XSS
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
