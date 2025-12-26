// Background service worker for Kadox AI Content Detector

// Create context menu on installation
chrome.runtime.onInstalled.addListener(() => {
  // Context menu for selected text
  chrome.contextMenus.create({
    id: "analyzeText",
    title: "Analyze AI-Generated Text",
    contexts: ["selection"]
  });

  // Context menu for images
  chrome.contextMenus.create({
    id: "analyzeImage",
    title: "Analyze AI-Generated Image",
    contexts: ["image"]
  });
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "analyzeText") {
    handleTextAnalysis(info, tab);
  } else if (info.menuItemId === "analyzeImage") {
    handleImageAnalysis(info, tab);
  }
});

// Handle text analysis
async function handleTextAnalysis(info, tab) {
  const selectedText = info.selectionText;
  
  if (!selectedText || selectedText.trim().length === 0) {
    showNotification("Please select some text to analyze");
    return;
  }

  // Send message to content script to show loading state
  chrome.tabs.sendMessage(tab.id, {
    action: "showLoading",
    type: "text"
  });

  try {
    // Call AI detection API
    const result = await analyzeTextWithAPI(selectedText);
    
    // Send result to content script
    chrome.tabs.sendMessage(tab.id, {
      action: "showResult",
      type: "text",
      data: result,
      originalText: selectedText
    });
  } catch (error) {
    chrome.tabs.sendMessage(tab.id, {
      action: "showError",
      type: "text",
      error: error.message
    });
  }
}

// Handle image analysis
async function handleImageAnalysis(info, tab) {
  const imageUrl = info.srcUrl;
  
  if (!imageUrl) {
    showNotification("Could not get image URL");
    return;
  }

  // Send message to content script to show loading state
  chrome.tabs.sendMessage(tab.id, {
    action: "showLoading",
    type: "image"
  });

  try {
    // Call AI detection API
    const result = await analyzeImageWithAPI(imageUrl);
    
    // Send result to content script
    chrome.tabs.sendMessage(tab.id, {
      action: "showResult",
      type: "image",
      data: result,
      imageUrl: imageUrl
    });
  } catch (error) {
    chrome.tabs.sendMessage(tab.id, {
      action: "showError",
      type: "image",
      error: error.message
    });
  }
}

// Analyze text using your AI Detector API
async function analyzeTextWithAPI(text) {
  // Get API endpoint from storage or use default
  const { apiEndpoint, apiKey } = await chrome.storage.sync.get(['apiEndpoint', 'apiKey']);
  
  const endpoint = apiEndpoint || 'https://your-api-endpoint.com/api/detect/text';
  
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': apiKey ? `Bearer ${apiKey}` : ''
    },
    body: JSON.stringify({
      text: text
    })
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }

  return await response.json();
}

// Analyze image using your AI Detector API
async function analyzeImageWithAPI(imageUrl) {
  // Get API endpoint from storage or use default
  const { apiEndpoint, apiKey } = await chrome.storage.sync.get(['apiEndpoint', 'apiKey']);
  
  const endpoint = apiEndpoint || 'https://your-api-endpoint.com/api/detect/image';
  
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': apiKey ? `Bearer ${apiKey}` : ''
    },
    body: JSON.stringify({
      imageUrl: imageUrl
    })
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }

  return await response.json();
}

// Show notification
function showNotification(message) {
  chrome.notifications.create({
    type: 'basic',
    iconUrl: 'icons/icon48.png',
    title: 'Kadox AI Detector',
    message: message
  });
}
