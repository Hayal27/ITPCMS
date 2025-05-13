import React from 'react';
        // import ReactECharts from 'echarts-for-react'; // Example ECharts import

        // --- Component: MarketShareWidget ---
        // Renders the Market Share statistics card.
        // NOTE: Requires ECharts library integration for the chart.
        const MarketShareWidget: React.FC = () => {
            // TODO: Define ECharts options for the pie chart
            // const echartOptions = { ... };

          return (
            <div className="card h-md-100">
              <div className="card-body">
                <div className="row h-100 justify-content-between g-0">
                  <div className="col-5 col-sm-6 col-xxl pe-2">
                    <h6 className="mt-1">Market Share</h6>
                    <div className="fs-11 mt-3">
                      <div className="d-flex flex-between-center mb-1">
                        <div className="d-flex align-items-center"><span className="dot bg-primary"></span><span className="fw-semi-bold">Samsung</span></div>
                        <div className="d-xxl-none">33%</div>
                      </div>
                      <div className="d-flex flex-between-center mb-1">
                        <div className="d-flex align-items-center"><span className="dot bg-info"></span><span className="fw-semi-bold">Huawei</span></div>
                        <div className="d-xxl-none">29%</div>
                      </div>
                      <div className="d-flex flex-between-center mb-1">
                        <div className="d-flex align-items-center"><span className="dot bg-300"></span><span className="fw-semi-bold">Apple</span></div>
                        <div className="d-xxl-none">20%</div>
                      </div>
                    </div>
                  </div>
                  <div className="col-auto position-relative">
                    {/* ECharts chart placeholder - Replace with actual ECharts component */}
                    {/* <ReactECharts
                      option={echartOptions}
                      className="echart-market-share" // Use className for styling if needed
                      style={{ height: '100%', minHeight: '80px', width: '80px' }} // Adjust size
                    /> */}
                     <div className="echart-market-share" style={{ height: '80px', width: '80px' }}></div> {/* Placeholder */}
                    <div className="position-absolute top-50 start-50 translate-middle text-1100 fs-7">26M</div>
                  </div>
                </div>
              </div>
            </div>
          );
        };

        export default MarketShareWidget;