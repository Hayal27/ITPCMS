//DashboardOverviewPage 
import React from 'react';

/**
 * DashboardOverviewPage
 * Displays the main overview section of the CMS dashboard.
 * This could include summary stats, recent activity, quick links, etc.
 */
const DashboardOverviewPage: React.FC = () => {
  return (
    <div className="container-fluid">
      {/* Page Heading */}
      <div className="d-sm-flex align-items-center justify-content-between mb-4">
        <h1 className="h3 mb-0 text-gray-800">Dashboard Overview</h1>
        {/* Optional: Add a button like "Generate Report" here if needed */}
        {/* <a href="#" className="d-none d-sm-inline-block btn btn-sm btn-primary shadow-sm">
          <i className="fas fa-download fa-sm text-white-50"></i> Generate Report
        </a> */}
      </div>

      {/* Content Row - Example Summary Cards */}
      <div className="row">
        {/* Example Card 1: Posts */}
        <div className="col-xl-3 col-md-6 mb-4">
          <div className="card border-left-primary shadow h-100 py-2">
            <div className="card-body">
              <div className="row no-gutters align-items-center">
                <div className="col mr-2">
                  <div className="text-xs font-weight-bold text-primary text-uppercase mb-1">
                    Total Posts
                  </div>
                  <div className="h5 mb-0 font-weight-bold text-gray-800">
                    {/* Placeholder - Replace with actual data */}
                    42
                  </div>
                </div>
                <div className="col-auto">
                  <i className="fas fa-pencil-alt fa-2x text-gray-300"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Example Card 2: Pages */}
        <div className="col-xl-3 col-md-6 mb-4">
          <div className="card border-left-success shadow h-100 py-2">
            <div className="card-body">
              <div className="row no-gutters align-items-center">
                <div className="col mr-2">
                  <div className="text-xs font-weight-bold text-success text-uppercase mb-1">
                    Total Pages
                  </div>
                  <div className="h5 mb-0 font-weight-bold text-gray-800">
                    {/* Placeholder - Replace with actual data */}
                    15
                  </div>
                </div>
                <div className="col-auto">
                  <i className="far fa-file-alt fa-2x text-gray-300"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Example Card 3: Comments */}
        <div className="col-xl-3 col-md-6 mb-4">
          <div className="card border-left-info shadow h-100 py-2">
            <div className="card-body">
              <div className="row no-gutters align-items-center">
                <div className="col mr-2">
                  <div className="text-xs font-weight-bold text-info text-uppercase mb-1">
                    Pending Comments
                  </div>
                  <div className="h5 mb-0 font-weight-bold text-gray-800">
                    {/* Placeholder - Replace with actual data */}
                    5
                  </div>
                </div>
                <div className="col-auto">
                  <i className="fas fa-comments fa-2x text-gray-300"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Example Card 4: Users */}
        <div className="col-xl-3 col-md-6 mb-4">
          <div className="card border-left-warning shadow h-100 py-2">
            <div className="card-body">
              <div className="row no-gutters align-items-center">
                <div className="col mr-2">
                  <div className="text-xs font-weight-bold text-warning text-uppercase mb-1">
                    Registered Users
                  </div>
                  <div className="h5 mb-0 font-weight-bold text-gray-800">
                    {/* Placeholder - Replace with actual data */}
                    112
                  </div>
                </div>
                <div className="col-auto">
                  <i className="fas fa-users fa-2x text-gray-300"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Row - Example Charts or Recent Activity */}
      <div className="row">
        {/* Placeholder for Charts or other widgets */}
        <div className="col-lg-6 mb-4">
          <div className="card shadow mb-4">
            <div className="card-header py-3">
              <h6 className="m-0 font-weight-bold text-primary">Recent Activity</h6>
            </div>
            <div className="card-body">
              <p>Placeholder for recent posts, comments, or user activity feed.</p>
              {/* Add list or table here */}
            </div>
          </div>
        </div>

        <div className="col-lg-6 mb-4">
          <div className="card shadow mb-4">
            <div className="card-header py-3">
              <h6 className="m-0 font-weight-bold text-primary">Site Analytics (Placeholder)</h6>
            </div>
            <div className="card-body">
              <p>Placeholder for a small chart or key analytics metrics.</p>
              {/* Add chart component or data here */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverviewPage;
