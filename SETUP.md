# Setup Guide for Kadox AI Content Detector

## Quick Start

### 1. Create Extension Icons

You need to create three icon files. You can use any image editing tool or an online icon generator.

**Option A: Use an Online Icon Generator**
- Visit: https://www.favicon-generator.org/ or https://www.iconsgenerator.com/
- Upload a logo or image
- Download the generated icons in PNG format
- Rename them to `icon16.png`, `icon48.png`, and `icon128.png`

**Option B: Create Manually**
- Create a simple design (e.g., a robot icon 🤖 or "AI" text)
- Export in three sizes: 16x16, 48x48, and 128x128 pixels
- Save as PNG format

Create an `icons` folder in your extension directory and place the three icons there:
```
Kadox.ChromeExtension/
└── icons/
    ├── icon16.png
    ├── icon48.png
    └── icon128.png
```

### 2. Configure Your API Endpoints

Update the `background.js` file to point to your actual AI Detector API:

1. Find these lines in `background.js`:
```javascript
const endpoint = apiEndpoint || 'https://your-api-endpoint.com/api/detect/text';
```

2. Replace `'https://your-api-endpoint.com/api/detect/text'` with your actual text detection API URL
3. Do the same for the image detection endpoint

### 3. Load the Extension in Chrome

1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" (toggle in the top right corner)
3. Click "Load unpacked"
4. Select the `Kadox.ChromeExtension` folder
5. The extension should now appear in your extensions list

### 4. Configure API Settings

1. Click the extension icon in your Chrome toolbar (puzzle piece icon → Kadox AI Detector)
2. In the popup, enter your API endpoints:
   - **API Endpoint (Text)**: Your text detection API URL
   - **API Endpoint (Image)**: Your image detection API URL
   - **API Key**: Your API authentication key (if required)
3. Click "Save Settings"

### 5. Test the Extension

**Test Text Detection:**
1. Go to any webpage with text
2. Highlight some text
3. Right-click and select "Analyze AI-Generated Text"
4. You should see a modal with the analysis results

**Test Image Detection:**
1. Go to any webpage with images
2. Right-click on an image
3. Select "Analyze AI-Generated Image"
4. You should see a modal with the analysis results

## API Requirements

Your AI Detector API should accept and return data in the following format:

### Text Detection Endpoint

**Request:**
```http
POST /api/detect/text
Content-Type: application/json
Authorization: Bearer YOUR_API_KEY

{
  "text": "Sample text to analyze..."
}
```

**Response:**
```json
{
  "isAI": true,
  "probability": 0.85,
  "details": "This text shows characteristics of AI-generated content..."
}
```

### Image Detection Endpoint

**Request:**
```http
POST /api/detect/image
Content-Type: application/json
Authorization: Bearer YOUR_API_KEY

{
  "imageUrl": "https://example.com/image.jpg"
}
```

**Response:**
```json
{
  "isAI": false,
  "probability": 0.23,
  "details": "This image appears to be human-created..."
}
```

## Troubleshooting

### Icons not showing
- Make sure all three icon files exist in the `icons/` folder
- Check that the files are named exactly: `icon16.png`, `icon48.png`, `icon128.png`
- Reload the extension from `chrome://extensions/`

### API calls not working
- Check browser console (F12) for error messages
- Verify your API endpoints are correct and accessible
- Make sure your API server allows CORS requests from Chrome extensions
- Test your API endpoints using a tool like Postman or curl

### CORS Issues
If you see CORS errors, your API server needs to allow requests from Chrome extensions. Add these headers to your API responses:
```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: POST, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
```

### Context menu not appearing
- Make sure you've granted the extension the necessary permissions
- Reload the extension from `chrome://extensions/`
- Try restarting Chrome

## Next Steps

### Customize the Extension

1. **Change Colors**: Edit `content.css` and `popup.css` to match your brand
2. **Modify Responses**: Update the display logic in `content.js`
3. **Add Features**: Extend `background.js` to add new functionality

### Publish to Chrome Web Store

1. Create a ZIP file of your extension directory
2. Go to [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole/)
3. Pay the one-time $5 developer registration fee
4. Upload your ZIP file and fill out the required information
5. Submit for review

## Support

For questions or issues:
- Check the README.md file
- Review Chrome Extension documentation: https://developer.chrome.com/docs/extensions/
- Contact: khoadha9a2.dt@gmail.com
