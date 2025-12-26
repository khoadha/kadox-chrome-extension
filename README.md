# Kadox AI Content Detector - Chrome Extension

A Chrome extension that allows users to detect AI-generated text and images directly from their browser using right-click context menus.

## Features

- **Text Analysis**: Highlight any text on a webpage, right-click, and analyze if it's AI-generated
- **Image Analysis**: Right-click on any image to check if it's AI-generated
- **Visual Results**: Beautiful modal displays showing detection confidence and details
- **Customizable**: Configure your own AI detection API endpoints
- **Activity Tracking**: View recent analysis history in the popup

## Installation

### Development Mode

1. Clone or download this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right corner
4. Click "Load unpacked" and select the extension directory
5. The extension icon should appear in your toolbar

### Configuration

1. Click the extension icon in your toolbar
2. Enter your AI Detector API endpoints:
   - **Text API Endpoint**: Your API URL for text analysis
   - **Image API Endpoint**: Your API URL for image analysis
   - **API Key** (optional): If your API requires authentication
3. Click "Save Settings"

## Usage

### Analyzing Text

1. Highlight any text on a webpage
2. Right-click on the selected text
3. Select "Analyze AI-Generated Text" from the context menu
4. Wait for the analysis results to appear in a modal

### Analyzing Images

1. Right-click on any image on a webpage
2. Select "Analyze AI-Generated Image" from the context menu
3. Wait for the analysis results to appear in a modal

## API Integration

The extension expects your API to follow these formats:

### Text Detection API

**Endpoint**: `POST /api/detect/text`

**Request Body**:
```json
{
  "text": "The text content to analyze..."
}
```

**Response**:
```json
{
  "isAI": true,
  "probability": 0.85,
  "details": "Optional explanation of the detection"
}
```

### Image Detection API

**Endpoint**: `POST /api/detect/image`

**Request Body**:
```json
{
  "imageUrl": "https://example.com/image.jpg"
}
```

**Response**:
```json
{
  "isAI": true,
  "probability": 0.92,
  "details": "Optional explanation of the detection"
}
```

## Project Structure

```
Kadox.ChromeExtension/
├── manifest.json          # Extension configuration
├── background.js          # Service worker for context menus and API calls
├── content.js            # Content script for displaying results
├── content.css           # Styles for modal and results
├── popup.html            # Extension popup UI
├── popup.css             # Popup styles
├── popup.js              # Popup functionality
├── icons/                # Extension icons (you need to add these)
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
└── README.md             # This file
```

## Adding Icons

You need to create and add icons for the extension:

1. Create three PNG icons:
   - `icon16.png` (16x16 pixels)
   - `icon48.png` (48x48 pixels)
   - `icon128.png` (128x128 pixels)
2. Place them in an `icons/` folder in the extension directory

## Customization

### Updating API Endpoints

You can update the default API endpoints in `background.js`:

```javascript
const endpoint = apiEndpoint || 'https://your-api-endpoint.com/api/detect/text';
```

### Styling

Modify `content.css` and `popup.css` to customize the look and feel of the extension.

## Permissions

The extension requires the following permissions:
- `contextMenus`: To add right-click menu items
- `activeTab`: To interact with the current webpage
- `storage`: To save user settings and activity
- `<all_urls>`: To make API requests to your detection service

## Browser Compatibility

- Chrome 88+
- Edge 88+
- Other Chromium-based browsers with Manifest V3 support

## Troubleshooting

### Extension doesn't appear
- Make sure Developer mode is enabled
- Try reloading the extension from `chrome://extensions/`

### API calls fail
- Check that your API endpoints are correctly configured
- Verify CORS settings on your API server
- Check the browser console for error messages

### Images can't be analyzed
- Some websites may block external API calls to image URLs
- Check if the image URL is accessible publicly

## License

MIT License - feel free to use and modify as needed.

## Support

For issues or questions, please create an issue in the repository.
