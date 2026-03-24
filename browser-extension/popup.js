// Popup script for CRM Data Collector extension

let currentProfile = null;
let user = null;
let auth = null;
let functions = null;

// Initialize Firebase when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  // Initialize UI first
  initializeUI();
  
  // Then initialize Firebase
  if (typeof firebase !== 'undefined') {
    try {
      // Initialize Firebase services
      auth = firebase.auth();
      functions = firebase.functions();
      
      // Check authentication state
      auth.onAuthStateChanged((userState) => {
        if (userState) {
          user = userState;
          showMainSection();
          loadCurrentProfile();
        } else {
          showAuthSection();
        }
      });
    } catch (error) {
      console.error('Firebase initialization error:', error);
      showStatus('Error initializing Firebase', 'error');
    }
  } else {
    console.error('Firebase SDK not loaded');
    showStatus('Firebase SDK not loaded. Please refresh.', 'error');
  }
});

// UI Elements (will be initialized after DOM loads)
let authSection, mainSection, loadingSection, statusMessage, profileInfo;
let loginBtn, extractBtn, collectBtn, logoutBtn;

// Initialize UI elements and event listeners after DOM is ready
function initializeUI() {
  // UI Elements
  authSection = document.getElementById('authSection');
  mainSection = document.getElementById('mainSection');
  loadingSection = document.getElementById('loadingSection');
  statusMessage = document.getElementById('statusMessage');
  profileInfo = document.getElementById('profileInfo');

  loginBtn = document.getElementById('loginBtn');
  extractBtn = document.getElementById('extractBtn');
  collectBtn = document.getElementById('collectBtn');
  logoutBtn = document.getElementById('logoutBtn');

  // Event Listeners
  if (loginBtn) loginBtn.addEventListener('click', handleLogin);
  if (extractBtn) extractBtn.addEventListener('click', handleExtract);
  if (collectBtn) collectBtn.addEventListener('click', handleCollect);
  if (logoutBtn) logoutBtn.addEventListener('click', handleLogout);
}

// Functions
function showAuthSection() {
  authSection.classList.remove('hidden');
  mainSection.classList.add('hidden');
  loadingSection.classList.add('hidden');
}

function showMainSection() {
  authSection.classList.add('hidden');
  mainSection.classList.remove('hidden');
  loadingSection.classList.add('hidden');
}

function showLoading() {
  loadingSection.classList.remove('hidden');
  mainSection.classList.add('hidden');
}

function showStatus(message, type = 'info') {
  statusMessage.textContent = message;
  statusMessage.className = `status ${type}`;
  statusMessage.classList.remove('hidden');
  
  // Auto-hide after 5 seconds
  setTimeout(() => {
    statusMessage.classList.add('hidden');
  }, 5000);
}

async function handleLogin() {
  try {
    // Get the main app URL from storage or use default
    const stored = await chrome.storage.local.get(['appUrl']);
    const appUrl = stored.appUrl || 'http://localhost:3000';
    
    // Open login page in new tab
    chrome.tabs.create({
      url: `${appUrl}/login`
    });
    
    // Show message
    showStatus('Opening login page... Please log in and return here.', 'info');
    
    // Don't close popup - let user see the message
    setTimeout(() => {
      window.close();
    }, 2000);
  } catch (error) {
    console.error('Error opening login:', error);
    showStatus('Error: Please log in through the main application', 'error');
  }
}

async function loadCurrentProfile() {
  try {
    // Get current tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (!tab.url || !tab.url.includes('linkedin.com/in/')) {
      showStatus('Please navigate to a LinkedIn profile page', 'info');
      return;
    }

    // Execute content script to extract profile
    chrome.tabs.sendMessage(tab.id, { action: 'extractProfile' }, (response) => {
      if (chrome.runtime.lastError) {
        showStatus('Error: Please refresh the LinkedIn page', 'error');
        return;
      }

      if (response && response.success && response.data) {
        currentProfile = response.data;
        displayProfile(response.data);
      } else {
        showStatus('Could not extract profile data', 'error');
      }
    });
  } catch (error) {
    console.error('Error loading profile:', error);
    showStatus('Error loading profile', 'error');
  }
}

function displayProfile(profile) {
  document.getElementById('profileName').textContent = profile.name || '-';
  document.getElementById('profileTitle').textContent = profile.title || '-';
  document.getElementById('profileCompany').textContent = profile.company || '-';
  document.getElementById('profileLocation').textContent = profile.location || '-';
  
  profileInfo.classList.remove('hidden');
  collectBtn.classList.remove('hidden');
}

async function handleExtract() {
  showLoading();
  await loadCurrentProfile();
  showMainSection();
}

async function handleCollect() {
  if (!currentProfile) {
    showStatus('No profile data to collect', 'error');
    return;
  }

  if (!user) {
    showStatus('Please log in first', 'error');
    return;
  }

  // Confirm with user
  const confirmed = confirm(
    'Share this public LinkedIn profile data to help build the contact database?\n\n' +
    'This will help improve contact data for all users.\n' +
    '(Only public information will be shared)'
  );

  if (!confirmed) {
    return;
  }

  showLoading();

  try {
    // Use Firebase Functions SDK
    if (!functions) {
      throw new Error('Firebase Functions not initialized');
    }

    const collectProfileData = functions.httpsCallable('collectProfileData');
    const result = await collectProfileData(currentProfile);

    if (result.data && result.data.success) {
      showStatus(`✅ Data collected successfully! (${result.data.action})`, 'success');
      currentProfile = null;
      collectBtn.classList.add('hidden');
      profileInfo.classList.add('hidden');
    } else {
      throw new Error(result.data?.error || 'Failed to collect data');
    }
  } catch (error) {
    console.error('Error collecting data:', error);
    showStatus(`Error: ${error.message}`, 'error');
  }

  showMainSection();
}

async function handleLogout() {
  try {
    if (auth) {
      await auth.signOut();
    } else if (typeof firebase !== 'undefined' && firebase.auth) {
      await firebase.auth().signOut();
    }
    user = null;
    showAuthSection();
  } catch (error) {
    console.error('Error logging out:', error);
    showStatus('Error logging out', 'error');
  }
}

async function getFunctionsUrl() {
  // Try to get from storage first
  const stored = await chrome.storage.local.get(['functionsUrl']);
  if (stored.functionsUrl) {
    return stored.functionsUrl;
  }

  // Try to get from Firebase config
  if (typeof firebaseConfig !== 'undefined' && firebaseConfig.functionsUrl) {
    return firebaseConfig.functionsUrl;
  }

  // Default from firebase-config.js
  return 'https://us-central1-bulkemail-crm.cloudfunctions.net';
}

// Load profile on popup open (already handled in DOMContentLoaded)

