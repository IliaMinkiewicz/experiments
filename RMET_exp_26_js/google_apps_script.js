// =========================================================================
// GOOGLE APPS SCRIPT FOR SAVING EXPERIMENT CSV DATA TO GITHUB
// =========================================================================
// This script acts as a secure proxy backend. It receives the CSV data from
// your web experiment via a POST request, and commits it directly to your
// GitHub repository using a Personal Access Token (PAT).
// Since the token is stored in this Google Apps Script (in the cloud),
// it is completely hidden from the participants and cannot be stolen.
//
// HOW TO DEPLOY AND USE:
// 1. Open Google Drive (https://drive.google.com).
// 2. Click "+ New" -> "More" -> "Google Apps Script" (or visit script.google.com).
// 3. Delete any code in the editor, and paste the entirety of this code.
// 4. Fill in the "CONFIGURATION" constants below with your details.
//    - To get GITHUB_TOKEN: go to GitHub -> Settings -> Developer Settings -> 
//      Personal Access Tokens (Fine-grained or Classic) and generate a token
//      with contents:write permission to your repository.
// 5. In the top right, click "Deploy" -> "New deployment".
// 6. Click the gear icon next to "Select type" and choose "Web app".
// 7. Configure:
//    - Description: "RMET Data Webhook"
//    - Execute as: "Me" (your-email)
//    - Who has access: "Anyone" (essential so the web experiment can POST to it)
// 8. Click "Deploy". Authorize the requested permissions.
// 9. Copy the "Web app URL" provided in the deployment confirmation dialog.
// 10. Open your "script.js" file, find the "UPLOAD_URL" variable at the top,
//     and paste the Web app URL between the quotes:
//     const UPLOAD_URL = "https://script.google.com/macros/s/.../exec";
// =========================================================================

// --- CONFIGURATION ---
const GITHUB_TOKEN = "YOUR_GITHUB_PERSONAL_ACCESS_TOKEN"; // Generate at github.com -> settings -> developer settings
const REPO_OWNER = "IliaMinkiewicz"; // Your GitHub username
const REPO_NAME = "experiments";     // Your repository name
const BRANCH = "main";               // Target branch
const FOLDER_PATH = "RMET_experiment/data"; // Folder inside the repo where files will be saved
// ---------------------

function doPost(e) {
  try {
    const requestData = JSON.parse(e.postData.contents);
    const participantId = requestData.participantId;
    const sessionNum = requestData.sessionNum;
    const csvData = requestData.csvData;
    
    if (!participantId || !csvData) {
      return errorResponse("Missing required fields: participantId or csvData");
    }
    
    // Construct target filename and path
    const fileName = `summary_sub-${participantId}_ses-${sessionNum}.csv`;
    const filePath = `${FOLDER_PATH}/${fileName}`;
    
    // GitHub API URL to create or update files
    const apiUrl = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${filePath}`;
    
    // Convert CSV content to base64, preserving UTF-8 encoding (CRITICAL for Cyrillic letters)
    const base64Content = Utilities.base64Encode(csvData, Utilities.Charset.UTF_8);
    
    // Check if the file already exists on GitHub to obtain its 'sha' (required for updates)
    let sha = null;
    try {
      const checkResponse = UrlFetchApp.fetch(apiUrl, {
        method: "get",
        headers: {
          "Authorization": `token ${GITHUB_TOKEN}`,
          "Accept": "application/vnd.github.v3+json"
        },
        muteHttpExceptions: true
      });
      
      if (checkResponse.getResponseCode() === 200) {
        const fileInfo = JSON.parse(checkResponse.getContentText());
        sha = fileInfo.sha;
      }
    } catch (checkErr) {
      // File doesn't exist, which is fine (first commit for this ID/session)
    }
    
    // Prepare GitHub API Payload
    const payload = {
      message: `Save RMET experiment results: Subject ${participantId}, Session ${sessionNum}`,
      content: base64Content,
      branch: BRANCH
    };
    
    if (sha) {
      payload.sha = sha; // Provide SHA hash if we are overwriting an existing file
    }
    
    // Send PUT request to GitHub API
    const response = UrlFetchApp.fetch(apiUrl, {
      method: "put",
      headers: {
        "Authorization": `token ${GITHUB_TOKEN}`,
        "Accept": "application/vnd.github.v3+json",
        "Content-Type": "application/json"
      },
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    });
    
    const responseCode = response.getResponseCode();
    const responseText = response.getContentText();
    
    if (responseCode === 200 || responseCode === 201) {
      return successResponse("Data saved to GitHub successfully");
    } else {
      return errorResponse(`GitHub API error (status ${responseCode}): ${responseText}`);
    }
    
  } catch (err) {
    return errorResponse(`Apps Script server error: ${err.message}`);
  }
}

// CORS Preflight request handling
function doOptions(e) {
  return ContentService.createTextOutput("")
    .setHeader('Access-Control-Allow-Origin', '*')
    .setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')
    .setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

// Helpers for JSON responses with proper CORS headers
function successResponse(message) {
  const result = JSON.stringify({ status: "success", message: message });
  return ContentService.createTextOutput(result)
    .setMimeType(ContentService.MimeType.JSON)
    .setHeader('Access-Control-Allow-Origin', '*');
}

function errorResponse(message) {
  const result = JSON.stringify({ status: "error", message: message });
  return ContentService.createTextOutput(result)
    .setMimeType(ContentService.MimeType.JSON)
    .setHeader('Access-Control-Allow-Origin', '*');
}
