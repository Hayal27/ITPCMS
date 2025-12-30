import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../Auth/AuthContext";

const LoginPage = () => {
    const [formData, setFormData] = useState({
        username: "",
        password: ""
    });
    const [localLoading, setLocalLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState("error"); // error, success, warning
    const [showPassword, setShowPassword] = useState(false);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [isFormFocused, setIsFormFocused] = useState(false);

    // Get login function and loading state from AuthContext
    const { login, isLoading: contextLoading } = useAuth();
    const navigate = useNavigate();

    // Combine loading states
    const isLoading = localLoading || contextLoading;

    // Update time every second
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear message when user starts typing
        if (message) {
            setMessage("");
            setMessageType("error");
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.username || !formData.password) {
            setMessage("Please enter both username and password");
            setMessageType("warning");
            return;
        }

        setLocalLoading(true);
        setMessage("");
        setMessageType("error");

        try {
            // Call the login function from AuthContext which handles its own axios and state
            const result = await login({
                user_name: formData.username,
                pass: formData.password
            });

            if (result.success) {
                setMessage("Login successful! Redirecting...");
                setMessageType("success");

                // Redirect after short delay
                setTimeout(() => {
                    navigate("/");
                }, 1000);
            } else {
                setMessage(result.message || "Login failed");
                setMessageType("error");
            }
        } catch (error) {
            console.error("Login error:", error);
            setMessage("Login failed. Please check your connection and try again.");
            setMessageType("error");
        } finally {
            setLocalLoading(false);
        }
    };

    return (
        <div className="h-screen w-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden font-sans flex items-center justify-center p-4">
            {/* Animated Background Elements */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div className="absolute top-20 left-20 w-32 h-32 bg-blue-500/10 rounded-full blur-xl animate-pulse"></div>
                <div className="absolute top-40 right-32 w-24 h-24 bg-purple-500/10 rounded-full blur-lg animate-bounce"></div>
                <div className="absolute bottom-32 left-40 w-40 h-40 bg-indigo-500/10 rounded-full blur-2xl animate-pulse"></div>
                <div className="absolute bottom-20 right-20 w-28 h-28 bg-cyan-500/10 rounded-full blur-xl animate-bounce"></div>

                {/* Grid pattern overlay */}
                <div className="absolute inset-0 opacity-20">
                    <div className="absolute inset-0" style={{
                        backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)`,
                        backgroundSize: '20px 20px'
                    }}></div>
                </div>
            </div>

            {/* Main Central Card */}
            <div className={`relative z-10 w-full max-w-5xl h-auto max-h-[90vh] flex bg-white/10 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden transition-all duration-500 ${isFormFocused ? 'shadow-blue-500/20' : ''}`}>

                {/* Left Side - Branding & Info (Compact) */}
                <div className="hidden lg:flex w-5/12 bg-black/20 flex-col justify-between p-8 border-r border-white/10">
                    {/* Top Branding - Fixed Height Zone */}
                    <div>
                        <div className="flex items-center space-x-3 mb-6">
                            <div className="relative flex-shrink-0">
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl blur opacity-60 animate-pulse"></div>
                                <div className="relative w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-700 rounded-xl flex items-center justify-center shadow-xl">
                                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                    </svg>
                                </div>
                            </div>
                            <div>
                                <h1 className="text-2xl font-black bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent">
                                    ITPC-CMS
                                </h1>
                                <p className="text-slate-400 font-medium text-xs">Enterprise Solution</p>
                            </div>
                        </div>

                        <div className="mb-6">
                            <h2 className="text-xl font-bold text-white mb-2 leading-snug">
                                <span className="text-blue-200">Welcome to IT Park</span>
                                <span className="block bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent transform scale-y-100">
                                    Content Management
                                </span>
                            </h2>
                            <p className="text-sm text-slate-300 leading-relaxed">
                                Empower your workspace with resilient tools for a flourishing digital ecosystem.
                            </p>
                        </div>
                    </div>

                    {/* Middle Features - Condensed */}
                    <div className="space-y-4 mb-4">
                        <div className="flex items-center space-x-3 group">
                            <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-500/30 rounded-lg flex items-center justify-center">
                                <svg className="w-4 h-4 text-blue-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-white font-semibold text-xs">Content Management</h3>
                                <p className="text-slate-400 text-[10px] leading-tight">News, events, and page oversight.</p>
                            </div>
                        </div>

                        <div className="flex items-center space-x-3 group">
                            <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-purple-500/20 to-purple-600/20 border border-purple-500/30 rounded-lg flex items-center justify-center">
                                <svg className="w-4 h-4 text-purple-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-white font-semibold text-xs">User Administration</h3>
                                <p className="text-slate-400 text-[10px] leading-tight">Access controls and roles.</p>
                            </div>
                        </div>

                        <div className="flex items-center space-x-3 group">
                            <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-indigo-500/20 to-indigo-600/20 border border-indigo-500/30 rounded-lg flex items-center justify-center">
                                <svg className="w-4 h-4 text-indigo-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-white font-semibold text-xs">Analytics</h3>
                                <p className="text-slate-400 text-[10px] leading-tight">Performance tracking.</p>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Status */}
                    <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                        <div className="flex items-center justify-between mb-1">
                            <h4 className="text-white font-semibold text-xs flex items-center">
                                <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse mr-2"></div>
                                System Online
                            </h4>
                            <span className="text-slate-400 text-[10px] font-mono">v1.0.4</span>
                        </div>
                        <div className="flex justify-between items-center text-[10px] text-slate-500">
                            <span>ENV: {import.meta.env.MODE}</span>
                            <span>RESP: 12ms</span>
                        </div>
                    </div>
                </div>

                {/* Right Side - Login Form - Fully Centered & Compact */}
                <div className="w-full lg:w-7/12 flex items-center justify-center px-8 py-8 relative">

                    {/* Decorative background shape in form side */}
                    <div className="absolute top-[-50px] right-[-50px] w-40 h-40 bg-blue-500/10 rounded-full blur-3xl"></div>

                    <div className="w-full max-w-sm relative z-10">
                        {/* Header */}
                        <div className="text-center mb-6">
                            <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl mb-3 shadow-lg transform rotate-3 hover:rotate-0 transition-transform duration-300">
                                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <h2 className="text-xl font-bold text-white mb-1">Secure Access</h2>
                            <p className="text-slate-300 text-sm">Sign in to your account</p>
                        </div>

                        {/* Login Form */}
                        <form onSubmit={handleSubmit} className="space-y-4">

                            {/* Status Message */}
                            {message && (
                                <div className={`p-3 rounded-lg backdrop-blur-sm border ${messageType === 'success' ? 'bg-green-900/30 border-green-500/50' :
                                    messageType === 'warning' ? 'bg-yellow-900/30 border-yellow-500/50' :
                                        'bg-red-900/30 border-red-500/50'
                                    }`}>
                                    <div className="flex items-center space-x-2">
                                        <svg className={`w-4 h-4 flex-shrink-0 ${messageType === 'success' ? 'text-green-400' :
                                            messageType === 'warning' ? 'text-yellow-400' :
                                                'text-red-400'
                                            }`} fill="currentColor" viewBox="0 0 20 20">
                                            {messageType === 'success' && (
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                            )}
                                            {(messageType === 'error' || messageType === 'warning') && (
                                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                            )}
                                        </svg>
                                        <div className="flex-1">
                                            <p className={`text-xs font-medium ${messageType === 'success' ? 'text-green-300' :
                                                messageType === 'warning' ? 'text-yellow-300' :
                                                    'text-red-300'
                                                }`}>{message}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Username Field */}
                            <div>
                                <label htmlFor="username" className="block text-xs font-semibold text-slate-300 mb-1 ml-1">
                                    Username
                                </label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <svg className="h-4 w-4 text-slate-400 group-focus-within:text-blue-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                    </div>
                                    <input
                                        id="username"
                                        name="username"
                                        type="text"
                                        value={formData.username}
                                        onChange={handleChange}
                                        onFocus={() => setIsFormFocused(true)}
                                        onBlur={() => setIsFormFocused(false)}
                                        className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-slate-600/50 focus:border-blue-500/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-300 text-sm"
                                        placeholder="Enter your username"
                                        autoComplete="username"
                                        disabled={isLoading}
                                        required
                                    />
                                </div>
                            </div>

                            {/* Password Field */}
                            <div>
                                <label htmlFor="password" className="block text-xs font-semibold text-slate-300 mb-1 ml-1">
                                    Password
                                </label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <svg className="h-4 w-4 text-slate-400 group-focus-within:text-blue-400 transition-colors" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <input
                                        id="password"
                                        name="password"
                                        type={showPassword ? "text" : "password"}
                                        value={formData.password}
                                        onChange={handleChange}
                                        onFocus={() => setIsFormFocused(true)}
                                        onBlur={() => setIsFormFocused(false)}
                                        className="w-full pl-10 pr-10 py-3 bg-slate-800/50 border border-slate-600/50 focus:border-blue-500/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-300 text-sm"
                                        placeholder="Enter your password"
                                        autoComplete="current-password"
                                        disabled={isLoading}
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-white transition-colors duration-200"
                                        disabled={isLoading}
                                    >
                                        {showPassword ? (
                                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                                            </svg>
                                        ) : (
                                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </svg>
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Login Button */}
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full py-3 px-6 rounded-xl font-bold text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 transition-all duration-300 transform hover:translate-y-[-1px] active:scale-[0.98] shadow-lg hover:shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed text-sm mt-2"
                            >
                                {isLoading ? (
                                    <div className="flex items-center justify-center space-x-2">
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        <span>Authenticating...</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-center space-x-2">
                                        <span>Log In</span>
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                        </svg>
                                    </div>
                                )}
                            </button>

                            {/* Links & Footer in One */}
                            <div className="flex flex-col items-center justify-between space-y-4 mt-6 border-t border-white/5 pt-4">
                                <a href="/itsupport" className="text-xs text-blue-400 hover:text-blue-300 transition-colors flex items-center">
                                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                                    Contact IT Support
                                </a>

                                <div className="text-[10px] text-slate-500 font-mono text-center">
                                    <div>{currentTime.toLocaleTimeString()}</div>
                                    <div>© 2024 ITPC-CMS</div>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
