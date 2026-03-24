// Content script for LinkedIn profile extraction

// Extract profile data from LinkedIn page
function extractLinkedInProfile() {
  try {
    // Extract name
    const nameElement = document.querySelector('h1.text-heading-xlarge.inline.t-24.v-align-middle.break-words') ||
                       document.querySelector('h1[data-test-id="profile-name"]') ||
                       document.querySelector('h1.pv-text-details__left-panel h1') ||
                       document.querySelector('h1.top-card-layout__title');
    const name = nameElement ? nameElement.textContent.trim() : null;

    // Extract title
    const titleElement = document.querySelector('.text-body-medium.break-words') ||
                        document.querySelector('.pv-text-details__left-panel h2') ||
                        document.querySelector('.top-card-layout__headline');
    const title = titleElement ? titleElement.textContent.trim() : null;

    // Extract company (from title or about section)
    let company = null;
    const companyElement = document.querySelector('.pv-text-details__left-panel a[href*="/company/"]') ||
                          document.querySelector('.top-card-layout__headline a[href*="/company/"]');
    if (companyElement) {
      company = companyElement.textContent.trim();
    } else {
      // Try to extract from title
      if (title && title.includes(' at ')) {
        const parts = title.split(' at ');
        if (parts.length > 1) {
          company = parts[1].trim();
        }
      }
    }

    // Extract location
    const locationElement = document.querySelector('.text-body-small.inline.t-black--light.break-words') ||
                           document.querySelector('.pv-text-details__left-panel .text-body-small') ||
                           document.querySelector('.top-card-layout__first-subline');
    const location = locationElement ? locationElement.textContent.trim() : null;

    // Get profile URL
    const profileUrl = window.location.href.split('?')[0]; // Remove query params

    // Validate we have at least name
    if (!name) {
      return { success: false, error: 'Could not extract profile name' };
    }

    return {
      success: true,
      data: {
        name: name,
        title: title,
        company: company,
        location: location,
        profileUrl: profileUrl
      }
    };
  } catch (error) {
    console.error('Error extracting LinkedIn profile:', error);
    return { success: false, error: error.message };
  }
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'extractProfile') {
    const result = extractLinkedInProfile();
    sendResponse(result);
    return true; // Indicates we will send a response asynchronously
  }
});

// Auto-extract when page loads (optional - for debugging)
// This can be disabled in production
if (window.location.href.includes('/in/')) {
  console.log('LinkedIn profile page detected. CRM Data Collector is ready.');
}

