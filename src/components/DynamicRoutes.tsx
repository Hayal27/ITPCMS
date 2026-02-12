import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { getMyNavigation, Menu } from '../services/apiService';

// Import all page components
import DashboardOverviewPage from '../pages/dashboard/DashboardOverviewPage';
import AnalyticsPage from '../pages/dashboard/AnalyticsPage';
import NewsEventsAdmin from '../pages/content/NewsEventsAdmin';
import ManagePosts from '../pages/content/ManagePosts';
import MediaGalleryAdmin from '../pages/content/MediaGalleryAdmin';
import ManageGallery from '../pages/content/ManageGallery';
import PagesPage from '../pages/content/PagesPage';
import CategoriesPage from '../pages/content/CategoriesPage';
import TagsPage from '../pages/content/TagsPage';
import OfficeAdmin from '../pages/content/OfficeAdmin';
import LeasedLandAdmin from '../pages/content/LeasedLandAdmin';
import LiveEventAdmin from '../pages/content/LiveEventAdmin';
import CareerAdmin from '../pages/content/CareerAdmin';
import PartnersInvestorsAdmin from '../pages/content/PartnersInvestorsAdmin';
import IncubationAdmin from '../pages/content/IncubationAdmin';
import TrainingAdmin from '../pages/content/TrainingAdmin';
import InvestmentStepsAdmin from '../pages/content/InvestmentStepsAdmin';
import ManageBoard from '../pages/content/ManageBoard';
import ManageWhoWeAre from '../pages/content/ManageWhoWeAre';
import MediaLibraryPage from '../pages/media/MediaLibraryPage';
import CommentsPage from '../pages/interaction/CommentsPage';
import ManageFormsPage from '../pages/interaction/forms/ManageFormsPage';
import FormSubmissionsPage from '../pages/interaction/forms/FormSubmissionsPage';
import ContactMessagesPage from '../pages/interaction/ContactMessagesPage';
import InvestorInquiriesPage from '../pages/interaction/InvestorInquiriesPage';
import MenuManagementPage from '../pages/appearance/MenuManagementPage';
import ThemeSettingsPage from '../pages/appearance/ThemeSettingsPage';
import AllUsersPage from '../pages/users/AllUsersPage';
import AddNewUserPage from '../pages/users/AddNewUserPage';
import EditUserPage from '../pages/users/EditUserPage';
import ManageEmployeesPage from '../pages/users/ManageEmployeesPage';
import SubscribersAdmin from '../pages/users/SubscribersAdmin';
import RolesPermissionsPage from '../pages/users/RolesPermissionsPage';
import MenuPermissionsMatrix from '../pages/users/MenuPermissionsMatrix';
import GeneralSettingsPage from '../pages/settings/GeneralSettingsPage';
import AuditLogs from '../pages/admin/AuditLogs';
import IdGeneratorPage from '../pages/tools/IdGeneratorPage';
import DashboardLayout from '../components/DashboardLayout';

// Map paths to components
const PATH_COMPONENT_MAP: Record<string, React.ComponentType<any>> = {
    '/dashboard/overview': DashboardOverviewPage,
    '/dashboard/analytics': AnalyticsPage,
    '/dashboard/DashboardLayout': DashboardLayout,
    '/content/posts': NewsEventsAdmin,
    '/post/managePosts': ManagePosts,
    '/post/gallery': MediaGalleryAdmin,
    '/post/manageGallery': ManageGallery,
    '/content/pages': PagesPage,
    '/content/categories': CategoriesPage,
    '/content/tags': TagsPage,
    '/content/offices': OfficeAdmin,
    '/content/leased-lands': LeasedLandAdmin,
    '/content/live-events': LiveEventAdmin,
    '/content/careers': CareerAdmin,
    '/content/partners-investors': PartnersInvestorsAdmin,
    '/content/incubation': IncubationAdmin,
    '/content/trainings': TrainingAdmin,
    '/content/investment-steps': InvestmentStepsAdmin,
    '/content/board-members': ManageBoard,
    '/content/who-we-are': ManageWhoWeAre,
    '/media/library': MediaLibraryPage,
    '/interaction/comments': CommentsPage,
    '/interaction/forms/manage': ManageFormsPage,
    '/interaction/forms/submissions': FormSubmissionsPage,
    '/interaction/contact-messages': ContactMessagesPage,
    '/interaction/investor-inquiries': InvestorInquiriesPage,
    '/appearance/menus': MenuManagementPage,
    '/appearance/theme-settings': ThemeSettingsPage,
    '/users/all': AllUsersPage,
    '/users/add': AddNewUserPage,
    '/users/edit/:userId': EditUserPage,
    '/users/manage-employees': ManageEmployeesPage,
    '/users/subscribers': SubscribersAdmin,
    '/users/roles': RolesPermissionsPage,
    '/users/permissions-matrix': MenuPermissionsMatrix,
    '/settings/general': GeneralSettingsPage,
    '/settings/audit-logs': AuditLogs,
    '/tools/id-generator': IdGeneratorPage,
};

const DynamicRoutes: React.FC = () => {
    const [permittedMenus, setPermittedMenus] = useState<Menu[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPermittedMenus = async () => {
            try {
                const menus = await getMyNavigation();
                setPermittedMenus(menus);
            } catch (error) {
                console.error('[DynamicRoutes] Failed to fetch menus:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchPermittedMenus();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading routes...</span>
                </div>
            </div>
        );
    }

    // Extract all permitted paths (including nested paths)
    const permittedPaths = new Set<string>();

    permittedMenus.forEach(menu => {
        if (menu.path && !menu.is_section && !menu.is_dropdown) {
            permittedPaths.add(menu.path);
        }
    });

    // Always allow dashboard overview as default
    permittedPaths.add('/dashboard/overview');

    // Utility: If user has access to the list, they should have access to the edit page
    if (permittedPaths.has('/users/all')) {
        permittedPaths.add('/users/edit/:userId');
        permittedPaths.add('/users/add');
    }

    console.log('[DynamicRoutes] Permitted paths:', Array.from(permittedPaths));

    return (
        <Routes>
            {/* Default redirect to dashboard */}
            <Route index element={<Navigate to="/dashboard/overview" replace />} />

            {/* Dynamically generate routes based on user permissions */}
            {Array.from(permittedPaths).map(path => {
                const Component = PATH_COMPONENT_MAP[path];

                if (Component) {
                    return (
                        <Route
                            key={path}
                            path={path.startsWith('/') ? path.substring(1) : path}
                            element={<Component />}
                        />
                    );
                }

                return null;
            })}

            {/* Catch-all route for unauthorized/unknown paths */}
            <Route
                path="*"
                element={
                    <div className="container mx-auto px-4 py-8">
                        <div className="alert alert-danger" role="alert">
                            <h4 className="alert-heading">
                                <i className="fas fa-exclamation-triangle me-2"></i>
                                Access Denied
                            </h4>
                            <p>
                                You do not have permission to access this page. If you believe this is an error,
                                please contact your system administrator.
                            </p>
                            <hr />
                            <p className="mb-0">
                                <a href="/dashboard/overview" className="alert-link">
                                    Return to Dashboard
                                </a>
                            </p>
                        </div>
                    </div>
                }
            />
        </Routes>
    );
};

export default DynamicRoutes;
