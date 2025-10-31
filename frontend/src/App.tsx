import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../firebase-config';
import { doc, getDoc } from 'firebase/firestore';
import { logout, loginSuccess } from './store/slices/authSlice';
import Layout from './components/Layout';
import CRMLayout from './layouts/CRMLayout';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import Dashboard from './pages/Dashboard';
import Contacts from './pages/Contacts';
import ContactDetails from './pages/Contacts/ContactDetails';
import Opportunities from './pages/Opportunities';
import Tasks from './pages/Tasks';
import Campaigns from './pages/Campaigns';
import CampaignDetails from './pages/Campaigns/CampaignDetails';
import CreateCampaign from './pages/Campaigns/CreateCampaign';
import Calls from './pages/Calls';
import CallDetails from './pages/Calls/CallDetails';
import Analytics from './pages/Analytics';
import Integrations from './pages/Integrations';
import Settings from './pages/Settings';
import Email from './pages/Email';
import SMS from './pages/SMS';
import Home from './pages/Home';
import Admin from './pages/Admin/index';
import { isAdmin } from './utils/rbac';

// CRM Pages
import CRMDashboard from './pages/CRM/Dashboard';
import CRMContacts from './pages/CRM/Contacts';
import CRMOpportunities from './pages/CRM/Opportunities';
import { RootState } from './store';

function App() {
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const [authInitialized, setAuthInitialized] = React.useState(false);

  useEffect(() => {
    // Wait for Firebase Auth to initialize before checking auth state
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log('Firebase Auth state changed:', user ? 'authenticated' : 'not authenticated');
      
      if (user) {
        // Firebase user is authenticated
        try {
          // Get user data from Firestore
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          const userData = userDoc.data();
          
          if (userData) {
            // Get a fresh ID token
            const token = await user.getIdToken();
            
            // Update Redux store with Firestore data
            dispatch(loginSuccess({
              user: {
                id: user.uid,
                email: user.email || '',
                firstName: userData.firstName || '',
                lastName: userData.lastName || '',
                role: userData.role || 'user'
              },
              accessToken: token,
              refreshToken: user.refreshToken
            }));
          }
        } catch (error) {
          console.error('Error loading user data:', error);
        }
      } else {
        // No Firebase user, make sure we're logged out
        if (isAuthenticated) {
          console.log('Firebase user is null - logging out');
          dispatch(logout());
        }
      }
      
      setAuthInitialized(true);
    });

    return () => unsubscribe();
  }, [dispatch]);

  // Show loading screen while auth is initializing
  if (!authInitialized) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '24px'
      }}>
        Loading...
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    );
  }

  return (
    <Routes>
      {/* Redirect authenticated users from root to dashboard */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      
      {/* Main App Routes with Layout */}
      <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
      <Route path="/contacts" element={<Layout><Contacts /></Layout>} />
      <Route path="/contacts/:id" element={<Layout><ContactDetails /></Layout>} />
      <Route path="/opportunities" element={<Layout><Opportunities /></Layout>} />
      <Route path="/tasks" element={<Layout><Tasks /></Layout>} />
      <Route path="/campaigns" element={<Layout><Campaigns /></Layout>} />
      <Route path="/campaigns/new" element={<Layout><CreateCampaign /></Layout>} />
      <Route path="/campaigns/:id" element={<Layout><CampaignDetails /></Layout>} />
      <Route path="/calls" element={<Layout><Calls /></Layout>} />
      <Route path="/calls/:id" element={<Layout><CallDetails /></Layout>} />
      <Route path="/email" element={<Layout><Email /></Layout>} />
      <Route path="/sms" element={<Layout><SMS /></Layout>} />
      <Route path="/analytics" element={<Layout><Analytics /></Layout>} />
      <Route path="/integrations" element={<Layout><Integrations /></Layout>} />
      <Route path="/settings" element={<Layout><Settings /></Layout>} />

      {/* Admin */}
      <Route
        path="/admin"
        element={isAdmin(user) ? <Layout><Admin /></Layout> : <Navigate to="/dashboard" replace />}
      />

      {/* Comprehensive CRM Routes */}
      <Route path="/crm/*" element={
        <CRMLayout>
          <Routes>
            <Route path="/" element={<Navigate to="/crm/dashboard" replace />} />
            <Route path="/dashboard" element={<CRMDashboard />} />
            <Route path="/contacts" element={<CRMContacts />} />
            <Route path="/opportunities" element={<CRMOpportunities />} />
            
            {/* Placeholder routes for future CRM features */}
            <Route path="/accounts" element={<div>Accounts Management - Coming Soon</div>} />
            <Route path="/campaigns" element={<div>Advanced Campaign Management - Coming Soon</div>} />
            <Route path="/analytics" element={<div>Advanced Analytics - Coming Soon</div>} />
            <Route path="/email" element={<div>Email Integration - Coming Soon</div>} />
            <Route path="/sms" element={<div>SMS Management - Coming Soon</div>} />
            <Route path="/calls" element={<div>Call Management - Coming Soon</div>} />
            <Route path="/chat" element={<div>Chat Integration - Coming Soon</div>} />
            <Route path="/workflows" element={<div>Workflow Automation - Coming Soon</div>} />
            <Route path="/segments" element={<div>Advanced Segmentation - Coming Soon</div>} />
            <Route path="/templates" element={<div>Template Management - Coming Soon</div>} />
            <Route path="/integrations" element={<div>Integration Hub - Coming Soon</div>} />
            <Route path="/api" element={<div>API & Webhooks - Coming Soon</div>} />
            <Route path="/security" element={<div>Security & Compliance - Coming Soon</div>} />
            <Route path="/mobile" element={<div>Mobile App - Coming Soon</div>} />
            <Route path="/settings" element={<div>CRM Settings - Coming Soon</div>} />
            
            <Route path="*" element={<Navigate to="/crm/dashboard" replace />} />
          </Routes>
        </CRMLayout>
      } />
    </Routes>
  );
}

export default App;

