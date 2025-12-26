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
async function handleTextAnalysis(info, tab) {const selectedText = info.selectionText;
  
  if (!selectedText || selectedText.trim().length === 0) {
    showNotification("Please select some text to analyze");
    return;
  }// Get userId and saveHistory once at the start
  const { userId, saveHistory } = await chrome.storage.sync.get(['userId', 'saveHistory']);

  try {
    // Send message to content script to show loading state
    await chrome.tabs.sendMessage(tab.id, {
      action: "showLoading",
      type: "text"
    });

    // Call AI detection API
    const result = await analyzeTextWithAPI(selectedText);// Send result to content script
    try {
      const response = await chrome.tabs.sendMessage(tab.id, {
        action: "showResult",
        type: "text",
        data: result,
        originalText: selectedText,
        saved: userId && (saveHistory !== false)
      });} catch (msgError) {showNotification(`Analysis complete! AI probability: ${(result.probability * 100).toFixed(1)}%`);
    }
    
    // Save to recent activity
    await saveToRecentActivity({
      type: 'text',
      isAI: result.isAI,
      confidence: (result.probability * 100).toFixed(1),
      timestamp: Date.now()
    });} catch (error) {// Check if daily limit exceeded
    if (error.message === 'DAILY_LIMIT_EXCEEDED') {
      try {
        await chrome.tabs.sendMessage(tab.id, {
          action: "showLoginPrompt",
          type: "text",
          message: 'You have reached your daily limit for text analysis (10/day). Please sign in with your User ID for unlimited usage.'
        });
      } catch (msgError) {
        showNotification('Daily limit reached. Please sign in for unlimited usage.');
      }
    } else if (error.message === 'REQUESTS_EXPIRED') {
      try {
        await chrome.tabs.sendMessage(tab.id, {
          action: "showLoginPrompt",
          type: "text",
          message: 'Your free requests have expired. Please sign in with your User ID to continue.'
        });
      } catch (msgError) {
        showNotification('Your free requests have expired. Please sign in with your User ID.');
      }
    } else {
      try {
        await chrome.tabs.sendMessage(tab.id, {
          action: "showError",
          type: "text",
          error: error.message
        });
      } catch (msgError) {showNotification(`Error: ${error.message}`);
      }
    }
  }
}

// Handle image analysis
async function handleImageAnalysis(info, tab) {const imageUrl = info.srcUrl;
  
  if (!imageUrl) {
    showNotification("Could not get image URL");
    return;
  }// Get userId and saveHistory once at the start
  const { userId, saveHistory } = await chrome.storage.sync.get(['userId', 'saveHistory']);

  try {
    // Send message to content script to show loading state
    await chrome.tabs.sendMessage(tab.id, {
      action: "showLoading",
      type: "image"
    });

    // Call AI detection API
    const result = await analyzeImageWithAPI(imageUrl);// Send result to content script
    try {
      const response = await chrome.tabs.sendMessage(tab.id, {
        action: "showResult",
        type: "image",
        data: result,
        imageUrl: imageUrl,
        saved: userId && (saveHistory !== false)
      });} catch (msgError) {showNotification(`Analysis complete! AI probability: ${result.aiProbability || (result.probability * 100).toFixed(1) + '%'}`);
    }
    
    // Save to recent activity
    await saveToRecentActivity({
      type: 'image',
      isAI: result.isAI,
      confidence: (result.probability * 100).toFixed(1),
      timestamp: Date.now()
    });} catch (error) {// Check if daily limit exceeded
    if (error.message === 'DAILY_LIMIT_EXCEEDED') {
      try {
        await chrome.tabs.sendMessage(tab.id, {
          action: "showLoginPrompt",
          type: "image",
          message: 'You have reached your daily limit for image analysis (3/day). Please sign in with your User ID for unlimited usage.'
        });
      } catch (msgError) {
        showNotification('Daily limit reached. Please sign in for unlimited usage.');
      }
    } else if (error.message === 'REQUESTS_EXPIRED') {
      try {
        await chrome.tabs.sendMessage(tab.id, {
          action: "showLoginPrompt",
          type: "image",
          message: 'Your free requests have expired. Please sign in with your User ID to continue.'
        });
      } catch (msgError) {
        showNotification('Your free requests have expired. Please sign in with your User ID.');
      }
    } else {
      try {
        await chrome.tabs.sendMessage(tab.id, {
          action: "showError",
          type: "image",
          error: error.message
        });
      } catch (msgError) {showNotification(`Error: ${error.message}`);
      }
    }
  }
}

// Analyze text using your AI Detector API
async function analyzeTextWithAPI(text) {
  // Get deviceId, userId, and saveHistory
  const { deviceId, userId, saveHistory } = await chrome.storage.sync.get(['deviceId', 'userId', 'saveHistory']);
  let userDeviceId = deviceId;
  if (!userDeviceId) {
    userDeviceId = generateDeviceId();
    await chrome.storage.sync.set({ deviceId: userDeviceId });
  }
  
  // Check anonymous usage limits
  if (!userId) {
    const canUse = await checkAnonymousLimit('text');
    if (!canUse) {
      throw new Error('DAILY_LIMIT_EXCEEDED');
    }
  }// Use extension endpoint if userId exists, otherwise use anonymous endpoint
  const endpoint = userId 
    ? 'https://kadox-server-production.up.railway.app/api/detect/text/extension'
    : 'https://kadox-server-production.up.railway.app/api/detect/text/anonymous';
  
  const requestBody = {
    content: text
  };
  
  // Add deviceId for anonymous, or userId and isSave for signed-in
  if (userId) {
    requestBody.userId = userId;
    requestBody.isSave = saveHistory !== false; // default true
  } else {
    requestBody.deviceId = userDeviceId;
  }
  
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json, text/plain, */*',
      'X-ClientId': userDeviceId
    },
    body: JSON.stringify(requestBody)
  });

  if (!response.ok) {
    let errorMessage = `API Error: ${response.status}`;
    try {
      const errorData = await response.json();
      
      // Extract detailed error message
      if (errorData.errors?.generalErrors?.[0]) {
        errorMessage = errorData.errors.generalErrors[0];
      } else if (errorData.message) {
        errorMessage = errorData.message;
      }
    } catch (e) {
      const errorText = await response.text();
    }
    throw new Error(errorMessage);
  }

  const data = await response.json();
  
  // Store remaining requests from API response
  if (data.remainingRequests !== undefined) {
    await chrome.storage.local.set({ 
      textRemainingRequests: data.remainingRequests,
      lastTextRequestDate: new Date().toDateString()
    });
  }
  
  // Transform response to match expected format
  return {
    isAI: data.prediction > 0.5,
    probability: data.prediction,
    remainingRequests: data.remainingRequests || null,
    details: `AI Probability: ${(data.prediction * 100).toFixed(2)}%`
  };
}

// Analyze image using your AI Detector API
async function analyzeImageWithAPI(imageUrl) {
  // Get deviceId, userId, and saveHistory
  const { deviceId, userId, saveHistory } = await chrome.storage.sync.get(['deviceId', 'userId', 'saveHistory']);
  let userDeviceId = deviceId;
  if (!userDeviceId) {
    userDeviceId = generateDeviceId();
    await chrome.storage.sync.set({ deviceId: userDeviceId });
  }
  
  // Check anonymous usage limits
  if (!userId) {
    const canUse = await checkAnonymousLimit('image');
    if (!canUse) {
      throw new Error('DAILY_LIMIT_EXCEEDED');
    }
  }
  
  try {
    // Fetch the image as a blob
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      throw new Error('Failed to fetch image');
    }
    const imageBlob = await imageResponse.blob();
    
    // Use extension endpoint if userId exists, otherwise use anonymous endpoint
    const endpoint = userId 
      ? 'https://kadox-server-production.up.railway.app/api/detect/image/extension'
      : 'https://kadox-server-production.up.railway.app/api/detect/image/anonymous';
    
    // Create form data
    const formData = new FormData();
    formData.append('Image', imageBlob, 'image.png');
    
    // Add deviceId for anonymous, or userId and isSave for signed-in
    if (userId) {
      formData.append('UserId', userId);
      formData.append('IsSave', saveHistory !== false ? 'true' : 'false'); // default true
    } else {
      formData.append('DeviceId', userDeviceId);
    }
    
    // Send to API
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Accept': 'application/json, text/plain, */*',
        'X-ClientId': userDeviceId
      },
      body: formData
    });

    if (!response.ok) {
      let errorMessage = `API Error: ${response.status}`;
      try {
        const errorData = await response.json();
        
        // Extract detailed error message
        if (errorData.errors?.generalErrors?.[0]) {
          errorMessage = errorData.errors.generalErrors[0];
        } else if (errorData.message) {
          errorMessage = errorData.message;
        }
      } catch (e) {
        const errorText = await response.text();
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    
    // Store remaining requests from API response
    if (data.remainingRequests !== undefined) {
      await chrome.storage.local.set({ 
        imageRemainingRequests: data.remainingRequests,
        lastImageRequestDate: new Date().toDateString()
      });
    }
    
    // Transform response to match expected format
    const aiProbability = parseFloat(data.aiProbability) / 100;
    return {
      isAI: aiProbability > 0.5,
      probability: aiProbability,
      aiProbability: data.aiProbability,
      realProbability: data.realProbability,
      predictedResult: data.predictedResult,
      reasons: data.reasons,
      remainingRequests: data.remainingRequests || null,
      details: `AI: ${data.aiProbability} | Real: ${data.realProbability} | Type: ${data.predictedResult}`
    };
  } catch (error) {throw new Error(`Failed to analyze image: ${error.message}`);
  }
}

// Check anonymous usage limits (check API response, not local count)
async function checkAnonymousLimit(type) {
  // We'll rely on API error responses instead of pre-checking
  // The API knows the actual limits and will return appropriate errors
  return true;
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

// Save to recent activity
async function saveToRecentActivity(activity) {
  try {
    const { recentActivity } = await chrome.storage.local.get(['recentActivity']);
    const activities = recentActivity || [];
    
    // Add new activity at the beginning
    activities.unshift(activity);
    
    // Keep only last 10 activities
    if (activities.length > 10) {
      activities.pop();
    }
    
    await chrome.storage.local.set({ recentActivity: activities });} catch (error) {}
}

// Show notification
function showNotification(message) {
  chrome.notifications.create({
    type: 'basic',
    iconUrl: 'https://blobcuakhoa.blob.core.windows.net/files/black.png',
    title: 'Kadox AI Detector',
    message: message
  });
}