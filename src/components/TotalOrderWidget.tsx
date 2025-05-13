import React from 'react';
        // import ReactECharts from 'echarts-for-react'; // Example ECharts import

        // --- Component: TotalOrderWidget ---
        // Renders the Total Order statistics card.
        // NOTE: Requires ECharts library integration for the chart.
        const TotalOrderWidget: React.FC = () => {
          // NOTE: ECharts data is embedded in data-echarts attribute. Needs extraction and passing to React ECharts component.
          const echartOptionsString = '{"tooltip":{"trigger":"axis","formatter":"{b0} : {c0}"},"xAxis":{"data":["Week 4","Week 5","Week 6","Week 7"]},"series":[{"type":"line","data":[20,40,100,120],"smooth":true,"lineStyle":{"width":3}}],"grid":{"bottom":"2%","top":"2%","right":"0","left":"10px"}}';
          const echartOptions = JSON.parse(echartOptionsString); // Parse the options

          return (
            <div className="card h-md-100">
              <div className="card-header pb-0">
                <h6 className="mb-0 mt-2">Total Order</h6>
              </div>
              <div className="card-body d-flex flex-column justify-content-end">
                <div className="row justify-content-between">
                  <div className="col-auto align-self-end">
                    <div className="fs-5 fw-normal font-sans-serif text-700 lh-1 mb-1">58.4K</div>
                    <span className="badge rounded-pill fs-11 bg-200 text-primary">
                      <span className="fas fa-caret-up me-1"></span>13.6%
                    </span>
                  </div>
                  <div className="col-auto ps-0 mt-n4">
                    {/* ECharts chart placeholder - Replace with actual ECharts component */}
                    {/* <ReactECharts
                      option={echartOptions}
                      style={{ height: '50px', width: '80px' }}
                      // opts={{ renderer: 'svg' }} // Optional renderer
                    /> */}
                     <div
                        className="echart-default-total-order"
                        /* data-echarts={echartOptionsString} // Keep for reference or remove */
                        data-echart-responsive="true"
                        style={{height: '50px', width: '80px'}}
                     ></div>
                  </div>
                </div>
              </div>
            </div>
          );
        };

        export default TotalOrderWidget;