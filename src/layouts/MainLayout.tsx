import React, { useState, useEffect } from 'react';
import TopNavbar from '../components/nav/TopNavbar';
import VerticalNavbar from '../components/nav/VerticalNavbar';
// Import necessary CSS for layout if needed, e.g., Bootstrap or custom styles
// import './Layout.css'; // Example: if you have custom layout CSS

interface MainLayoutProps {
  children: React.ReactNode; // To render page content
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  // State to control the vertical navbar's visibility
  // Initialize based on screen size or preference if needed
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // Default to open

  // Function to toggle the sidebar state
  const toggleSidebar = () => {
    setIsSidebarOpen(prevState => !prevState);
  };

  // Optional: Add effect to close sidebar on smaller screens initially
  // useEffect(() => {
  //   const checkScreenSize = () => {
  //     if (window.innerWidth < 1200) { // Example breakpoint (Bootstrap's xl)
  //       setIsSidebarOpen(false);
  //     } else {
  //       setIsSidebarOpen(true);
  //     }
  //   };
  //   checkScreenSize();
  //   window.addEventListener('resize', checkScreenSize);
  //   return () => window.removeEventListener('resize', checkScreenSize);
  // }, []);

  // Add a class to the main container when sidebar is closed for potential styling adjustments
  const mainContainerClass = `container-fluid ${!isSidebarOpen ? 'sidebar-closed' : 'sidebar-open'}`; // Use your preferred class names

  return (
    // Ensure the main container structure matches your theme's requirements
    // This often involves a wrapper div around VerticalNavbar and the main content area
    <div className={mainContainerClass}>
       {/* Pass the toggle function to TopNavbar */}
      <TopNavbar toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />

      <div className="content-wrapper"> {/* Example wrapper */}
        {/* Pass the state to VerticalNavbar */}
        <VerticalNavbar isSidebarOpen={isSidebarOpen} />

        {/* Main Content Area */}
        <div className="content">
          {/* Render the specific page content here */}
          {children}
        </div>
      </div>

      {/* Optional Footer */}
      {/* <Footer /> */}
    </div>
  );
};

export default MainLayout;