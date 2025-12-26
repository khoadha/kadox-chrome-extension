# Kadox AI Content Detector - Chrome Extension

A Chrome extension that allows users to detect AI-generated text and images directly from their browser using right-click context menus.

## Features

- **Text Analysis**: Highlight any text on a webpage, right-click, and analyze if it's AI-generated
- **Image Analysis**: Right-click on any image to check if it's AI-generated
- **Visual Results**: Beautiful Ant Design modals showing detection confidence and details
- **Anonymous Usage**: 10 text analyses and 3 image analyses per day for anonymous users
- **User Authentication**: Sign in with User ID for unlimited usage
- **Save History**: Toggle to save analysis results to your account history (signed-in users only)
- **Activity Tracking**: View recent analysis history in the popup

## Installation

### Quick Setup

1. Download or clone this repository
2. **Set up the icon:**
   - Download icon from: https://blobcuakhoa.blob.core.windows.net/files/black.png
   - Create `icons/` folder
   - Save as `icon16.png`, `icon48.png`, and `icon128.png` (can use same file)
   - Update `manifest.json` to include icon paths (see ICON_SETUP.md)
3. Open Chrome and go to `chrome://extensions/`
4. Turn ON "Developer mode" (toggle in the top right corner)
5. Click "Load unpacked" button
6. Select the extension folder
7. Done! The extension is ready to use

## Usage

### Anonymous Usage
- **10 text analyses per day** (resets daily)
- **3 image analyses per day** (resets daily)
- No sign-in required

### Signed-In Usage
- **Unlimited analyses**
- **Save to History option** (toggle in popup)
- Sign in with your User ID from https://kadox.io.vn

### Analyzing Content

**For Text:**
1. Highlight text on any webpage
2. Right-click on the selected text
3. Select "Analyze AI-Generated Text"
4. Wait for the analysis results

**For Images:**
1. Right-click on any image on a webpage
2. Select "Analyze AI-Generated Image"
3. Wait for the analysis results

## API Integration

The extension is configured to work with Kadox AI Detection API:

### Text Detection API

**Anonymous Endpoint**: `POST https://kadox-server-production.up.railway.app/api/detect/text/anonymous`

**Request Body (Anonymous)**:
```json
{
  "content": "The text content to analyze...",
  "deviceId": "auto-generated-device-id"
}
```

**Extension Endpoint** (Signed-In): `POST https://kadox-server-production.up.railway.app/api/detect/text/extension`

**Request Body (Signed-In)**:
```json
{
  "content": "The text content to analyze...",
  "userId": "user-id-from-signin",
  "isSave": true
}
```

**Response**:
```json
{
  "prediction": 0.5344047660104316,
  "remainingRequests": 8
}
```

### Image Detection API

**Anonymous Endpoint**: `POST https://kadox-server-production.up.railway.app/api/detect/image/anonymous`

**Request (Anonymous)**: multipart/form-data
```
Image: Image file (blob)
DeviceId: Device ID string
```

**Extension Endpoint** (Signed-In): `POST https://kadox-server-production.up.railway.app/api/detect/image/extension`

**Request (Signed-In)**: multipart/form-data
```
Image: Image file (blob)
UserId: User ID from signin
IsSave: "true" or "false"
```

**Response**:
```json
{
  "aiProbability": "93.73%",
  "realProbability": "6.27%",
  "predictedResult": "artical",
  "reasons": [
    "😊 Face and Expression...",
    "💇 Hair Detail...",
    "📱 Device and Hand Interaction...",
    "🧥 Clothing and Texture...",
    "🖼️ Background and Overall Composition..."
  ],
  "remainingRequests": 1
}
```

## Project Structure

```
Kadox.ChromeExtension/
├── manifest.json          # Extension configuration
├── background.js          # Service worker for context menus and API calls
├── content.js            # Content script for displaying results
├── content.css           # Ant Design styles for modals
├── popup.html            # Extension popup UI
├── popup.css             # Ant Design styles for popup
├── popup.js              # Popup functionality
├── icons/                # Extension icons (you need to add these)
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
└── README.md             # This file
```

## Limitations

### Facebook and Protected Sites
The extension may not work on some websites like Facebook due to:
- **Content Security Policy (CSP)**: These sites block external scripts for security
- **Site Permissions**: Some sites restrict extension access
- **CORS Restrictions**: Cross-origin resource sharing limitations

**Workaround**: Copy the text and test it on TEST_PAGE.html or other websites.

## Troubleshooting

**Nothing happens when you right-click?**
1. Reload the extension: Go to `chrome://extensions/` and click the reload icon 🔄
2. Refresh the webpage you're testing on
3. Open DevTools (F12) and check the Console for error messages
4. See **DEBUGGING.md** for detailed troubleshooting steps

**Icon not showing?**
- Follow ICON_SETUP.md to add icons
- Extension works without icons, but looks more professional with them

**Daily limit reached?**
- Anonymous users: 10 text + 3 image per day
- Sign in with User ID for unlimited usage

**Want to test it?**
- Open `TEST_PAGE.html` in Chrome to test with sample content
- Try Wikipedia.com - it works well there

**Still having issues?**
- Check the DEBUGGING.md file for complete troubleshooting guide
- Make sure you have a stable internet connection
- Check if the Kadox API server is online

## Permissions

The extension requires the following permissions:
- `contextMenus`: To add right-click menu items
- `activeTab`: To interact with the current webpage
- `storage`: To save user settings and activity
- `notifications`: To show system notifications
- `<all_urls>`: To make API requests to the detection service

## Browser Compatibility

- Chrome 88+
- Edge 88+
- Other Chromium-based browsers with Manifest V3 support

## License

MIT License - feel free to use and modify as needed.

## Support

For issues or questions, please create an issue in the repository or visit https://kadox.io.vn