import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../Auth/AuthContext';
import { getContactMessages, getInvestorInquiries, ContactMessage, InvestorInquiry } from '../../services/apiService';

// --- Constants ---
const BACKEND_URL = import.meta.env.VITE_API_URL || "http://localhost:5005";

interface TopNavbarProps {
  toggleSidebar: () => void;
  isSidebarOpen: boolean;
}

// Unified Notification Type for display
interface NotificationItem {
  id: string | number;
  type: 'contact' | 'inquiry';
  title: string;
  message: string;
  time: string;
  isRead: boolean;
  link: string;
}

const TopNavbar: React.FC<TopNavbarProps> = ({ toggleSidebar, isSidebarOpen }) => {
  const navigate = useNavigate();
  const { user, dispatch } = useAuth();
  const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;

  // --- State ---
  type Theme = 'light' | 'dark';
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      return (localStorage.getItem('theme') as Theme) || 'dark';
    }
    return 'dark';
  });

  type OpenDropdownType = 'notifications' | 'apps' | 'profile' | null;
  const [openDropdown, setOpenDropdown] = useState<OpenDropdownType>(null);

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // --- Refs ---
  const notificationsRef = useRef<HTMLDivElement>(null);
  const appsRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // --- Effects ---
  useEffect(() => {
    if (typeof document === 'undefined' || typeof window === 'undefined' || !window.matchMedia) return;
    const root = document.documentElement;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const applyTheme = (selectedTheme: Theme) => {
      if (selectedTheme === 'dark') {
        root.classList.add('dark');
        document.body.classList.add('dark');
      } else {
        root.classList.remove('dark');
        document.body.classList.remove('dark');
      }
      root.setAttribute('data-bs-theme', selectedTheme);
    };

    applyTheme(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!openDropdown) return;

      const refs: Record<string, React.RefObject<HTMLDivElement>> = {
        notifications: notificationsRef,
        apps: appsRef,
        profile: profileRef,
      };

      const currentRef = openDropdown ? refs[openDropdown] : null;
      if (currentRef?.current && !currentRef.current.contains(event.target as Node)) {
        setOpenDropdown(null);
      }
    };

    if (openDropdown) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openDropdown]);

  // Fetch Notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        // Fetch raw data
        const [contactMsgs, inquiries] = await Promise.all([
          getContactMessages().catch(() => []),
          getInvestorInquiries().catch(() => [])
        ]);

        // Process Contact Messages
        const contactNotifs: NotificationItem[] = (contactMsgs as ContactMessage[])
          .filter(msg => msg.status === 'new')
          .map(msg => ({
            id: `contact-${msg.id}`,
            type: 'contact',
            title: `New Message from ${msg.name}`,
            message: msg.message.substring(0, 40) + '...',
            time: new Date(msg.created_at).toLocaleString(),
            isRead: false,
            link: '/interaction/contact-messages'
          }));

        // Process Investor Inquiries
        const inquiryNotifs: NotificationItem[] = (inquiries as InvestorInquiry[])
          .filter(inq => inq.status === 'pending')
          .map(inq => ({
            id: `inquiry-${inq.id}`,
            type: 'inquiry',
            title: `New Inquiry from ${inq.organization || inq.full_name}`,
            message: `Interest: ${inq.area_of_interest || 'General'}`,
            time: new Date(inq.created_at).toLocaleString(),
            isRead: false,
            link: '/interaction/investor-inquiries'
          }));

        // Combine and sort by newest first
        const combined = [...contactNotifs, ...inquiryNotifs].sort((a, b) =>
          new Date(b.time).getTime() - new Date(a.time).getTime()
        );

        setNotifications(combined);
        setUnreadCount(combined.length);

      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };

    if (user) {
      fetchNotifications();
      // Optional: Poll every minute
      const interval = setInterval(fetchNotifications, 60000);
      return () => clearInterval(interval);
    }
  }, [user]);


  // --- Handlers ---

  const toggleDropdown = (dropdown: OpenDropdownType) => {
    setOpenDropdown(prev => (prev === dropdown ? null : dropdown));
  };

  const closeDropdown = () => setOpenDropdown(null);

  const handleLogout = async () => {
    closeDropdown();
    dispatch({ type: "LOGOUT" });
    const userId = user?.user_id;
    if (userId && token) {
      try {
        await fetch(`${BACKEND_URL}/logout/${userId}`, {
          method: "PUT",
          headers: { "Content-type": "application/json", Authorization: `Bearer ${token}` }
        });
      } catch (error) {
        console.error("Error during backend logout API call:", error);
      }
    }
    navigate('/login');
  };

  return (
    <div className="w-full h-full flex items-center justify-between px-4 lg:px-6">
      {/* --- Left Side: Toggle --- */}
      <div className="flex items-center gap-4">
        {/* Toggle Button */}
        <button
          onClick={toggleSidebar}
          className="p-2 -ml-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Toggle Sidebar"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* --- Right Side: Icons & Profile --- */}
      <div className="flex items-center gap-2 sm:gap-4">

        {/* Theme Toggle */}
        <div className="relative">
          <button
            onClick={() => setTheme(prev => prev === 'light' ? 'dark' : 'light')}
            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 transition-colors focus:outline-none relative"
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          >
            {theme === 'light' ? (
              <svg className="w-5 h-5 transition-transform hover:rotate-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg className="w-5 h-5 transition-transform hover:-rotate-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>
        </div>

        {/* Notifications */}
        <div className="relative" ref={notificationsRef}>
          <button
            onClick={() => toggleDropdown('notifications')}
            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 transition-colors focus:outline-none relative"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center border-2 border-white dark:border-gray-800">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {openDropdown === 'notifications' && (
            <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 z-50 overflow-hidden animate-fade-in-down">
              <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-900/50">
                <h3 className="text-sm font-semibold text-gray-800 dark:text-white">Notifications</h3>
                <span className="text-xs text-gray-500">{unreadCount} New</span>
              </div>
              <div className="max-h-72 overflow-y-auto">
                {notifications.length > 0 ? (
                  notifications.map(note => (
                    <Link
                      key={note.id}
                      to={note.link}
                      onClick={closeDropdown}
                      className="block px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors border-b border-gray-50 dark:border-gray-700/50 last:border-0 relative group"
                    >
                      <div className="flex gap-3">
                        <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${note.type === 'contact' ? 'bg-blue-500' : 'bg-green-500'}`}></div>
                        <div>
                          <p className="text-sm text-gray-800 dark:text-gray-200 font-medium leading-snug">{note.title}</p>
                          <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{note.message}</p>
                          <p className="text-[10px] text-gray-400 mt-1">{note.time}</p>
                        </div>
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="p-6 text-center text-gray-500 dark:text-gray-400 text-sm">
                    No new notifications
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Profile */}
        <div className="relative pl-2 ml-2 border-l border-gray-200 dark:border-gray-700" ref={profileRef}>
          <button
            onClick={() => toggleDropdown('profile')}
            className="flex items-center gap-2 focus:outline-none"
          >
            <div className="w-8 h-8 md:w-9 md:h-9 rounded-full overflow-hidden border-2 border-gray-200 dark:border-gray-600 ring-2 ring-transparent hover:ring-blue-100 dark:hover:ring-blue-900 transition-all flex items-center justify-center bg-gray-100">
              {user?.name ? (
                <span className="text-sm font-bold text-gray-600">{user.name.charAt(0).toUpperCase()}</span>
              ) : (
                <img src="/assets/img/team/3-thumb.jpg" alt="User" className="w-full h-full object-cover" />
              )}
            </div>
            <div className="hidden md:block text-left">
              <p className="text-xs font-semibold text-gray-700 dark:text-gray-200 leading-tight">{user?.name || 'User'}</p>
              <p className="text-[10px] text-gray-500 dark:text-gray-400 leading-tight">{user?.role_name || 'Role'}</p>
            </div>
            <svg className={`w-4 h-4 text-gray-400 transition-transform ${openDropdown === 'profile' ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {openDropdown === 'profile' && (
            <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 z-50 py-2 animate-fade-in-down">
              <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 mb-2">
                <p className="text-sm font-semibold text-gray-900 dark:text-white">Logged in as</p>
                <p className="text-sm text-gray-500 truncate" title={user?.email}>{user?.email || 'user@example.com'}</p>
              </div>

              <Link to={`/users/edit/${user?.user_id}`} onClick={closeDropdown} className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700">Your Profile</Link>

              <div className="border-t border-gray-100 dark:border-gray-700 my-2"></div>

              <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 font-medium">
                Sign out
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default TopNavbar;