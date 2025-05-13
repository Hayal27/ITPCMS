import React, { useState, FormEvent } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../Auth/AuthContext'; // Adjust path if needed
import './login-update.css'; // Import new animated CSS
import logoBackgroundImage from '../../../public/assets/img/logo/logo.png'; // Import the image

const LoginPage: React.FC = () => {
    // State for form inputs - matching expected API fields
    const [userName, setUserName] = useState(''); // Changed from email
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);

    // Get login function and loading state from AuthContext
    const { login, isLoading } = useAuth();
    const navigate = useNavigate();
    const location = useLocation(); // Get location state for potential redirect

    // Determine where to redirect after login
    // If redirected from a protected route, 'from' will be in location state
    const from = location.state?.from?.pathname || "/"; // Default to dashboard

    // Handle form submission
    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError(null); // Clear previous errors

        console.log('Attempting login with:', { user_name: userName, pass: password });

        // Call the login function from AuthContext
        const result = await login({
            user_name: userName, // Use state variable userName
            pass: password      // Use state variable password
        });

        if (result.success) {
            console.log('Login successful via context');
            navigate(from, { replace: true });
        } else {
            console.error('Login failed:', result.message);
            setError(result.message || "Invalid username or password."); // Use message from context
        }
    };

    return (
        <div 
        className="login-page-wrapper"
        style={{
            backgroundImage: `url(${logoBackgroundImage})`
               
                
          
            }}
        >
            {/* Bootstrap column structure remains for responsiveness of the card itself */}
            <div className="col-11 col-sm-10 col-md-8 col-lg-6 col-xl-5 col-xxl-4">                <div className="card"> {/* Removed shadow-sm border-0, handled by new CSS */}
                    <div className="card-header text-center p-4 p-sm-5 position-relative modal-shape-header bg-shape">
                         <div className="position-relative z-1">
                            <h4 className="mb-0">Login</h4> {/* text-white removed, handled by CSS */}
                            <p className="fs-10 mb-0">Access your ITPC-CMS account</p> {/* text-white removed */}
                        </div>
                    </div>
                    <div className="card-body p-4 p-sm-5">
                        <form onSubmit={handleSubmit}>
                            {error && <div className="alert alert-danger p-2 fs-10 mb-3" role="alert">{error}</div>}

                            {/* Username Field */}
                            <div className="mb-3">
                                <label className="form-label" htmlFor="login-page-username">Username</label>
                                <input
                                    className="form-control"
                                    type="text"
                                    autoComplete="username"
                                    id="login-page-username"
                                    value={userName}
                                    onChange={(e) => setUserName(e.target.value)}
                                    required
                                    disabled={isLoading}
                                    placeholder="Enter your username" // Added placeholder
                                />
                            </div>

                            {/* Password Field */}
                            <div className="mb-3">
                                <label className="form-label" htmlFor="login-page-password">Password</label>
                                <input
                                    className="form-control"
                                    type="password"
                                    autoComplete="current-password"
                                    id="login-page-password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    disabled={isLoading}
                                    placeholder="Enter your password" // Added placeholder
                                />
                            </div>

                            {/* Submit Button */}
                            <div className="mb-3">
                                <button
                                    className="btn btn-primary d-block w-100 mt-3"
                                    type="submit"
                                    name="submit"
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                            Logging in...
                                        </>
                                    ) : (
                                        'Login'
                                    )}
                                </button>
                            </div>
                        </form>

                        {/* Divider */}
                        <div className="position-relative mt-4">
                            <hr />
                        </div>

                        {/* Social Login Buttons */}
                        {/* Added social-buttons-container class for potential finer control in CSS */}
                        <div className="row g-2 mt-2 social-buttons-container">
                            <div className="col-sm-6">
                                <button className="btn btn-outline-google-plus btn-sm d-block w-100" type="button" disabled={isLoading}>
                                    <span className="" data-fa-transform="grow-8"></span> forgot password
                                </button>
                            </div>

                        </div>
                         {/* Link to Register Page */}
                         <div className="text-center mt-3">
                            <p className="fs-10 mb-0">If you got trouble? <Link to="/itsupport">contact It support team</Link></p>
                         </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
