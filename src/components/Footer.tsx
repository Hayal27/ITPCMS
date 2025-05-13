import React from 'react';

        // --- Component: Footer ---
        // Renders the application footer.
        const Footer: React.FC = () => {
          return (
            <footer className="footer">
              <div className="footer-2 row g-0 justify-content-between fs-10 mt-4 mb-3">
                <div className="col-12 col-sm-auto text-center">
                  <p className="mb-0 text-600">
                     <span className="footer-1 d-none d-sm-inline-block"> </span><br className="d-sm-none" />| 2025 &copy; <a href="https://Ethiopian IT park.com">Ethiopian IT park</a>
                  </p>
                  <hr />
                </div>
                <div className="col-12 col-sm-auto text-center">
                  <p className="mb-0 text-600"> </p>
                </div>
              </div>
            </footer>
          );
        };

        export default Footer;