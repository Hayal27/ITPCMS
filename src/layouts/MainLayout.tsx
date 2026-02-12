import React, { useState, useEffect } from 'react';
import TopNavbar from '../components/nav/TopNavbar';
import VerticalNavbar from '../components/nav/VerticalNavbar';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Effective state for sidebar expansion
  const isExpanded = isSidebarOpen || (isHovered && !isMobile);

  // Handle responsive sidebar behavior
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 1024) { // lb breakpoint
        setIsMobile(true);
        if (isSidebarOpen) setIsSidebarOpen(false);
      } else {
        setIsMobile(false);
        if (!isSidebarOpen) setIsSidebarOpen(true);
      }
    };

    // Initial check
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 overflow-hidden">
      {/* Sidebar Area */}
      {/* Mobile Overlay */}
      {isMobile && isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar Component */}
      <aside
        onMouseEnter={() => !isSidebarOpen && setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`
          flex-shrink-0 z-30 transition-all duration-300 ease-in-out
          bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800
          ${isMobile
            ? (isSidebarOpen ? 'fixed inset-y-0 left-0 shadow-xl w-64' : 'fixed inset-y-0 left-0 w-0 -translate-x-full')
            : (isExpanded ? 'w-64' : 'w-20')
          }
        `}
      >
        <div className="h-full overflow-y-auto overflow-x-hidden [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
          <VerticalNavbar isSidebarOpen={isExpanded} toggleSidebar={toggleSidebar} />
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 h-full min-w-0 overflow-hidden relative">
        {/* Top Navbar */}
        <header className="flex-shrink-0 sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shadow-sm border-b border-slate-200 dark:border-slate-800 h-16">
          <TopNavbar toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 scroll-smooth relative">
          <div className="mx-auto max-w-7xl animate-fade-in">
            {children}
          </div>

        </main>
      </div>
    </div>
  );
};

export default MainLayout;