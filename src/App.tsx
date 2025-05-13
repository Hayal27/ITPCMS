import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Auth Context
import { AuthProvider, useAuth } from './components/Auth/AuthContext'; // Adjust path if needed

// --- Layout Components ---
// Remove direct imports of TopNavbar and VerticalNavbar here as MainLayout handles them
// import TopNavbar from './components/nav/TopNavbar';
// import VerticalNavbar from './components/nav/VerticalNavbar';
import Footer from './components/Footer';
import MainLayout from './layouts/MainLayout'; // Import MainLayout
import DashboardLayout from './components/DashboardLayout';

// --- Page Components ---
// Login (Public)
import LoginPage from './components/demo components/login'; // Adjust path if needed

// Dashboard (Protected)
import DashboardOverviewPage from './pages/dashboard/DashboardOverviewPage';
import AnalyticsPage from './pages/dashboard/AnalyticsPage';

// Content (Protected)
import NewsEventsAdmin from './pages/content/NewsEventsAdmin';
import ManagePosts from './pages/content/ManagePosts'
import MediaGalleryAdmin from './pages/content/MediaGalleryAdmin'
import ManageGallery from './pages/content/ManageGallery'
import PagesPage from './pages/content/PagesPage';
import CategoriesPage from './pages/content/CategoriesPage';
import TagsPage from './pages/content/TagsPage';

// Media (Protected)
import MediaLibraryPage from './pages/media/MediaLibraryPage';

// Interaction (Protected)
import CommentsPage from './pages/interaction/CommentsPage';
import ManageFormsPage from './pages/interaction/forms/ManageFormsPage';
import FormSubmissionsPage from './pages/interaction/forms/FormSubmissionsPage';

// Appearance (Protected)
import MenusPage from './pages/appearance/MenusPage';
import ThemeSettingsPage from './pages/appearance/ThemeSettingsPage';

// Users (Protected)
import AllUsersPage from './pages/users/AllUsersPage';
import AddNewUserPage from './pages/users/AddNewUserPage';
// import UserProfilePage from './pages/users/UserProfilePage'; // Assuming this page exists
// import RolesPermissionsPage from './pages/users/RolesPermissionsPage'; // Assuming this page exists

// // Plugins (Protected)
// import InstalledPluginsPage from './pages/plugins/InstalledPluginsPage'; // Assuming this page exists
// import AddNewPluginPage from './pages/plugins/AddNewPluginPage'; // Assuming this page exists

// // Tools (Protected)
// import SeoSettingsPage from './pages/tools/SeoSettingsPage'; // Assuming this page exists
// import ImportExportPage from './pages/tools/ImportExportPage'; // Assuming this page exists


// Settings (Protected)
import GeneralSettingsPage from './pages/settings/GeneralSettingsPage';

// --- Loading Component ---
const LoadingIndicator: React.FC = () => (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
        </div>
    </div>
);

// --- Main App Component ---
function App() {
    return (
        <AuthProvider> {/* Wrap entire app in AuthProvider */}
            <BrowserRouter>
                <AppContent /> {/* Component to handle conditional rendering based on auth state */}
            </BrowserRouter>
        </AuthProvider>
    );
}

// --- AppContent Component (Handles auth state and renders routes/layout) ---
const AppContent: React.FC = () => {
    const { isAuthenticated, isLoading, user } = useAuth();

    if (isLoading) {
        return <LoadingIndicator />; // Show loading indicator while checking auth
    }

    // Convert role_id to number for reliable comparison, handle potential string values
    const userRoleId = user?.role_id ? Number(user.role_id) : null;

    return (
        <>
            {!isAuthenticated ? (
                // --- Public Routes (User Not Authenticated) ---
                <Routes>
                    <Route path="/login" element={<LoginPage />} />
                    {/* Redirect any other path to login */}
                    <Route path="*" element={<Navigate to="/login" replace />} />
                </Routes>
            ) : (
                // --- Protected Routes (User Authenticated) ---
                // Use a flex container to position Footer correctly
                <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
                    {/* Use MainLayout to wrap the main content (Routes) */}
                    {/* MainLayout now renders TopNavbar and VerticalNavbar internally */}
                    <MainLayout>
                        {/* --- Main Content Area (Routes) --- */}
                        {/* Routes are passed as children to MainLayout */}
                        <Routes>
                            {
                                // --- Routes based on Role ---
                                userRoleId === 1 ? ( // Admin Routes (Role ID: 1)
                                    <>
                                        <Route index element={<Navigate to="/dashboard/overview" replace />} /> {/* Updated index route */}
                                        <Route path="dashboard/overview" element={<DashboardOverviewPage />} /> {/* Explicit path */}
                                        <Route path="dashboard/analytics" element={<AnalyticsPage />} />
                                        <Route path="dashboard/DashboardLayout" element={<DashboardLayout />} />

                                        <Route path="content/posts" element={<NewsEventsAdmin />} />
                                        <Route path="content/pages" element={<PagesPage />} />
                                        <Route path="content/categories" element={<CategoriesPage />} />
                                        <Route path="content/tags" element={<TagsPage />} />

                                        <Route path="media/library" element={<MediaLibraryPage />} /> {/* Updated path */}

                                        <Route path="interaction/comments" element={<CommentsPage />} />
                                        <Route path="interaction/forms/manage" element={<ManageFormsPage />} />
                                        <Route path="interaction/forms/submissions" element={<FormSubmissionsPage />} />

                                        <Route path="appearance/menus" element={<MenusPage />} />
                                        <Route path="appearance/theme-settings" element={<ThemeSettingsPage />} /> {/* Updated path */}

                                        <Route path="users/all" element={<AllUsersPage />} /> {/* Updated path */}
                                        <Route path="users/add" element={<AddNewUserPage />} /> {/* Updated path */}
                                        {/* <Route path="users/profile/:userId" element={<UserProfilePage />} /> Route for specific user profile */}
                                        {/* <Route path="users/roles" element={<RolesPermissionsPage />} /> */}

                                        {/* <Route path="plugins/installed" element={<InstalledPluginsPage />} /> */} {/* Updated path */}
                                        {/* <Route path="plugins/add" element={<AddNewPluginPage />} /> */} {/* Updated path */}

                                        {/* <Route path="tools/seo" element={<SeoSettingsPage />} /> */}
                                        {/* <Route path="tools/import-export" element={<ImportExportPage />} /> */}

                                        <Route path="settings/general" element={<GeneralSettingsPage />} />

                                        {/* Add other admin-specific routes */}
                                        <Route path="*" element={<div className="alert alert-warning">Admin Page Not Found (404)</div>} />
                                    </>
                                ) : userRoleId === 7 ? ( // Team Leader Routes (Role ID: 7)
                                    <>
                                        <Route index element={<Navigate to="/dashboard/overview" replace />} /> {/* Updated index route */}
                                        <Route path="dashboard/overview" element={<DashboardOverviewPage />} /> {/* Explicit path */}
                                        <Route path="dashboard/analytics" element={<AnalyticsPage />} />
                                        <Route path="dashboard/DashboardLayout" element={<DashboardLayout />} />

                                        <Route path="content/posts" element={<NewsEventsAdmin />} />
                                        <Route path="content/pages" element={<PagesPage />} />
                                        <Route path="content/categories" element={<CategoriesPage />} />
                                        <Route path="content/tags" element={<TagsPage />} />

                                        <Route path="media/library" element={<MediaLibraryPage />} /> {/* Updated path */}

                                        <Route path="interaction/comments" element={<CommentsPage />} />
                                        <Route path="interaction/forms/manage" element={<ManageFormsPage />} />
                                        <Route path="interaction/forms/submissions" element={<FormSubmissionsPage />} />

                                        <Route path="appearance/menus" element={<MenusPage />} />
                                        <Route path="appearance/theme-settings" element={<ThemeSettingsPage />} /> {/* Updated path */}

                                        <Route path="users/all" element={<AllUsersPage />} /> {/* Updated path */}
                                        <Route path="users/add" element={<AddNewUserPage />} /> {/* Updated path */}
                                        {/* Add Team Leader specific routes here */}
                                        {/* e.g., <Route path="plan/view" element={<TeamleaderViewOrgPlan />} /> */}
                                        {/* Grant access to some shared routes if needed */}
                                        {/* <Route path="users/profile/:userId" element={<UserProfilePage />} /> Example shared route */}
                                        <Route path="*" element={<div className="alert alert-warning">Team Leader Page Not Found (404)</div>} />
                                    </>
                                ) : userRoleId === 2 ? ( // Role ID: 2 Routes (Example Placeholder)
                                    <>
                                        <Route index element={<Navigate to="/dashboard/overview" replace />} /> {/* Updated index route */}
                                        <Route path="dashboard/overview" element={<DashboardOverviewPage />} /> {/* Explicit path */}
                                        <Route path="dashboard/analytics" element={<AnalyticsPage />} />
                                        <Route path="dashboard/DashboardLayout" element={<DashboardLayout />} />

                                        <Route path="content/posts" element={<NewsEventsAdmin />} />
                                        <Route path="content/pages" element={<PagesPage />} />
                                        <Route path="content/categories" element={<CategoriesPage />} />
                                        <Route path="content/tags" element={<TagsPage />} />

                                        <Route path="media/library" element={<MediaLibraryPage />} /> {/* Updated path */}

                                        <Route path="interaction/comments" element={<CommentsPage />} />
                                        <Route path="interaction/forms/manage" element={<ManageFormsPage />} />
                                        <Route path="interaction/forms/submissions" element={<FormSubmissionsPage />} />

                                        <Route path="appearance/menus" element={<MenusPage />} />
                                        <Route path="appearance/theme-settings" element={<ThemeSettingsPage />} /> {/* Updated path */}

                                        <Route path="users/all" element={<AllUsersPage />} /> {/* Updated path */}
                                        <Route path="users/add" element={<AddNewUserPage />} /> {/* Updated path */}
                                        {/* Add Role 2 specific routes here */}
                                        {/* <Route path="users/profile/:userId" element={<UserProfilePage />} /> */}
                                        <Route path="*" element={<div className="alert alert-warning">Page Not Found (404)</div>} />
                                    </>
                                ) : userRoleId === 9 ? ( // Role ID: 9 Routes (Example Placeholder)
                                    <>
                                        <Route index element={<Navigate to="/dashboard/overview" replace />} /> {/* Updated index route */}
                                        <Route path="dashboard/overview" element={<DashboardOverviewPage />} /> {/* Explicit path */}
                                        <Route path="dashboard/analytics" element={<AnalyticsPage />} />
                                        <Route path="dashboard/DashboardLayout" element={<DashboardLayout />} />

                                        <Route path="content/posts" element={<NewsEventsAdmin />} />
                                        <Route path="content/pages" element={<PagesPage />} />
                                        <Route path="content/categories" element={<CategoriesPage />} />
                                        <Route path="content/tags" element={<TagsPage />} />

                                        <Route path="media/library" element={<MediaLibraryPage />} /> {/* Updated path */}

                                        <Route path="interaction/comments" element={<CommentsPage />} />
                                        <Route path="interaction/forms/manage" element={<ManageFormsPage />} />
                                        <Route path="interaction/forms/submissions" element={<FormSubmissionsPage />} />

                                        <Route path="appearance/menus" element={<MenusPage />} />
                                        <Route path="appearance/theme-settings" element={<ThemeSettingsPage />} /> {/* Updated path */}

                                        <Route path="users/all" element={<AllUsersPage />} /> {/* Updated path */}
                                        <Route path="users/add" element={<AddNewUserPage />} /> {/* Updated path */}
                                        {/* Add Role 9 specific routes here */}
                                        {/* <Route path="users/profile/:userId" element={<UserProfilePage />} /> */}
                                        <Route path="*" element={<div className="alert alert-warning">Page Not Found (404)</div>} />
                                    </>
                                ) : userRoleId === 3 ? ( // Role ID: 3 Routes (Example Placeholder)
                                    <>
                                        <Route index element={<Navigate to="/dashboard/overview" replace />} /> {/* Updated index route */}
                                        <Route path="dashboard/overview" element={<DashboardOverviewPage />} /> {/* Explicit path */}
                                        <Route path="dashboard/analytics" element={<AnalyticsPage />} />
                                        <Route path="dashboard/DashboardLayout" element={<DashboardLayout />} />

                                        <Route path="content/posts" element={<NewsEventsAdmin />} />
                                        <Route path="content/pages" element={<PagesPage />} />
                                        <Route path="content/categories" element={<CategoriesPage />} />
                                        <Route path="content/tags" element={<TagsPage />} />

                                        <Route path="media/library" element={<MediaLibraryPage />} /> {/* Updated path */}

                                        <Route path="interaction/comments" element={<CommentsPage />} />
                                        <Route path="interaction/forms/manage" element={<ManageFormsPage />} />
                                        <Route path="interaction/forms/submissions" element={<FormSubmissionsPage />} />

                                        <Route path="appearance/menus" element={<MenusPage />} />
                                        <Route path="appearance/theme-settings" element={<ThemeSettingsPage />} /> {/* Updated path */}

                                        <Route path="users/all" element={<AllUsersPage />} /> {/* Updated path */}
                                        <Route path="users/add" element={<AddNewUserPage />} /> {/* Updated path */}
                                        {/* Add Role 3 specific routes here */}
                                        {/* <Route path="users/profile/:userId" element={<UserProfilePage />} /> */}
                                        <Route path="*" element={<div className="alert alert-warning">Page Not Found (404)</div>} />
                                    </>
                                ) : userRoleId === 5 ? ( // Role ID: 5 Routes (Deputy Manager - Example Placeholder)
                                    <>
                                        <Route index element={<Navigate to="/dashboard/overview" replace />} /> {/* Updated index route */}
                                        <Route path="dashboard/overview" element={<DashboardOverviewPage />} /> {/* Explicit path */}
                                        <Route path="dashboard/analytics" element={<AnalyticsPage />} />
                                        <Route path="dashboard/DashboardLayout" element={<DashboardLayout />} />

                                        <Route path="content/posts" element={<NewsEventsAdmin />} />
                                        <Route path="content/pages" element={<PagesPage />} />
                                        <Route path="content/categories" element={<CategoriesPage />} />
                                        <Route path="content/tags" element={<TagsPage />} />

                                        <Route path="media/library" element={<MediaLibraryPage />} /> {/* Updated path */}

                                        <Route path="interaction/comments" element={<CommentsPage />} />
                                        <Route path="interaction/forms/manage" element={<ManageFormsPage />} />
                                        <Route path="interaction/forms/submissions" element={<FormSubmissionsPage />} />

                                        <Route path="appearance/menus" element={<MenusPage />} />
                                        <Route path="appearance/theme-settings" element={<ThemeSettingsPage />} /> {/* Updated path */}

                                        <Route path="users/all" element={<AllUsersPage />} /> {/* Updated path */}
                                        <Route path="users/add" element={<AddNewUserPage />} /> {/* Updated path */}
                                        {/* Add Role 5 specific routes here */}
                                        {/* <Route path="users/profile/:userId" element={<UserProfilePage />} /> */}
                                        <Route path="*" element={<div className="alert alert-warning">Page Not Found (404)</div>} />
                                    </>
                                ) : userRoleId === 6 ? ( // Role ID: 6 Routes (Example Placeholder)
                                    <>
                                        <Route index element={<Navigate to="/dashboard/overview" replace />} /> {/* Updated index route */}
                                        <Route path="dashboard/overview" element={<DashboardOverviewPage />} /> {/* Explicit path */}
                                        <Route path="dashboard/analytics" element={<AnalyticsPage />} />
                                        <Route path="dashboard/DashboardLayout" element={<DashboardLayout />} />

                                        <Route path="content/posts" element={<NewsEventsAdmin />} />
                                        <Route path="content/pages" element={<PagesPage />} />
                                        <Route path="content/categories" element={<CategoriesPage />} />
                                        <Route path="content/tags" element={<TagsPage />} />

                                        <Route path="media/library" element={<MediaLibraryPage />} /> {/* Updated path */}

                                        <Route path="interaction/comments" element={<CommentsPage />} />
                                        <Route path="interaction/forms/manage" element={<ManageFormsPage />} />
                                        <Route path="interaction/forms/submissions" element={<FormSubmissionsPage />} />

                                        <Route path="appearance/menus" element={<MenusPage />} />
                                        <Route path="appearance/theme-settings" element={<ThemeSettingsPage />} /> {/* Updated path */}

                                        <Route path="users/all" element={<AllUsersPage />} /> {/* Updated path */}
                                        <Route path="users/add" element={<AddNewUserPage />} /> {/* Updated path */}
                                        {/* Add Role 6 specific routes here */}
                                        {/* <Route path="users/profile/:userId" element={<UserProfilePage />} /> */}
                                        <Route path="*" element={<div className="alert alert-warning">Page Not Found (404)</div>} />
                                    </>
                                ) : userRoleId === 8 ? ( // Role ID: 8 Routes (Example Placeholder)
                                    <>
                                        <Route index element={<Navigate to="/dashboard/overview" replace />} /> {/* Updated index route */}
                                        <Route path="dashboard/overview" element={<DashboardOverviewPage />} /> {/* Explicit path */}
                                        <Route path="dashboard/analytics" element={<AnalyticsPage />} />
                                        <Route path="dashboard/DashboardLayout" element={<DashboardLayout />} />

                                        <Route path="content/posts" element={<NewsEventsAdmin />} />
                                        <Route path="post/managePosts" element={<ManagePosts />} /> {/* Updated path */}
                                        <Route path="post/gallery" element={<MediaGalleryAdmin />} /> {/* Updated path */}
                                        <Route path="post/manageGallery" element={<ManageGallery />} /> {/* Updated path */}


                                        <Route path="content/pages" element={<PagesPage />} />
                                        <Route path="content/categories" element={<CategoriesPage />} />
                                        <Route path="content/tags" element={<TagsPage />} />

                                        <Route path="media/library" element={<MediaLibraryPage />} /> {/* Updated path */}

                                        <Route path="interaction/comments" element={<CommentsPage />} />
                                        <Route path="interaction/forms/manage" element={<ManageFormsPage />} />
                                        <Route path="interaction/forms/submissions" element={<FormSubmissionsPage />} />

                                        <Route path="appearance/menus" element={<MenusPage />} />
                                        <Route path="appearance/theme-settings" element={<ThemeSettingsPage />} /> {/* Updated path */}

                                        <Route path="users/all" element={<AllUsersPage />} /> {/* Updated path */}
                                        <Route path="users/add" element={<AddNewUserPage />} /> {/* Updated path */}
                                        {/* Add Role 8 specific routes here */}
                                        {/* <Route path="users/profile/:userId" element={<UserProfilePage />} /> */}
                                        <Route path="*" element={<div className="alert alert-warning">Page Not Found (404)</div>} />
                                   
                                    </>
                                ) : ( // Fallback/Default Routes for other authenticated roles
                                    <>
                                        <Route index element={<Navigate to="/dashboard/overview" replace />} /> {/* Updated index route */}
                                        <Route path="dashboard/overview" element={<DashboardOverviewPage />} /> {/* Explicit path */}
                                        {/* Add routes common to all other roles or a restricted view */}
                                        {/* <Route path="users/profile/:userId" element={<UserProfilePage />} /> Common profile access */}
                                        <Route path="*" element={<div className="alert alert-warning">Page Not Found or Access Denied (404)</div>} />

                                    </>
                                )
                            }
                            {/* Routes accessible to ALL authenticated users can go here, outside the conditional block if needed */}
                            {/* e.g., <Route path="/account-settings" element={<AccountSettingsPage />} /> */}
                        </Routes>
                    </MainLayout>
                    {/* Footer remains outside MainLayout but inside the flex container */}
                    <Footer />
                </div>
            )}
        </>
    );
};

export default App;
