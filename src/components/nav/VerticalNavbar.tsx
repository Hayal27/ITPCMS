import React from 'react';
import { NavLink } from 'react-router-dom';
import './sidebar.css'


interface VerticalNavbarProps {
  isSidebarOpen: boolean; // State passed from parent
}

const VerticalNavbar: React.FC<VerticalNavbarProps> = ({ isSidebarOpen }) => {
  // const { user } = useAuth(); // Get user info if needed

  // Helper function to apply 'active' class correctly with NavLink
  const getNavLinkClass = ({ isActive }: { isActive: boolean }): string => {
    return isActive ? "nav-link active" : "nav-link";
  };

  // Helper function for dropdown parent link active state
  const getDropdownIndicatorClass = (basePath: string): string => {
    // Check if the current URL starts with the base path of the dropdown section
    const isActive = typeof window !== 'undefined' && window.location.pathname.startsWith(basePath);
    return isActive
      ? "nav-link dropdown-indicator active" // Add 'active' if path matches
      : "nav-link dropdown-indicator";
  };

  // Base classes for the navbar
  const navClasses = `navbar navbar-vertical navbar-expand-xl navbar-light ${isSidebarOpen ? 'show' : ''}`;
  // ID matching the one previously used in TopNavbar's data-bs-target
  const collapseId = "navbarVerticalCollapse";

  return (
    // Consider adding a more specific class to this outer div if needed for targeting
    <div className='sidebar'>
      {/* Removed inline style: style={{ display: 'block' }} */}
      <nav className={navClasses}> {/* Bootstrap handles collapse visibility */}
      
        {/* Collapsible Menu Section */}
        {/* Apply collapse classes and the ID */}
        <div className={`collapse navbar-collapse ${isSidebarOpen ? 'show' : ''}`} id={collapseId}>
          <div className="navbar-vertical-content scrollbar">
            <ul className="navbar-nav flex-column mb-3" id="navbarVerticalNav">

              {/* === Dashboard Section === */}
              <li className="nav-item">
                <div className="row navbar-vertical-label-wrapper mt-3 mb-2">
                  <div className="col-auto navbar-vertical-label">App</div>
                  <div className="col ps-0"><hr className="mb-0 navbar-vertical-divider" /></div>
                </div>
                {/* Parent Link */}
                <a className={getDropdownIndicatorClass("/dashboard")} href="#dashboardMenu" role="button" data-bs-toggle="collapse" aria-expanded={typeof window !== 'undefined' && window.location.pathname.startsWith("/dashboard")} aria-controls="dashboardMenu">
                  <div className="d-flex align-items-center">
                    <span className="nav-link-icon"><span className="fas fa-chart-pie"></span></span>
                    <span className="nav-link-text ps-1">Dashboard</span>
                  </div>
                </a>
                {/* Submenu */}
                <ul className={`nav collapse ${typeof window !== 'undefined' && window.location.pathname.startsWith("/dashboard") ? 'show' : ''}`} id="dashboardMenu">
                  <li className="nav-item">
                    <NavLink className={getNavLinkClass} to="/dashboard/overview" end>
                      <div className="d-flex align-items-center"><span className="nav-link-text ps-1">Overview</span></div>
                    </NavLink>
                  </li>
                  <li className="nav-item">
                    <NavLink className={getNavLinkClass} to="/dashboard/analytics">
                      <div className="d-flex align-items-center"><span className="nav-link-text ps-1">Analytics</span></div>
                    </NavLink>
                  </li>
                  {/* <li className="nav-item">
                    <NavLink className={getNavLinkClass} to="/dashboard/health">
                      <div className="d-flex align-items-center"><span className="nav-link-text ps-1">Site Health</span></div>
                    </NavLink>
                  </li> */}
                </ul>
              </li>

              {/* === Content Section === */}
              <li className="nav-item">
                <div className="row navbar-vertical-label-wrapper mt-3 mb-2">
                  <div className="col-auto navbar-vertical-label">Content</div>
                  <div className="col ps-0"><hr className="mb-0 navbar-vertical-divider" /></div>
                </div>
                {/* Posts */}
                <NavLink className={getNavLinkClass} to="/content/posts" role="button">
                   <div className="d-flex align-items-center"><span className="nav-link-icon"><span className="fas fa-pen-nib"></span></span><span className="nav-link-text ps-1">Posts</span></div>
                </NavLink>
                {/* Pages */}
                <NavLink className={getNavLinkClass} to="/content/pages" role="button">
                   <div className="d-flex align-items-center"><span className="nav-link-icon"><span className="fas fa-file-alt"></span></span><span className="nav-link-text ps-1">Pages</span></div>
                </NavLink>
                {/* Categories */}
                <NavLink className={getNavLinkClass} to="/content/categories" role="button">
                   <div className="d-flex align-items-center"><span className="nav-link-icon"><span className="fas fa-folder"></span></span><span className="nav-link-text ps-1">Categories</span></div>
                </NavLink>
                {/* Tags */}
                <NavLink className={getNavLinkClass} to="/content/tags" role="button">
                   <div className="d-flex align-items-center"><span className="nav-link-icon"><span className="fas fa-tags"></span></span><span className="nav-link-text ps-1">Tags</span></div>
                </NavLink>
              </li>

              {/* === Media Section === */}
               <li className="nav-item">
                <div className="row navbar-vertical-label-wrapper mt-3 mb-2">
                  <div className="col-auto navbar-vertical-label">Media</div>
                  <div className="col ps-0"><hr className="mb-0 navbar-vertical-divider" /></div>
                </div>
                <NavLink className={getNavLinkClass} to="/media/library" role="button">
                   <div className="d-flex align-items-center"><span className="nav-link-icon"><span className="fas fa-photo-video"></span></span><span className="nav-link-text ps-1">Library</span></div>
                </NavLink>
              </li>

              {/* === Interaction Section === */}
              <li className="nav-item">
                <div className="row navbar-vertical-label-wrapper mt-3 mb-2">
                  <div className="col-auto navbar-vertical-label">Interaction</div>
                  <div className="col ps-0"><hr className="mb-0 navbar-vertical-divider" /></div>
                </div>
                {/* Comments */}
                <NavLink className={getNavLinkClass} to="/interaction/comments" role="button">
                   <div className="d-flex align-items-center"><span className="nav-link-icon"><span className="fas fa-comments"></span></span><span className="nav-link-text ps-1">Comments</span></div>
                </NavLink>
                {/* Forms Dropdown */}
                 <a className={getDropdownIndicatorClass("/interaction/forms")} href="#formsMenu" role="button" data-bs-toggle="collapse" aria-expanded={typeof window !== 'undefined' && window.location.pathname.startsWith("/interaction/forms")} aria-controls="formsMenu">
                  <div className="d-flex align-items-center">
                    <span className="nav-link-icon"><span className="fas fa-clipboard-list"></span></span>
                    <span className="nav-link-text ps-1">Forms</span>
                  </div>
                </a>
                <ul className={`nav collapse ${typeof window !== 'undefined' && window.location.pathname.startsWith("/interaction/forms") ? 'show' : ''}`} id="formsMenu">
                  <li className="nav-item">
                    <NavLink className={getNavLinkClass} to="/interaction/forms/manage" end>
                      <div className="d-flex align-items-center"><span className="nav-link-text ps-1">Manage Forms</span></div>
                    </NavLink>
                  </li>
                  <li className="nav-item">
                    <NavLink className={getNavLinkClass} to="/interaction/forms/submissions">
                      <div className="d-flex align-items-center"><span className="nav-link-text ps-1">Submissions</span></div>
                    </NavLink>
                  </li>
                </ul>
              </li>

               {/* === Appearance Section === */}
               <li className="nav-item">
                <div className="row navbar-vertical-label-wrapper mt-3 mb-2">
                  <div className="col-auto navbar-vertical-label">Appearance</div>
                  <div className="col ps-0"><hr className="mb-0 navbar-vertical-divider" /></div>
                </div>
                {/* Menus */}
                <NavLink className={getNavLinkClass} to="/appearance/menus" role="button">
                   <div className="d-flex align-items-center"><span className="nav-link-icon"><span className="fas fa-bars"></span></span><span className="nav-link-text ps-1">Menus</span></div>
                </NavLink>
                {/* Theme Settings */}
                <NavLink className={getNavLinkClass} to="/appearance/theme-settings" role="button">
                   <div className="d-flex align-items-center"><span className="nav-link-icon"><span className="fas fa-palette"></span></span><span className="nav-link-text ps-1">Theme Settings</span></div>
                </NavLink>
                {/* Widgets (Optional) */}
                {/* <NavLink className={getNavLinkClass} to="/appearance/widgets" role="button">
                   <div className="d-flex align-items-center"><span className="nav-link-icon"><span className="fas fa-puzzle-piece"></span></span><span className="nav-link-text ps-1">Widgets</span></div>
                </NavLink> */}
              </li>

              {/* === Users Section === */}
              <li className="nav-item">
                <div className="row navbar-vertical-label-wrapper mt-3 mb-2">
                  <div className="col-auto navbar-vertical-label">Users</div>
                  <div className="col ps-0"><hr className="mb-0 navbar-vertical-divider" /></div>
                </div>
                {/* All Users */}
                <NavLink className={getNavLinkClass} to="/users/all" role="button">
                   <div className="d-flex align-items-center"><span className="nav-link-icon"><span className="fas fa-users"></span></span><span className="nav-link-text ps-1">All Users</span></div>
                </NavLink>
                {/* Add New */}
                <NavLink className={getNavLinkClass} to="/users/add" role="button">
                   <div className="d-flex align-items-center"><span className="nav-link-icon"><span className="fas fa-user-plus"></span></span><span className="nav-link-text ps-1">Add New</span></div>
                </NavLink>
                {/* Your Profile - Conditionally Rendered */}
                {/* {user && (
                  <NavLink className={getNavLinkClass} to={`/users/profile/${user.id}`} role="button">
                     <div className="d-flex align-items-center"><span className="nav-link-icon"><span className="fas fa-user-circle"></span></span><span className="nav-link-text ps-1">Your Profile</span></div>
                  </NavLink>
                )} */}
                 <NavLink className={getNavLinkClass} to="/users/profile/me" role="button"> {/* Example static link */}
                     <div className="d-flex align-items-center"><span className="nav-link-icon"><span className="fas fa-user-circle"></span></span><span className="nav-link-text ps-1">Your Profile</span></div>
                  </NavLink>
                {/* Roles & Permissions */}
                <NavLink className={getNavLinkClass} to="/users/roles" role="button">
                   <div className="d-flex align-items-center"><span className="nav-link-icon"><span className="fas fa-user-shield"></span></span><span className="nav-link-text ps-1">Roles & Permissions</span></div>
                </NavLink>
              </li>

               {/* === Plugins Section === */}
               <li className="nav-item">
                <div className="row navbar-vertical-label-wrapper mt-3 mb-2">
                  <div className="col-auto navbar-vertical-label">Plugins</div>
                  <div className="col ps-0"><hr className="mb-0 navbar-vertical-divider" /></div>
                </div>
                {/* Installed Plugins */}
                <NavLink className={getNavLinkClass} to="/plugins/installed" role="button">
                   <div className="d-flex align-items-center"><span className="nav-link-icon"><span className="fas fa-plug"></span></span><span className="nav-link-text ps-1">Installed Plugins</span></div>
                </NavLink>
                {/* Add New Plugin */}
                <NavLink className={getNavLinkClass} to="/plugins/add" role="button">
                   <div className="d-flex align-items-center"><span className="nav-link-icon"><span className="fas fa-plus-circle"></span></span><span className="nav-link-text ps-1">Add New</span></div>
                </NavLink>
              </li>

              {/* === Tools Section === */}
              <li className="nav-item">
                <div className="row navbar-vertical-label-wrapper mt-3 mb-2">
                  <div className="col-auto navbar-vertical-label">Tools</div>
                  <div className="col ps-0"><hr className="mb-0 navbar-vertical-divider" /></div>
                </div>
                {/* SEO Settings */}
                <NavLink className={getNavLinkClass} to="/tools/seo" role="button">
                   <div className="d-flex align-items-center"><span className="nav-link-icon"><span className="fas fa-search-dollar"></span></span><span className="nav-link-text ps-1">SEO Settings</span></div>
                </NavLink>
                {/* Import/Export */}
                <NavLink className={getNavLinkClass} to="/tools/import-export" role="button">
                   <div className="d-flex align-items-center"><span className="nav-link-icon"><span className="fas fa-exchange-alt"></span></span><span className="nav-link-text ps-1">Import / Export</span></div>
                </NavLink>
              </li>

              {/* === Settings Section === */}
              <li className="nav-item">
                <div className="row navbar-vertical-label-wrapper mt-3 mb-2">
                  <div className="col-auto navbar-vertical-label">Settings</div>
                  <div className="col ps-0"><hr className="mb-0 navbar-vertical-divider" /></div>
                </div>
                {/* General Settings */}
                <NavLink className={getNavLinkClass} to="/settings/general" role="button">
                   <div className="d-flex align-items-center"><span className="nav-link-icon"><span className="fas fa-cog"></span></span><span className="nav-link-text ps-1">General</span></div>
                </NavLink>
                {/* Add other settings links here */}
              </li>

            </ul>
          </div>
        </div>
      </nav>
    </div>
  );
};

export default VerticalNavbar;