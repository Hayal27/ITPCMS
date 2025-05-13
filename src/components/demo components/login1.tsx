import React, { useState, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom'; // Import useNavigate for redirection and Link for registration

const LoginPage: React.FC = () => {
    // State for form inputs
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null); // Optional: For displaying login errors
    const navigate = useNavigate(); // Hook for navigation

    // Handle form submission
    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault(); // Prevent default form submission
        setError(null); // Clear previous errors

        console.log('Attempting login with:', { email, password });

        // --- TODO: Add actual login logic here ---
        // Example:
        // try {
        //   const response = await fetch('/api/login', { /* ... */ });
        //   if (!response.ok) throw new Error('Login failed');
        //   const data = await response.json();
        //   // Store token/user data, etc. using context or state management
        //   console.log('Login successful:', data);
        //   navigate('/'); // Redirect to dashboard on success
        // } catch (err: any) {
        //   setError(err.message || 'An unexpected error occurred.');
        // }

        // Placeholder logic
        if (email === "test@example.com" && password === "password") {
            console.log('Placeholder login successful');
            // Simulate storing login state (in real app, use context/redux/localstorage)
            localStorage.setItem('isLoggedIn', 'true'); // Example, replace with proper auth handling
            navigate('/'); // Redirect to the dashboard (or intended page)
        } else {
            setError("Invalid email or password.");
        }
    };

    // No useEffect needed as it's not a modal anymore

    return (
        // Container to center the login form vertically and horizontally
        <div className="container vh-100 d-flex justify-content-center align-items-center">
            <div className="col-11 col-sm-10 col-md-8 col-lg-6 col-xl-5 col-xxl-4"> {/* Responsive width */}
                {/* Card structure similar to the modal content */}
                <div className="card shadow-sm border-0">
                    {/* Header section */}
                    <div className="card-header text-center p-4 p-sm-5 position-relative modal-shape-header bg-shape">
                         <div className="position-relative z-1">
                            <h4 className="mb-0 text-white">Login</h4>
                            <p className="fs-10 mb-0 text-white">Access your ITPC-CMS account</p>
                        </div>
                    </div>
                    {/* Body section with the form */}
                    <div className="card-body p-4 p-sm-5">
                        {/* Login Form */}
                        <form onSubmit={handleSubmit}>
                            {/* Display login error if present */}
                            {error && <div className="alert alert-danger p-2 fs-10 mb-3" role="alert">{error}</div>}

                            {/* Email Field */}
                            <div className="mb-3">
                                <label className="form-label" htmlFor="login-page-email">Email address</label>
                                <input
                                    className="form-control"
                                    type="email"
                                    autoComplete="email"
                                    id="login-page-email" // Changed ID for uniqueness
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>

                            {/* Password Field */}
                            <div className="mb-3">
                                <label className="form-label" htmlFor="login-page-password">Password</label>
                                <input
                                    className="form-control"
                                    type="password"
                                    autoComplete="current-password"
                                    id="login-page-password" // Changed ID for uniqueness
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                                {/* Optional: Add Forgot Password link */}
                                {/* <Link className="fs-10" to="/forgot-password">Forgot Password?</Link> */}
                            </div>

                            {/* Submit Button */}
                            <div className="mb-3">
                                <button className="btn btn-primary d-block w-100 mt-3" type="submit" name="submit">
                                    Login
                                </button>
                            </div>
                        </form>

                        {/* Divider */}
                        <div className="position-relative mt-4">
                            <hr />
                            <div className="divider-content-center">or login with</div>
                        </div>

                        {/* Social Login Buttons */}
                        <div className="row g-2 mt-2">
                            <div className="col-sm-6">
                                <button className="btn btn-outline-google-plus btn-sm d-block w-100" type="button">
                                    <span className="fab fa-google-plus-g me-2" data-fa-transform="grow-8"></span> google
                                </button>
                            </div>
                            <div className="col-sm-6">
                                <button className="btn btn-outline-facebook btn-sm d-block w-100" type="button">
                                    <span className="fab fa-facebook-square me-2" data-fa-transform="grow-8"></span> facebook
                                </button>
                            </div>
                        </div>
                         {/* Link to Register Page */}
                         <div className="text-center mt-3">
                            <p className="fs-10 mb-0">Don't have an account? <Link to="/register">Register</Link></p> {/* Use Link for navigation */}
                         </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;