
export interface NavItem {
  path: string;
  label: string;
  icon: string; // Font Awesome class, e.g., 'fas fa-tachometer-alt'
  end?: boolean; // For NavLink 'end' prop, useful for index routes like '/'
  children?: NavItem[]; // For dropdown menus
  basePath?: string; // Base path for determining active state and expansion of dropdowns
}

export interface NavSection {
  label: string; // Section label like "Content", "Media"
  items: NavItem[];
}

// Define the navigation structure based on App.tsx routes
export const navigationConfig: NavSection[] = [
  {
    label: "Dashboard", // This label won't be rendered for the first section, but helps structure
    items: [
      {
        path: "#dashboard", // Target for collapse ID
        basePath: "/dashboard", // Path prefix for active state/expansion check (also handles '/')
        label: "Dashboard",
        icon: "fas fa-tachometer-alt",
        children: [
          { path: "/", label: "Overview", icon: "", end: true }, // Index route
          { path: "/dashboard/analytics", label: "Analytics", icon: "" },
          // { path: "/dashboard/health", label: "Site Health", icon: "" }, // Example if added later
        ]
      }
    ]
  },
  {
    label: "Content",
    items: [
      { path: "/content/posts", label: "Posts", icon: "fas fa-pencil-alt" },
      { path: "/content/pages", label: "Pages", icon: "far fa-file-alt" },
      { path: "/content/categories", label: "Categories", icon: "fas fa-folder" },
      { path: "/content/tags", label: "Tags", icon: "fas fa-tags" },
    ]
  },
  {
    label: "Media",
    items: [
      { path: "/media", label: "Library", icon: "fas fa-photo-video" },
    ]
  },
  {
    label: "Interaction",
    items: [
      { path: "/interaction/comments", label: "Comments", icon: "fas fa-comments" },
      {
        path: "#forms", // Target for collapse ID
        basePath: "/interaction/forms", // Path prefix for active state/expansion
        label: "Forms",
        icon: "fab fa-wpforms", // Example icon
        children: [
          { path: "/interaction/forms/manage", label: "Manage Forms", icon: "" },
          { path: "/interaction/forms/submissions", label: "Submissions", icon: "" },
        ]
      }
    ]
  },
  {
    label: "Appearance",
    items: [
      { path: "/appearance/menus", label: "Menus", icon: "fas fa-bars" },
      { path: "/appearance/theme", label: "Theme Settings", icon: "fas fa-palette" },
      // { path: "/appearance/widgets", label: "Widgets", icon: "fas fa-puzzle-piece" }, // Example if added later
    ]
  },
  {
    label: "Users",
    items: [
      { path: "/users", label: "All Users", icon: "fas fa-users" },
      { path: "/users/new", label: "Add New", icon: "fas fa-user-plus" },
      // "Your Profile" is added dynamically in VerticalNavbar.tsx
      // { path: "/users/roles", label: "Roles & Permissions", icon: "fas fa-user-shield" }, // Example if added later
    ]
  },
  // --- Optional Sections (Add if needed) ---
  // {
  //   label: "Plugins",
  //   items: [
  //     { path: "/plugins", label: "Installed Plugins", icon: "fas fa-plug" },
  //     { path: "/plugins/new", label: "Add New", icon: "fas fa-plus-circle" },
  //   ]
  // },
  // {
  //   label: "Tools",
  //   items: [
  //     { path: "/tools/seo", label: "SEO Settings", icon: "fas fa-search-dollar" },
  //     { path: "/tools/import-export", label: "Import / Export", icon: "fas fa-exchange-alt" },
  //   ]
  // },
  {
    label: "Settings",
    items: [
      { path: "/settings/general", label: "General", icon: "fas fa-cogs" },
      // Add other settings links if needed
    ]
  }
];

/**
 * Helper function to check if the given path corresponds to the root dashboard section.
 * This is needed because the dashboard overview might be at '/' while other dashboard
 * links start with '/dashboard'.
 * @param path - The basePath property from a NavItem.
 * @returns True if the path is considered the root dashboard path ('/dashboard').
 */
export const isRootDashboardPath = (path: string | undefined): boolean => path === "/dashboard";

