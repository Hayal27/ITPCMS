import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Import Link and useNavigate
import { useAuth } from '../Auth/AuthContext'; // Import useAuth hook
import'../../../public/assets/img/team/3-thumb.jpg'
// --- Constants ---
// Define the backend URL (adjust if necessary)
const BACKEND_URL = "http://192.168.56.1:5000";

// --- Component: TopNavbar ---
// Renders the top navigation bar.
// Uses React state for dropdowns (theme, notifications, apps, profile) and theme switching.
// Implements click-outside-to-close for dropdowns.
// Handles logout using AuthContext, clearing state, calling backend, and redirecting.
// Receives props to toggle the vertical sidebar.

interface TopNavbarProps {
  toggleSidebar: () => void; // Function to toggle the vertical navbar
  isSidebarOpen: boolean; // State of the vertical navbar
}

const TopNavbar: React.FC<TopNavbarProps> = ({ toggleSidebar, isSidebarOpen }) => {
  // --- Hooks ---
  const navigate = useNavigate(); // Hook for programmatic navigation
  const { state, dispatch } = useAuth(); // Get state and dispatch from AuthContext
  const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null; // Get token safely

  // --- State ---
  type Theme = 'light' | 'dark' | 'auto';
  const [theme, setTheme] = useState<Theme>(() => {
    // Initialize theme from localStorage or default to 'auto'
    if (typeof window !== 'undefined' && window.localStorage) {
      return (localStorage.getItem('theme') as Theme) || 'auto';
    }
    return 'auto';
  });

  // State to track which dropdown is currently open. Only one can be open at a time.
  type OpenDropdownType = 'theme' | 'notifications' | 'apps' | 'profile' | null;
  const [openDropdown, setOpenDropdown] = useState<OpenDropdownType>(null);

  // --- Refs ---
  // Refs to the dropdown container elements (the <li> tags) for detecting outside clicks.
  const themeRef = useRef<HTMLLIElement>(null);
  const notificationsRef = useRef<HTMLLIElement>(null);
  const appsRef = useRef<HTMLLIElement>(null);
  const profileRef = useRef<HTMLLIElement>(null);

  // --- Effects ---

  // Effect to apply the selected theme, update localStorage, and manage system theme listener
  // Effect to apply the selected theme, update localStorage, and manage system theme listener
  useEffect(() => {
    // Ensure running in a browser environment
    if (typeof document === 'undefined' || typeof window === 'undefined' || !window.matchMedia) {
        console.warn("Theme effect: Not running in a compatible browser environment.");
        return;
    }

    const root = document.documentElement;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    // Function to apply the theme based on selection or system preference
    const applyTheme = (selectedTheme: Theme) => {
      const prefersDark = mediaQuery.matches; // Check current system preference
      let finalTheme: 'light' | 'dark';

      if (selectedTheme === 'auto') {
        finalTheme = prefersDark ? 'dark' : 'light';
      } else {
        finalTheme = selectedTheme;
      }
      // console.log(`Applying theme: ${finalTheme} (Selected: ${selectedTheme}, System Prefers Dark: ${prefersDark})`);
      root.setAttribute('data-theme', finalTheme); // Apply theme to HTML element
    };

    // Apply the current theme state initially or when theme state changes
    applyTheme(theme);

    // Update localStorage whenever the theme state changes
    // console.log(`Updating localStorage theme to: ${theme}`);
    localStorage.setItem('theme', theme);

    // Define the listener for system theme changes
    const systemThemeListener = (event: MediaQueryListEvent) => {
        // console.log(`System theme changed. Current component theme state: ${theme}`);
        // Check the *component's* current theme state. If it's 'auto', re-apply.
        // Reading localStorage here could be slightly delayed compared to state.
        // Since this listener is only active when theme === 'auto', we can be reasonably sure.
        // However, checking the theme state captured by the effect's closure is safer.
        if (theme === 'auto') {
            // console.log("Theme is 'auto', re-applying based on new system preference.");
            applyTheme('auto'); // Re-evaluate 'auto' based on the new system preference
        } else {
            // console.log("Theme is not 'auto', listener doing nothing.");
        }
    };


    // Add or remove the listener based on the current theme state
    if (theme === 'auto') {
        // console.log("Attaching system theme change listener.");
        mediaQuery.addEventListener('change', systemThemeListener);
    } else {
        // console.log("Theme is not 'auto', removing system theme change listener (if attached).");
        // No need to explicitly remove here, the cleanup function handles it.
    }

    // Cleanup function for the effect: This runs when the component unmounts
    // OR when the `theme` dependency changes *before* the effect runs again.
    return () => {
      // console.log("Cleaning up effect: Removing system theme change listener.");
      mediaQuery.removeEventListener('change', systemThemeListener);
    };

  }, [theme]); // Re-run this effect ONLY when the theme state changes


  // Effect to handle clicks outside of any open dropdown menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!openDropdown) return;

      const refs = {
        theme: themeRef,
        notifications: notificationsRef,
        apps: appsRef,
        profile: profileRef,
      };

      const currentRef = refs[openDropdown];

      if (currentRef?.current && !currentRef.current.contains(event.target as Node)) {
        setOpenDropdown(null); // Close the dropdown
      }
    };

    if (openDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openDropdown]);

  // --- Handlers ---

  // Handles changing the theme state and closes the dropdown
  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme);
    setOpenDropdown(null); // Close theme dropdown after selection
  };

  // Toggles the specified dropdown open or closed
  const toggleDropdown = (dropdown: OpenDropdownType) => {
    setOpenDropdown(prevOpenDropdown => (prevOpenDropdown === dropdown ? null : dropdown));
  };

  // Closes the currently open dropdown (used by links inside dropdowns)
  const closeDropdown = () => {
    setOpenDropdown(null);
  };

  // Handles the logout process - Updated Logic
  const handleLogout = async () => {
    console.log("Initiating logout...");
    closeDropdown(); // Close the profile dropdown first

    // Dispatch the logout action to update auth context state (clears user, token etc.)
    dispatch({ type: "LOGOUT" });

    // --- Backend API Call ---
    // Call the backend to invalidate the session/token server-side
    // Use the user ID from the auth state
    const userId = state.user; // Assuming state.user holds the user ID after login
    if (userId && token) {
        try {
            console.log(`Calling backend logout for user: ${userId}`);
            const response = await fetch(`${BACKEND_URL}/logout/${userId}`, {
                method: "PUT", // Method used in Header component
                headers: {
                    "Content-type": "application/json",
                    Authorization: `Bearer ${token}`
                }
            });
            if (!response.ok) {
                // Handle potential errors from the backend logout call
                console.error("Backend logout failed:", response.status, await response.text());
            } else {
                console.log("Backend logout successful.");
            }
        } catch (error) {
            console.error("Error during backend logout API call:", error);
        }
    } else {
        console.warn("User ID or token missing, skipping backend logout call.");
    }

    // --- Redirect to Login Page ---
    // The AuthProvider might already handle redirection, but explicit navigation is safe.
    // Adjust '/login' if your login route is different
    console.log("Redirecting to /login");
    navigate('/login');
  };


  // --- Render ---
  return (
    <nav className={`navbar navbar-light navbar-glass navbar-top navbar-expand ${!isSidebarOpen ? 'navbar-vertical-collapsed' : ''}`}>
      {/* Sidebar Toggle Button */}
      <button
        className="btn navbar-toggler-humburger-icon navbar-toggler me-1 me-sm-3"
        type="button"
        onClick={toggleSidebar}
        aria-expanded={isSidebarOpen}
        aria-label="Toggle Navigation"
      >
        <span className="navbar-toggle-icon"><span className="toggle-line"></span></span>
      </button>

      {/* Brand Logo */}
      <Link className="navbar-brand me-1 me-sm-3" to="/" onClick={closeDropdown}>
        <div className="d-flex align-items-center">
          {/* Ensure the logo path is correct */}
          <img className="me-2" src="/assets/img/logo/ITP.png" alt="ITPC Logo" width="55" />
       
        </div>
      </Link>

      {/* Search Box (Assuming Bootstrap JS handles its functionality) */}
      <ul className="navbar-nav align-items-center d-none d-lg-block">
        <li className="nav-item">
          <div className="search-box" data-list='{"valueNames":["title"]}'>
            <form className="position-relative" data-bs-toggle="search" data-bs-display="static">
              <input className="form-control search-input fuzzy-search" type="search" placeholder="Search..." aria-label="Search" />
              <span className="fas fa-search search-box-icon"></span>
            </form>
            <div className="btn-close-falcon-container position-absolute end-0 top-50 translate-middle shadow-none" data-bs-dismiss="search">
              <button className="btn btn-link btn-close-falcon p-0" aria-label="Close"></button>
            </div>
            {/* Search results dropdown */}
            <div className={`dropdown-menu border font-base start-0 mt-2 py-0 overflow-hidden w-100`}>
               <div className="scrollbar list py-3" style={{ maxHeight: '24rem' }}>
                 <h6 className="dropdown-header fw-medium text-uppercase px-x1 fs-11 pt-0 pb-2">Recently Browsed</h6>
                 {/* Example Search Links - Update paths as needed */}
                 <Link className="dropdown-item fs-10 px-x1 py-1 hover-primary" to="/app/events/event-detail" onClick={closeDropdown}>
                   <div className="d-flex align-items-center">
                     <span className="fas fa-circle me-2 text-300 fs-11"></span>
                     <div className="fw-normal title">Pages <span className="fas fa-chevron-right mx-1 text-500 fs-11" data-fa-transform="shrink-2"></span> Events</div>
                   </div>
                 </Link>
                 <Link className="dropdown-item fs-10 px-x1 py-1 hover-primary" to="/app/e-commerce/customers" onClick={closeDropdown}>
                    <div className="d-flex align-items-center">
                        <span className="fas fa-circle me-2 text-300 fs-11"></span>
                        <div className="fw-normal title">E-commerce <span className="fas fa-chevron-right mx-1 text-500 fs-11" data-fa-transform="shrink-2"></span> Customers</div>
                    </div>
                 </Link>
                 {/* Add more search result examples or dynamic content here */}
               </div>
               <div className="text-center mt-n3">
                 <p className="fallback fw-bold fs-8 d-none">No Result Found.</p>
               </div>
            </div>
          </div>
        </li>
      </ul>

      {/* Navbar Icons */}
      <ul className="navbar-nav navbar-nav-icons ms-auto flex-row align-items-center">

        {/* Theme Control Dropdown */}
        <li ref={themeRef} className={`nav-item ps-2 pe-0 dropdown theme-control-dropdown ${openDropdown === 'theme' ? 'show' : ''}`}>
          <a
            className="nav-link d-flex align-items-center dropdown-toggle fa-icon-wait fs-9 pe-1 py-0"
            href="#"
            role="button"
            id="themeSwitchDropdown"
            aria-haspopup="true"
            aria-expanded={openDropdown === 'theme'}
            onClick={(e) => { e.preventDefault(); toggleDropdown('theme'); }}
          >
            {/* Dynamically set icon based on theme state */}
            <span className={`fas fs-7 ${theme === 'light' ? 'fa-sun' : theme === 'dark' ? 'fa-moon' : 'fa-adjust'}`} data-fa-transform="shrink-2"></span>
          </a>
          <div
             className={`dropdown-menu dropdown-menu-end dropdown-caret border py-0 mt-3 ${openDropdown === 'theme' ? 'show' : ''}`}
             aria-labelledby="themeSwitchDropdown"
           >
            <div className="bg-white dark__bg-1000 rounded-2 py-2">
              <button className={`dropdown-item d-flex align-items-center gap-2 ${theme === 'light' ? 'active' : ''}`} type="button" onClick={() => handleThemeChange('light')}>
                <span className="fas fa-sun me-2"></span>Light
                {theme === 'light' && <span className="fas fa-check dropdown-check-icon ms-auto text-600"></span>}
              </button>
              <button className={`dropdown-item d-flex align-items-center gap-2 ${theme === 'dark' ? 'active' : ''}`} type="button" onClick={() => handleThemeChange('dark')}>
                <span className="fas fa-moon me-2"></span>Dark
                {theme === 'dark' && <span className="fas fa-check dropdown-check-icon ms-auto text-600"></span>}
              </button>
              <button className={`dropdown-item d-flex align-items-center gap-2 ${theme === 'auto' ? 'active' : ''}`} type="button" onClick={() => handleThemeChange('auto')}>
                <span className="fas fa-adjust me-2"></span>Auto
                {theme === 'auto' && <span className="fas fa-check dropdown-check-icon ms-auto text-600"></span>}
              </button>
            </div>
          </div>
        </li>

        {/* Notifications Dropdown */}
        <li ref={notificationsRef} className={`nav-item dropdown ${openDropdown === 'notifications' ? 'show' : ''}`}>
          <a
            className="nav-link notification-indicator notification-indicator-primary px-0 fa-icon-wait"
            id="navbarDropdownNotification"
            href="#"
            role="button"
            aria-haspopup="true"
            aria-expanded={openDropdown === 'notifications'}
            onClick={(e) => { e.preventDefault(); toggleDropdown('notifications'); }}
          >
            <span className="fas fa-bell" data-fa-transform="shrink-6" style={{ fontSize: '33px' }}></span>
            {/* Optional: Add a badge for unread count here */}
          </a>
          <div
            className={`dropdown-menu dropdown-caret dropdown-menu-end dropdown-menu-card dropdown-menu-notification dropdown-caret-bg ${openDropdown === 'notifications' ? 'show' : ''}`}
            aria-labelledby="navbarDropdownNotification"
          >
            <div className="card card-notification shadow-none">
              <div className="card-header">
                <div className="row justify-content-between align-items-center">
                  <div className="col-auto"><h6 className="card-header-title mb-0">Notifications</h6></div>
                  <div className="col-auto ps-0 ps-sm-3"><a className="card-link fw-normal" href="#">Mark all as read</a></div> {/* Add onClick handler */}
                </div>
              </div>
              <div className="scrollbar-overlay" style={{ maxHeight: '19rem' }}>
                <div className="list-group list-group-flush fw-normal fs-10">
                  {/* Example Notifications - Replace with dynamic data */}
                  <div className="list-group-title border-bottom">NEW</div>
                  <div className="list-group-item">
                    <a className="notification notification-flush notification-unread" href="#!">
                       <div className="notification-avatar">
                         <div className="avatar avatar-2xl me-3"><img className="rounded-circle" src="/assets/img/team/1-thumb.jpg" alt="" /></div>
                       </div>
                       <div className="notification-body">
                         <p className="mb-1"><strong>Emma Watson</strong> replied to your comment : "Hello world 😍"</p>
                         <span className="notification-time"><span className="me-2" role="img" aria-label="Emoji">💬</span>Just now</span>
                       </div>
                    </a>
                  </div>
                   <div className="list-group-item">
                    <a className="notification notification-flush notification-unread" href="#!">
                       <div className="notification-avatar">
                         <div className="avatar avatar-2xl me-3">
                           <div className="avatar-name rounded-circle"><span>AB</span></div>
                         </div>
                       </div>
                       <div className="notification-body">
                         <p className="mb-1"><strong>Albert Brooks</strong> reacted to your photo</p>
                         <span className="notification-time"><span className="me-2 fab fa-gratipay text-danger"></span>9hr</span>
                       </div>
                    </a>
                  </div>
                  <div className="list-group-title border-bottom">EARLIER</div>
                  {/* Add more notification items here */}
                </div>
              </div>
              <div className="card-footer text-center border-top">
                <Link className="card-link d-block" to="/app/social/notifications" onClick={closeDropdown}>View all</Link> {/* Update path if needed */}
              </div>
            </div>
          </div>
        </li>

        {/* App Launcher Dropdown */}
        <li ref={appsRef} className={`nav-item dropdown px-1 ${openDropdown === 'apps' ? 'show' : ''}`}>
          <a
            className="nav-link fa-icon-wait nine-dots p-1"
            id="navbarDropdownMenu"
            href="#"
            role="button"
            aria-haspopup="true"
            aria-expanded={openDropdown === 'apps'}
            onClick={(e) => { e.preventDefault(); toggleDropdown('apps'); }}
          >
            {/* SVG for nine dots */}
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="43" viewBox="0 0 16 16" fill="none">
              <circle cx="2" cy="2" r="2" fill="currentColor"></circle>
              <circle cx="2" cy="8" r="2" fill="currentColor"></circle>
              <circle cx="2" cy="14" r="2" fill="currentColor"></circle>
              <circle cx="8" cy="8" r="2" fill="currentColor"></circle>
              <circle cx="8" cy="14" r="2" fill="currentColor"></circle>
              <circle cx="14" cy="8" r="2" fill="currentColor"></circle>
              <circle cx="14" cy="14" r="2" fill="currentColor"></circle>
              <circle cx="8" cy="2" r="2" fill="currentColor"></circle>
              <circle cx="14" cy="2" r="2" fill="currentColor"></circle>
            </svg>
          </a>
          <div
            className={`dropdown-menu dropdown-caret dropdown-menu-end dropdown-menu-card dropdown-caret-bg ${openDropdown === 'apps' ? 'show' : ''}`}
            aria-labelledby="navbarDropdownMenu"
          >
            <div className="card shadow-none">
              <div className="scrollbar-overlay nine-dots-dropdown">
                <div className="card-body px-3">
                  <div className="row text-center gx-0 gy-0">
                    {/* Example App Links - Update paths and icons */}
                    <div className="col-4">
                      <Link className="d-block hover-bg-200 px-2 py-3 rounded-3 text-center text-decoration-none" to="/pages/user/profile" onClick={closeDropdown}>
                        <div className="avatar avatar-2xl"> <img className="rounded-circle" src="/assets/img/team/3.jpg" alt="" /></div>
                        <p className="mb-0 fw-medium text-800 text-truncate fs-11">Account</p>
                      </Link>
                    </div>
                    <div className="col-4"><a className="d-block hover-bg-200 px-2 py-3 rounded-3 text-center text-decoration-none" href="#!" target="_blank"><img className="rounded" src="/assets/img/nav-icons/google-cloud.png" alt="" width="40" height="40" /><p className="mb-0 fw-medium text-800 text-truncate fs-11">Cloud</p></a></div>
                    <div className="col-4"><a className="d-block hover-bg-200 px-2 py-3 rounded-3 text-center text-decoration-none" href="#!" target="_blank"><img className="rounded" src="/assets/img/nav-icons/slack.png" alt="" width="40" height="40" /><p className="mb-0 fw-medium text-800 text-truncate fs-11">Slack</p></a></div>
                    {/* Add more app links here */}
                     <div className="col-12"><a className="btn btn-outline-primary btn-sm mt-4" href="#!">Show more</a></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </li>

        {/* Profile Dropdown */}
        <li ref={profileRef} className={`nav-item dropdown ${openDropdown === 'profile' ? 'show' : ''}`}>
          <a
            className="nav-link pe-0 ps-2"
            id="navbarDropdownUser"
            href="#"
            role="button"
            aria-haspopup="true"
            aria-expanded={openDropdown === 'profile'}
            onClick={(e) => { e.preventDefault(); toggleDropdown('profile'); }}
          >
            <div className="avatar avatar-xl">
              {/* TODO: Use dynamic profile picture from state if available */}
              <img className="rounded-circle" src="/assets/img/team/3-thumb.jpg" alt="User Avatar" />
            </div>
          </a>
          <div
            className={`dropdown-menu dropdown-caret dropdown-menu-end py-0 ${openDropdown === 'profile' ? 'show' : ''}`}
            aria-labelledby="navbarDropdownUser"
          >
            <div className="bg-white dark__bg-1000 rounded-2 py-2">
              {/* Optional: Display user name/email */}
              {/* <div className="dropdown-item fw-bold">{state.name || 'User'}</div> */}
              {/* <div className="dropdown-divider"></div> */}
             
              <div className="dropdown-divider"></div>
              <a className="dropdown-item" href="#!">Set status</a>
              <Link className="dropdown-item" to="/pages/user/profile" onClick={closeDropdown}>Profile &amp; account</Link> {/* Update path if needed */}
              <a className="dropdown-item" href="#!">Feedback</a>
              <div className="dropdown-divider"></div>
              <Link className="dropdown-item" to="/pages/user/settings" onClick={closeDropdown}>Settings</Link> {/* Update path if needed */}
              {/* Updated Logout Button */}
              <button className="dropdown-item" type="button" onClick={handleLogout}>Logout</button>
            </div>
          </div>
        </li>
      </ul>
    </nav>
  );
};

export default TopNavbar;