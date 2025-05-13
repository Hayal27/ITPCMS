import React from 'react';
import WeeklySalesWidget from './nav/WeeklySalesWidget';
import TotalOrderWidget from './TotalOrderWidget';
import MarketShareWidget from './MarketShareWidget';
import WeatherWidget from './WeatherWidget';

        // Import demo components using PascalCase
        // Ensure the files export components named correctly
        import Demo from './demo components/demo';
        import Table1 from './demo components/table1';
        import Form1 from './demo components/form1';
        import BarChart from './demo components/barchart'; // Assuming this is the Line Chart component based on previous steps
        import LineChart from './demo components/linechart'; // Assuming this is the Bar Chart component based on previous steps
        import DoughnutChart from './demo components/DoughnutChart';
        import PieChart from './demo components/PieChart'; // Corrected filename casing from PiChart to PieChart if needed
        import Alert from './demo components/alert';
        


        // --- Component: DashboardWidgets ---
        // Container for the main dashboard statistic widgets and demo components.
        const DashboardWidgets: React.FC = () => {
          return (
            <>
              {/* First row: Top Widgets */}
              <div className="row g-3 mb-3">
                <div className="col-md-6 col-xxl-3">
                  <WeeklySalesWidget />
                </div>
                <div className="col-md-6 col-xxl-3">
                  <TotalOrderWidget />
                </div>
                <div className="col-md-6 col-xxl-3">
                  <MarketShareWidget />
                </div>
                <div className="col-md-6 col-xxl-3">
                  <WeatherWidget />
                </div>
              </div>

              {/* Second row: Demo Table and Placeholder */}
              <div className="row g-3 mb-3">
                <div className="col-md-6">
                  <Table1 />
                </div>
                <div className="col-md-6">
                  <Demo /> {/* Assuming Demo component exists */}
                </div>
              </div>

              {/* Third row: Form and Alert */}
              <div className="row g-3 mb-3">
                <div className="col-md-6">
                  <Form1 />
                </div>
                <div className="col-md-6">
                  {/* Provide required props for Alert */}
                  <Alert
                    type="info" // Example type
                    message="This is an example alert message." // Example message
                    dismissible // Example: make it dismissible
                  />
                  {/* You can add more alerts or other components here */}
                </div>
              </div>

              {/* Fourth row: Charts (Bar and Line) */}
              <div className="row g-3 mb-3">
                 {/* NOTE: Check if BarChart/LineChart filenames/imports match the actual chart type */}
                <div className="col-md-6">
                  <BarChart /> {/* Check if this is actually the Bar chart */}
                </div>
                <div className="col-md-6">
                  <LineChart /> {/* Check if this is actually the Line chart */}
                </div>
              </div>

              {/* Fifth row: Charts (Doughnut and Pie) */}
              <div className="row g-3 mb-3">
                <div className="col-md-6">
                  <DoughnutChart />
                </div>
                <div className="col-md-6">
                  <PieChart />
                </div>
              </div>
            </>
          );
        };

        export default DashboardWidgets;