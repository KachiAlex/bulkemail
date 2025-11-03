// Firebase configuration for browser extension
// This config matches your Firebase project

const firebaseConfig = {
  apiKey: "AIzaSyDYMfJp4hZe1JACTdqA3uDdWggSZI365GU",
  authDomain: "bulkemail-crm.firebaseapp.com",
  projectId: "bulkemail-crm",
  storageBucket: "bulkemail-crm.firebasestorage.app",
  messagingSenderId: "722774203249",
  appId: "1:722774203249:web:8aa683b0ae55852389f4d0",
  functionsUrl: "https://us-central1-bulkemail-crm.cloudfunctions.net"
};

// Initialize Firebase if the SDK is available
if (typeof firebase !== 'undefined') {
  firebase.initializeApp(firebaseConfig);
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { firebaseConfig };
}

