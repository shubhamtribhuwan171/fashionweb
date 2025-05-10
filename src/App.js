import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ChakraProvider, extendTheme } from '@chakra-ui/react';
import LandingPage from './components/Landing/LandingPage';
import LoginPage from './components/Auth/LoginPage';
import DashboardLayout from './components/Layout/DashboardLayout';
import DashboardHomePage from './pages/DashboardHomePage';
import GenerationsPage from './pages/GenerationsPage';
import CreateStylePage from './pages/CreateStylePage';
import CollectionsPage from './pages/CollectionsPage';
import ProductsPage from './pages/ProductsPage';
import SettingsPage from './pages/SettingsPage';
import GarmentDetailPage from './pages/GarmentDetailPage';
import CollectionDetailPage from './pages/CollectionDetailPage';
import AssetDetailPage from './pages/AssetDetailPage';
import ExplorePage from './pages/ExplorePage';
import ModelsPage from './pages/ModelsPage';
import AccessoriesPage from './pages/AccessoriesPage';
import ExperimentalCreatePage from './pages/ExperimentalCreatePage';
import PosesPage from './pages/PosesPage';
import ModelDetailPage from './pages/ModelDetailPage';
import AccessoryDetailPage from './pages/AccessoryDetailPage';
import PoseDetailPage from './pages/PoseDetailPage';
import SignupPage from './components/Auth/SignupPage';
import PrivacyPolicy from './components/Legal/PrivacyPolicy';
import TermsOfService from './components/Legal/TermsOfService';
// Simple theme customization (optional)
const theme = extendTheme({
  // Add custom theme settings here if needed
  fonts: {
    heading: `'Poppins', sans-serif`,
    body: `'Poppins', sans-serif`,
  },
});

// Removed global isAuthenticated variable and login/logout functions modifying it

// Dashboard Routes component - Now directly rendered when authenticated
// No need for logout prop here, handled in App
const DashboardRoutes = ({ handleLogout }) => (
  <DashboardLayout logout={handleLogout}> 
    <Routes>
      <Route path="dashboard" element={<DashboardHomePage />} />
      <Route path="generations" element={<GenerationsPage />} />
      <Route path="create" element={<CreateStylePage />} />
      {/* Collections Routes */}
      <Route path="collections" element={<CollectionsPage />} />
      <Route path="collections/:collectionId" element={<CollectionDetailPage />} /> 
      {/* Products (Garments) Routes */}
      <Route path="products" element={<ProductsPage />} />
      <Route path="products/:garmentId" element={<GarmentDetailPage />} /> 
      {/* Settings Route */}
      <Route path="settings" element={<SettingsPage />} />
      {/* Asset Detail Route */}
      <Route path="asset/:assetId" element={<AssetDetailPage />} /> 
      {/* Explore Route */}
      <Route path="explore" element={<ExplorePage />} /> 
      {/* --- Add New Routes Here --- */}
      <Route path="models" element={<ModelsPage />} />
      <Route path="accessories" element={<AccessoriesPage />} />
      {/* --- Add Poses Route --- */}
      <Route path="poses" element={<PosesPage />} />
      {/* --- Add Experimental Route --- */}
      <Route path="experimental-create" element={<ExperimentalCreatePage />} /> 
      {/* Routes for new detail pages */}
      <Route path="models/:modelId" element={<ModelDetailPage />} />
      <Route path="accessories/:accessoryId" element={<AccessoryDetailPage />} />
      <Route path="poses/:poseId" element={<PoseDetailPage />} />
      {/* Redirect base /app path to /app/dashboard */}
      <Route index element={<Navigate to="dashboard" replace />} />
      {/* Handle unknown dashboard routes */}
      <Route path="*" element={<Navigate to="dashboard" replace />} /> 
    </Routes>
  </DashboardLayout>
);

function App() {
  // Initialize authStatus from localStorage token for persistence across reloads
  const [authStatus, setAuthStatus] = useState(() => {
    return Boolean(localStorage.getItem('authToken'));
  });

  const handleLogin = () => {
    // LoginPage stores authToken in localStorage; update state
    setAuthStatus(true);
  };

  const handleLogout = () => {
    // Clear stored token and update state
    localStorage.removeItem('authToken');
    localStorage.removeItem('userInfo');
    setAuthStatus(false);
  };
  
  return (
    <ChakraProvider theme={theme}>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-of-service" element={<TermsOfService />} />
          <Route 
            path="/" 
            element={authStatus ? <Navigate to="/app/dashboard" replace /> : <LandingPage />} 
          />
          <Route 
            path="/login" 
            element={authStatus ? <Navigate to="/app/dashboard" replace /> : <LoginPage onLoginSuccess={handleLogin} />} 
          />
          {/* Add Signup route later */}
          <Route path="/signup" element={<SignupPage />} />

          {/* Protected dashboard routes under /app/* */}
          <Route 
            path="/app/*" 
            element={authStatus ? <DashboardRoutes handleLogout={handleLogout} /> : <Navigate to="/login" replace />}
          />

          {/* Redirect any other unmatched route to landing or dashboard */}
          <Route 
            path="*" 
            element={<Navigate to={authStatus ? '/app/dashboard' : '/'} replace />} 
          />
        </Routes>
      </Router>
    </ChakraProvider>
  );
}

export default App;
