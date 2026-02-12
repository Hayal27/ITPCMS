import React, { useState, useEffect } from 'react';
import { NavLink, useLocation, Link } from 'react-router-dom';
import { getMyNavigation, Menu } from '../../services/apiService';

interface VerticalNavbarProps {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
}

const VerticalNavbar: React.FC<VerticalNavbarProps> = ({ isSidebarOpen, toggleSidebar }) => {
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [menus, setMenus] = useState<Menu[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMenus = async () => {
      try {
        const data = await getMyNavigation();
        console.log("Fetched menus:", data);
        setMenus(data);
      } catch (error) {
        console.error("Failed to fetch menus:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMenus();
  }, []);

  // Helper for NavLink class
  const getNavLinkClass = ({ isActive }: { isActive: boolean }, colorClass: string) => {
    return `flex items-center ${isSidebarOpen ? 'px-4' : 'justify-center px-2'} py-3 text-sm font-medium transition-all duration-200 rounded-xl mx-2 my-1 group relative
        ${isActive
        ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
        : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800"
      }`;
  };

  // Reusable Icon Wrapper
  const IconWrapper = ({ icon, color, isActive, children }: { icon?: string, color: string, isActive: boolean, children?: React.ReactNode }) => {
    const isSvg = icon?.trim().startsWith('<svg');
    return (
      <div className={`flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200 ${isActive ? `bg-${color}-500 text-white shadow-lg shadow-${color}-500/30` : `bg-gray-100 dark:bg-slate-800 text-${color}-500 dark:text-${color}-400 group-hover:bg-${color}-500 group-hover:text-white`}`}>
        {children ? children : (isSvg ? (
          <div className="w-5 h-5 flex items-center justify-center" dangerouslySetInnerHTML={{ __html: icon || '' }} />
        ) : (
          <i className={`${icon} text-sm`}></i>
        ))}
      </div>
    );
  };

  const SectionDivider = ({ title }: { title: string }) => (
    <div className={`px-6 mt-6 mb-2 transition-opacity duration-300 ${!isSidebarOpen ? 'hidden' : 'block'}`}>
      <p className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider">{title}</p>
    </div>
  );

  const NavItem = ({ to, title, icon, color }: { to: string, title: string, icon?: string, color: string }) => (
    <li>
      <NavLink
        to={to}
        className={({ isActive }) => getNavLinkClass({ isActive }, color)}
        title={!isSidebarOpen ? title : ''}
      >
        {({ isActive }) => (
          <>
            <IconWrapper icon={icon} color={color} isActive={isActive} />
            <span className={`ml-3 transition-opacity duration-200 ${!isSidebarOpen ? 'hidden w-0 opacity-0' : 'block opacity-100'}`}>{title}</span>
            {!isSidebarOpen && (
              <div className="absolute left-full top-2 ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 shadow-lg">
                {title}
              </div>
            )}
          </>
        )}
      </NavLink>
    </li>
  );

  const Dropdown = ({ title, icon, basePath, color, children }: { title: string, icon?: string, basePath: string, color: string, children: React.ReactNode }) => {
    const isActive = location.pathname.startsWith(basePath);
    const [isOpen, setIsOpen] = useState(isActive);

    if (!isSidebarOpen) {
      return (
        <li className="mb-1 px-2 relative group">
          <Link
            to={basePath} // Link to base path if collapsed
            className={`w-full flex justify-center py-3 rounded-xl transition-all ${isActive ? 'bg-blue-50 dark:bg-blue-900/20' : 'hover:bg-gray-50 dark:hover:bg-slate-800'}`}
          >
            <IconWrapper icon={icon} color={color} isActive={isActive} />
          </Link>
          <div className="absolute left-full top-2 ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50">
            {title}
          </div>
        </li>
      );
    }

    return (
      <li className="mb-1 px-2">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full flex items-center justify-between px-4 py-3 text-sm font-medium transition-colors duration-200 rounded-xl group
              ${isActive
              ? "text-gray-800 dark:text-white bg-white dark:bg-slate-800 shadow-sm border border-gray-100 dark:border-gray-700"
              : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800"
            }`}
        >
          <div className="flex items-center gap-3">
            <IconWrapper icon={icon} color={color} isActive={isActive} />
            <span>{title}</span>
          </div>
          <svg
            className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isOpen ? "rotate-90" : ""}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
        <div className={`overflow-hidden transition-all duration-300 ${isOpen ? "max-h-96 opacity-100 mt-1" : "max-h-0 opacity-0"}`}>
          <ul className="pl-4 border-l-2 border-dashed border-gray-200 dark:border-slate-700 ml-6 space-y-1 pt-1">
            {children}
          </ul>
        </div>
      </li>
    );
  };

  // Grouping logic for rendering
  const renderMenus = () => {
    const rootItems = menus.filter(m => !m.parent_id);
    return rootItems.map(item => {
      if (item.is_section) {
        return (
          <React.Fragment key={item.id}>
            <SectionDivider title={item.title} />
            {menus.filter(m => m.parent_id === item.id).map(child => renderMenuItem(child))}
          </React.Fragment>
        );
      }
      return renderMenuItem(item);
    });
  };

  const renderMenuItem = (item: Menu) => {
    const children = menus.filter(m => m.parent_id === item.id);
    if (item.is_dropdown || children.length > 0) {
      return (
        <Dropdown key={item.id} title={item.title} icon={item.icon} basePath={item.path || ''} color={item.color || 'blue'}>
          {children.map(child => (
            <li key={child.id}>
              <NavLink
                to={child.path || '#'}
                className={({ isActive }) => `block px-4 py-2 text-sm rounded-lg transition-colors ${isActive ? `text-${item.color || 'blue'}-600 font-medium bg-${item.color || 'blue'}-50 dark:bg-${item.color || 'blue'}-900/20 dark:text-${item.color || 'blue'}-300` : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"}`}
              >
                {child.title}
              </NavLink>
            </li>
          ))}
        </Dropdown>
      );
    }
    return <NavItem key={item.id} to={item.path || '#'} title={item.title} icon={item.icon} color={item.color || 'blue'} />;
  };

  return (
    <nav className="font-sans overscroll-contain flex flex-col h-full">
      <div className={`flex flex-col gap-4 px-4 py-6 ${!isSidebarOpen ? 'items-center' : ''}`}>
        <Link to="/" className={`flex items-center gap-3 ${!isSidebarOpen ? 'justify-center' : ''}`}>
          <img src="/assets/img/logo/ITP_logo - 1.jpg" alt="ITPC Logo" className="h-12 w-auto object-contain" />

        </Link>

        {/* Search Bar */}
        <div className={`relative w-full mt-2 transition-all duration-300 ${!isSidebarOpen ? 'px-0 opacity-0 h-0 overflow-hidden' : 'opacity-100 h-10'}`}>
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full pl-9 pr-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-xl leading-5 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-blue-500 transition-colors"
            placeholder="Search..."
          />
        </div>
      </div>

      {/* Menu List */}
      <ul className="flex flex-col space-y-1 pt-2 flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
        {loading ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : searchQuery ? (
          menus.filter(m => !m.is_section && m.title.toLowerCase().includes(searchQuery.toLowerCase())).map(item => (
            <NavItem key={item.id} to={item.path || '#'} title={item.title} icon={item.icon} color={item.color || 'blue'} />
          ))
        ) : (
          <>
            {renderMenus()}
          </>
        )}
      </ul>

      {/* --- Bottom Toggle Button: Premium Experience --- */}
      <div className="mt-auto border-t border-slate-100 dark:border-slate-800 p-4">
        <button
          onClick={toggleSidebar}
          className={`
            w-full flex items-center gap-3 p-2 rounded-xl transition-all duration-300 group
            hover:bg-slate-50 dark:hover:bg-slate-800/50 text-gray-500 dark:text-gray-400 
            hover:text-blue-600 dark:hover:text-blue-400
            ${!isSidebarOpen ? 'justify-center' : ''}
          `}
          aria-label={isSidebarOpen ? "Collapse Sidebar" : "Expand Sidebar"}
        >
          <div className={`
            flex items-center justify-center w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 
            group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 shadow-sm
            ${!isSidebarOpen ? '' : ''}
          `}>
            <svg
              className={`w-5 h-5 transition-transform duration-500 ${!isSidebarOpen ? 'rotate-180' : ''}`}
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </div>
          {isSidebarOpen && (
            <div className="flex flex-col items-start overflow-hidden">
              <span className="text-sm font-bold whitespace-nowrap">Collapse View</span>
              <span className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-widest leading-none">Settings</span>
            </div>
          )}
        </button>
      </div>
    </nav >
  );
};

export default VerticalNavbar;