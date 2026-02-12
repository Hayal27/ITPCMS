import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Auth Context
import { AuthProvider, useAuth } from './components/Auth/AuthContext';

// Layout Components
import Footer from './components/Footer';
import MainLayout from './layouts/MainLayout';

// Login Page
import LoginPage from './components/demo components/login';

// Dynamic Routes Component
import DynamicRoutes from './components/DynamicRoutes';

// Loading Component
const LoadingIndicator: React.FC = () => (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
        </div>
    </div>
);

// Main App Component
function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <AppContent />
            </BrowserRouter>
        </AuthProvider>
    );
}

// AppContent Component (Handles auth state and renders routes/layout)
const AppContent: React.FC = () => {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        return <LoadingIndicator />;
    }

    return (
        <>
            {!isAuthenticated ? (
                // Public Routes (User Not Authenticated)
                <Routes>
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="*" element={<Navigate to="/login" replace />} />
                </Routes>
            ) : (
                // Protected Routes (User Authenticated)
                <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
                    <MainLayout>
                        {/* Dynamic routes based on user's menu permissions */}
                        <DynamicRoutes />
                    </MainLayout>
                    <Footer />
                </div>
            )}
        </>
    );
};

export default App;
