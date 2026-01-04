import React, { useState, FormEvent, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../Auth/AuthContext';
import validator from 'validator';
import {
    EyeIcon,
    EyeSlashIcon,
    LockClosedIcon,
    UserIcon,
    ShieldCheckIcon,
    ExclamationTriangleIcon,
    ArrowRightIcon,
    KeyIcon,
    EnvelopeIcon,
    DevicePhoneMobileIcon,
    CpuChipIcon,
    CloudIcon,
    WifiIcon
} from '@heroicons/react/24/outline';
import {
    ShieldCheckIcon as ShieldSolidIcon,
    LockClosedIcon as LockSolidIcon,
    CheckCircleIcon as CheckSolidIcon,
    ExclamationTriangleIcon as WarningSolidIcon
} from '@heroicons/react/24/solid';

const MAX_ATTEMPTS = 5;
const ATTEMPT_COUNT_KEY = 'login_attempt_count';
const LAST_ATTEMPT_TIME_KEY = 'last_login_attempt';
const ATTEMPT_RESET_TIME = 15 * 60 * 1000; // 15 minutes
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5005";

const LoginPage: React.FC = () => {
    // Form state
    const [userName, setUserName] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [rememberMe, setRememberMe] = useState(false);

    // Forgot password modal state
    const [showForgotModal, setShowForgotModal] = useState(false);
    const [forgotEmail, setForgotEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [forgotMsg, setForgotMsg] = useState<string | null>(null);
    const [forgotLoading, setForgotLoading] = useState(false);
    const [forgotStep, setForgotStep] = useState<'email' | 'otp'>('email');
    const [isRedeemingOnly, setIsRedeemingOnly] = useState(false);

    // Security state
    const [attemptCount, setAttemptCount] = useState(0);
    const [lockMessage, setLockMessage] = useState<string | null>(null);
    const [isAccountLocked, setIsAccountLocked] = useState(false);

    // UI state
    const [isFormFocused, setIsFormFocused] = useState(false);
    const [currentTime, setCurrentTime] = useState(new Date());

    const { login, isLoading } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from?.pathname || "/";

    // Update time every second for dynamic display
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // Initialize attempt count from localStorage
    useEffect(() => {
        const storedAttemptCount = localStorage.getItem(ATTEMPT_COUNT_KEY);
        const lastAttemptTime = localStorage.getItem(LAST_ATTEMPT_TIME_KEY);

        if (storedAttemptCount && lastAttemptTime) {
            const timeSinceLastAttempt = Date.now() - parseInt(lastAttemptTime);

            if (timeSinceLastAttempt > ATTEMPT_RESET_TIME) {
                localStorage.removeItem(ATTEMPT_COUNT_KEY);
                localStorage.removeItem(LAST_ATTEMPT_TIME_KEY);
                setAttemptCount(0);
            } else {
                const count = parseInt(storedAttemptCount);
                setAttemptCount(count);

                if (count >= MAX_ATTEMPTS) {
                    setIsAccountLocked(true);
                    setLockMessage(`Access restricted due to security policy. Please use the redemption code.`);
                } else {
                    const remainingAttempts = MAX_ATTEMPTS - count;
                    setLockMessage(`Security Warning: ${count} of ${MAX_ATTEMPTS} attempts used. ${remainingAttempts} attempt(s) remaining.`);
                }
            }
        }
    }, []);

    const isPasswordStrong = (pwd: string) => {
        return validator.isStrongPassword(pwd, {
            minLength: 8,
            minLowercase: 1,
            minUppercase: 1,
            minNumbers: 1,
            minSymbols: 1,
        });
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (isAccountLocked) {
            setError("Account is temporarily locked due to too many failed attempts.");
            return;
        }
        setError(null);

        // Allow username or email, so less strict validation here on username format unless it's strictly email
        if (!userName) {
            setError("Username/Email is required.");
            return;
        }

        try {
            const result = await login({
                user_name: userName,
                pass: password
            });

            if (result.success) {
                setAttemptCount(0);
                setLockMessage(null);
                setError(null);
                setIsAccountLocked(false);
                localStorage.removeItem(ATTEMPT_COUNT_KEY);
                localStorage.removeItem(LAST_ATTEMPT_TIME_KEY);
                navigate(from, { replace: true });
            } else {
                const errorMessage = result.message || "Invalid username or password.";
                setError(errorMessage);

                const isServerLocked = result.locked ||
                    errorMessage.toLowerCase().includes("locked") ||
                    errorMessage.toLowerCase().includes("suspended") ||
                    errorMessage.toLowerCase().includes("blocked") ||
                    errorMessage.toLowerCase().includes("ip");

                if (isServerLocked) {
                    setIsAccountLocked(true);
                    setLockMessage(errorMessage);
                    // Sync local state as well to prevent "4 of 5" warning on reload
                    localStorage.setItem(ATTEMPT_COUNT_KEY, MAX_ATTEMPTS.toString());
                    localStorage.setItem(LAST_ATTEMPT_TIME_KEY, Date.now().toString());
                    setAttemptCount(MAX_ATTEMPTS);
                } else {
                    // Update local attempt count
                    const newAttemptCount = attemptCount + 1;
                    setAttemptCount(newAttemptCount);
                    localStorage.setItem(ATTEMPT_COUNT_KEY, newAttemptCount.toString());
                    localStorage.setItem(LAST_ATTEMPT_TIME_KEY, Date.now().toString());

                    if (newAttemptCount >= MAX_ATTEMPTS) {
                        setIsAccountLocked(true);
                        setLockMessage(`Maximum login attempts reached (${MAX_ATTEMPTS}). Account temporarily locked. Please try again later.`);
                    } else {
                        const remainingAttempts = MAX_ATTEMPTS - newAttemptCount;
                        setLockMessage(`Login attempt ${newAttemptCount} of ${MAX_ATTEMPTS}. ${remainingAttempts} attempt(s) remaining before account lock.`);
                    }
                }
            }
        } catch (loginError) {
            console.error('Login error:', loginError);
            setError("An unexpected error occurred. Please try again.");
        }
    };

    const handleForgotRequest = async (e: React.FormEvent) => {
        e.preventDefault();
        setForgotMsg(null);
        setForgotLoading(true);

        if (!forgotEmail) {
            setForgotMsg('Please enter your email or username.');
            setForgotLoading(false);
            return;
        }

        try {
            const res = await fetch(`${API_BASE_URL}/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: forgotEmail })
            });
            const data = await res.json();

            if (res.ok) {
                setForgotMsg('OTP sent to your email. Please check your inbox.');
                setForgotStep('otp');
            } else {
                setForgotMsg(data.message || 'Failed to send OTP.');
            }
        } catch (err: any) {
            setForgotMsg("Network error: " + (err.message || 'Failed to send OTP.'));
        }
        setForgotLoading(false);
    };

    const handleRedeemOnly = async (e: React.FormEvent) => {
        e.preventDefault();
        setForgotMsg(null);
        setForgotLoading(true);

        try {
            const res = await fetch(`${API_BASE_URL}/redeem-account`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: forgotEmail, code: otp })
            });
            const data = await res.json();

            if (res.ok) {
                setForgotMsg('Account unlocked successfully! You can now log in.');
                setIsAccountLocked(false);
                setAttemptCount(0);
                setLockMessage(null);
                localStorage.removeItem(ATTEMPT_COUNT_KEY);
                localStorage.removeItem(LAST_ATTEMPT_TIME_KEY);

                setTimeout(() => {
                    setShowForgotModal(false);
                    setForgotStep('email');
                    setForgotEmail('');
                    setOtp('');
                    setIsRedeemingOnly(false);
                    setForgotMsg(null);
                }, 2000);
            } else {
                setForgotMsg(data.message || 'Verification failed.');
            }
        } catch (err: any) {
            setForgotMsg("Error: " + (err.message || 'Failed to unlock.'));
        }
        setForgotLoading(false);
    };

    const handleForgotReset = async (e: React.FormEvent) => {
        e.preventDefault();
        setForgotMsg(null);
        setForgotLoading(true);

        if (!validator.isLength(otp, { min: 4, max: 8 })) {
            setForgotMsg('Invalid OTP format.');
            setForgotLoading(false);
            return;
        }
        if (!isPasswordStrong(newPassword)) {
            setForgotMsg('New password must be strong (8+ chars, uppercase, lowercase, number, symbol).');
            setForgotLoading(false);
            return;
        }

        try {
            const res = await fetch(`${API_BASE_URL}/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: forgotEmail,
                    code: otp,
                    newPassword: newPassword
                })
            });
            const data = await res.json();

            if (res.ok) {
                setForgotMsg('Password reset successful. Account unlocked.');
                // Clear local lock states
                setIsAccountLocked(false);
                setAttemptCount(0);
                setLockMessage(null);
                localStorage.removeItem(ATTEMPT_COUNT_KEY);
                localStorage.removeItem(LAST_ATTEMPT_TIME_KEY);

                setTimeout(() => {
                    setShowForgotModal(false);
                    setForgotStep('email');
                    setForgotEmail('');
                    setOtp('');
                    setNewPassword('');
                    setForgotMsg(null);
                }, 2000);
            } else {
                setForgotMsg(data.message || 'Failed to reset password.');
            }
        } catch (err: any) {
            setForgotMsg("Network error: " + (err.message || 'Failed to reset password.'));
        }

        setForgotLoading(false);
    };

    const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setUserName(e.target.value);
        if (error) setError(null);
    };

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPassword(e.target.value);
        if (error) setError(null);
    };

    return (
        <div className="h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden">
            {/* Animated Background Elements */}
            <div className="absolute inset-0">
                {/* Floating geometric shapes */}
                <div className="absolute top-20 left-20 w-32 h-32 bg-blue-500/10 rounded-full blur-xl animate-pulse"></div>
                <div className="absolute top-40 right-32 w-24 h-24 bg-purple-500/10 rounded-full blur-lg animate-bounce"></div>
                <div className="absolute bottom-32 left-40 w-40 h-40 bg-indigo-500/10 rounded-full blur-2xl animate-pulse delay-1000"></div>
                <div className="absolute bottom-20 right-20 w-28 h-28 bg-cyan-500/10 rounded-full blur-xl animate-bounce delay-500"></div>

                {/* Grid pattern overlay */}
                <div className="absolute inset-0 opacity-20">
                    <div className="absolute inset-0" style={{
                        backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)`,
                        backgroundSize: '20px 20px'
                    }}></div>
                </div>
            </div>

            {/* Main Content */}
            <div className="relative z-10 h-full flex">
                {/* Left Side - Branding & Info */}
                <div className="hidden lg:flex lg:w-1/2 flex-col justify-center px-8 xl:px-16 h-full">
                    {/* Company Branding */}
                    <div className="mb-8">
                        <div className="flex items-center space-x-3 mb-6">
                            <div className="relative">
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl blur-lg opacity-60 animate-pulse"></div>
                                <div className="relative w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-700 rounded-xl flex items-center justify-center shadow-2xl">
                                    <CpuChipIcon className="w-8 h-8 text-white" />
                                </div>
                            </div>
                            <div>
                                <h1 className="text-3xl font-black bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent">
                                    ITPC-CMS
                                </h1>
                                <p className="text-slate-400 font-medium text-sm">Content Management System</p>
                            </div>
                        </div>

                        <h2 className="text-2xl xl:text-3xl font-bold text-white mb-4 leading-tight">
                            Welcome to
                            <span className="block bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                                Ethiopian IT Park
                            </span>
                        </h2>

                        <p className="text-lg text-slate-300 mb-6 leading-relaxed">
                            Secure, scalable, and intelligent solutions for the Ethiopian technology hub.
                        </p>
                    </div>

                    {/* Feature Highlights */}
                    <div className="space-y-4">
                        <div className="flex items-center space-x-4 group">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                                <ShieldSolidIcon className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h3 className="text-white font-semibold text-sm">Enterprise Security</h3>
                                <p className="text-slate-400 text-xs">Multi-layer authentication & encryption</p>
                            </div>
                        </div>

                        <div className="flex items-center space-x-4 group">
                            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                                <CloudIcon className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h3 className="text-white font-semibold text-sm">Cloud-Native Platform</h3>
                                <p className="text-slate-400 text-xs">Scalable infrastructure & real-time sync</p>
                            </div>
                        </div>

                        <div className="flex items-center space-x-4 group">
                            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                                <CpuChipIcon className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h3 className="text-white font-semibold text-sm">AI-Powered Analytics</h3>
                                <p className="text-slate-400 text-xs">Intelligent insights & predictive modeling</p>
                            </div>
                        </div>
                    </div>

                    {/* System Status */}
                    <div className="mt-8 p-4 bg-slate-800/30 backdrop-blur-sm rounded-xl border border-slate-700/50">
                        <div className="flex items-center justify-between mb-2">
                            <h4 className="text-white font-semibold flex items-center text-sm">
                                <WifiIcon className="w-4 h-4 mr-2 text-green-400" />
                                System Status
                            </h4>
                            <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                                <span className="text-green-400 text-sm font-medium">Online</span>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-xs">
                            <div className="flex justify-between">
                                <span className="text-slate-400">Uptime:</span>
                                <span className="text-white font-mono">99.9%</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-400">Response:</span>
                                <span className="text-white font-mono">12ms</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-400">Users:</span>
                                <span className="text-white font-mono">2,847</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-400">Load:</span>
                                <span className="text-white font-mono">23%</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side - Login Form */}
                <div className="w-full lg:w-1/2 flex items-center justify-center px-4 py-6 h-full">
                    <div className="w-full max-w-sm">
                        {/* Login Card */}
                        <div className={`bg-slate-900/40 backdrop-blur-2xl rounded-2xl shadow-2xl border border-white/20 p-6 transition-all duration-500 ${isFormFocused ? 'scale-105 shadow-3xl' : ''}`}>
                            {/* Header */}
                            <div className="text-center mb-6">
                                <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl mb-3 shadow-lg">
                                    <LockSolidIcon className="w-6 h-6 text-white" />
                                </div>
                                <h2 className="text-xl font-bold text-white mb-1">Secure Access</h2>
                                <p className="text-slate-300 text-sm">Sign in to your enterprise account</p>
                                <div className="text-[10px] text-slate-400 mt-1 font-mono">
                                    {currentTime.toLocaleString()}
                                </div>
                            </div>

                            {/* Error Messages */}
                            {error && (
                                <div className="mb-6 p-4 bg-red-900/30 border border-red-500/50 rounded-xl backdrop-blur-sm">
                                    <div className="flex items-center space-x-3">
                                        <WarningSolidIcon className="w-5 h-5 text-red-400 flex-shrink-0" />
                                        <div>
                                            <p className="text-red-300 font-medium">Login Failed</p>
                                            <p className="text-red-200 text-sm">{error}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Lock Warning */}
                            {lockMessage && (
                                <div className={`mb-6 p-4 rounded-xl backdrop-blur-sm border ${lockMessage.toLowerCase().includes("locked") ||
                                    lockMessage.toLowerCase().includes("maximum") ||
                                    isAccountLocked
                                    ? "bg-red-900/30 border-red-500/50"
                                    : "bg-yellow-900/30 border-yellow-500/50"
                                    }`}>
                                    <div className="flex items-center space-x-3">
                                        {isAccountLocked ? (
                                            <LockSolidIcon className="w-5 h-5 text-red-400 flex-shrink-0" />
                                        ) : (
                                            <ExclamationTriangleIcon className="w-5 h-5 text-yellow-400 flex-shrink-0" />
                                        )}
                                        <div>
                                            <p className={`font-medium ${isAccountLocked ? 'text-red-300' : 'text-yellow-300'}`}>
                                                {isAccountLocked ? "Account Locked" : "Security Warning"}
                                            </p>
                                            <p className={`text-sm ${isAccountLocked ? 'text-red-200' : 'text-yellow-200'}`}>
                                                {lockMessage}
                                            </p>
                                            {isAccountLocked && (
                                                <div className="mt-4 pt-4 border-t border-red-500/20">
                                                    <p className="text-[11px] text-red-300 mb-3 font-semibold uppercase tracking-wider">
                                                        Redemption Required
                                                    </p>
                                                    <div className="flex flex-col space-y-2">
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setIsRedeemingOnly(true);
                                                                setForgotStep('otp');
                                                                setShowForgotModal(true);
                                                                setForgotEmail(userName);
                                                                setForgotMsg("Use the redemption code sent to your email to unlock your account.");
                                                            }}
                                                            className="w-full py-2 bg-gradient-to-r from-red-600 to-orange-600 text-white text-xs font-bold rounded-lg shadow-lg hover:shadow-red-500/20 transition-all duration-300 flex items-center justify-center space-x-2"
                                                        >
                                                            <CheckSolidIcon className="w-4 h-4" />
                                                            <span>Enter Redemption Code</span>
                                                        </button>
                                                        <p className="text-[10px] text-center text-red-400/80 italic">
                                                            Check your registered email for the 6-digit code
                                                        </p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Login Form */}
                            <form onSubmit={handleSubmit} className="space-y-4">
                                {/* Username Field */}
                                <div>
                                    <label htmlFor="username" className="block text-xs font-semibold text-slate-200 mb-1">
                                        Email Address
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <UserIcon className="h-4 w-4 text-slate-400" />
                                        </div>
                                        <input
                                            id="username"
                                            type="text"
                                            autoComplete="username"
                                            value={userName}
                                            onChange={handleUsernameChange}
                                            onFocus={() => setIsFormFocused(true)}
                                            onBlur={() => setIsFormFocused(false)}
                                            required
                                            disabled={isLoading || isAccountLocked}
                                            className="w-full pl-10 pr-3 py-3 bg-slate-800/50 border border-slate-600/50 focus:border-blue-500/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                                            placeholder="Enter your email address"
                                        />
                                    </div>
                                </div>

                                {/* Password Field */}
                                <div>
                                    <label htmlFor="password" className="block text-xs font-semibold text-slate-200 mb-1">
                                        Password
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <LockClosedIcon className="h-4 w-4 text-slate-400" />
                                        </div>
                                        <input
                                            id="password"
                                            type={showPassword ? "text" : "password"}
                                            autoComplete="current-password"
                                            value={password}
                                            onChange={handlePasswordChange}
                                            onFocus={() => setIsFormFocused(true)}
                                            onBlur={() => setIsFormFocused(false)}
                                            required
                                            disabled={isLoading || isAccountLocked}
                                            className="w-full pl-10 pr-10 py-3 bg-slate-800/50 border border-slate-600/50 focus:border-blue-500/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                                            placeholder="Enter your password"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-white transition-colors duration-200"
                                            disabled={isLoading || isAccountLocked}
                                        >
                                            {showPassword ? (
                                                <EyeSlashIcon className="h-4 w-4" />
                                            ) : (
                                                <EyeIcon className="h-4 w-4" />
                                            )}
                                        </button>
                                    </div>
                                </div>

                                {/* Remember Me & Forgot Password */}
                                <div className="flex items-center justify-between">
                                    <label className="flex items-center space-x-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={rememberMe}
                                            onChange={(e) => setRememberMe(e.target.checked)}
                                            disabled={isLoading || isAccountLocked}
                                            className="w-3 h-3 text-blue-600 bg-slate-800/50 border-slate-600/50 rounded focus:ring-blue-500/20 focus:ring-2 disabled:opacity-50"
                                        />
                                        <span className="text-xs text-slate-300">Remember me</span>
                                    </label>
                                    <button
                                        type="button"
                                        onClick={() => setShowForgotModal(true)}
                                        className="text-xs text-blue-400 hover:text-blue-300 transition-colors duration-200 font-medium"
                                    >
                                        Forgot password?
                                    </button>
                                </div>

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    disabled={isLoading || isAccountLocked}
                                    className={`w-full py-3 px-6 rounded-lg font-semibold text-white transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-sm ${isAccountLocked
                                        ? 'bg-gradient-to-r from-red-600 to-red-700'
                                        : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'
                                        }`}
                                >
                                    {isLoading ? (
                                        <div className="flex items-center justify-center space-x-2">
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                            <span>Authenticating...</span>
                                        </div>
                                    ) : isAccountLocked ? (
                                        <div className="flex items-center justify-center space-x-2">
                                            <LockSolidIcon className="w-4 h-4" />
                                            <span>Account Locked</span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-center space-x-2">
                                            <span>Sign In</span>
                                            <ArrowRightIcon className="w-4 h-4" />
                                        </div>
                                    )}
                                </button>
                            </form>

                            {/* Security Notice */}
                            <div className="mt-4 p-3 bg-slate-800/30 rounded-xl border border-slate-700/50">
                                <div className="flex items-center space-x-2 mb-1">
                                    <ShieldCheckIcon className="w-3 h-3 text-green-400" />
                                    <span className="text-[10px] font-semibold text-slate-300 uppercase tracking-wider">Security Notice</span>
                                </div>
                                <p className="text-[10px] text-slate-400 leading-relaxed">
                                    This is a secure enterprise system. All activities are monitored and logged.
                                </p>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="text-center mt-4 text-slate-400 text-xs">
                            <p>© 2024 Start Trip Enterprise Transport System</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Forgot Password Modal */}
            {showForgotModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="w-full max-w-md bg-slate-800/95 backdrop-blur-2xl rounded-2xl shadow-2xl border border-slate-600/50 overflow-hidden">
                        {/* Modal Header */}
                        <div className="p-4 border-b border-slate-700/50">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
                                        <KeyIcon className="w-4 h-4 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-base font-bold text-white">Password Recovery</h3>
                                        <p className="text-xs text-slate-400">Secure account recovery process</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => {
                                        setShowForgotModal(false);
                                        setForgotMsg(null);
                                        setForgotEmail('');
                                        setOtp('');
                                        setNewPassword('');
                                        setForgotStep('email');
                                    }}
                                    className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-all duration-200"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        {/* Modal Body */}
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                                {isRedeemingOnly ? 'Unlock Account' : 'Recover Account'}
                            </h3>
                            <button
                                onClick={() => {
                                    setShowForgotModal(false);
                                    setIsRedeemingOnly(false);
                                }}
                                className="text-slate-400 hover:text-white transition-colors"
                            >
                                <CpuChipIcon className="w-4 h-4" />
                            </button>
                        </div>

                        {forgotMsg && (
                            <div className={`mb-4 p-3 rounded-xl border ${forgotMsg.toLowerCase().includes('successful')
                                ? 'bg-green-900/30 border-green-500/50'
                                : 'bg-blue-900/30 border-blue-500/50'
                                }`}>
                                <div className="flex items-center space-x-2">
                                    {forgotMsg.toLowerCase().includes('successful') ? (
                                        <CheckSolidIcon className="w-4 h-4 text-green-400 flex-shrink-0" />
                                    ) : (
                                        <EnvelopeIcon className="w-4 h-4 text-blue-400 flex-shrink-0" />
                                    )}
                                    <p className={`text-xs ${forgotMsg.toLowerCase().includes('successful') ? 'text-green-300' : 'text-blue-300'
                                        }`}>
                                        {forgotMsg}
                                    </p>
                                </div>
                            </div>
                        )}

                        {forgotStep === 'email' && (
                            <form onSubmit={handleForgotRequest} className="space-y-4">
                                <div>
                                    <label htmlFor="forgot-email" className="block text-xs font-semibold text-slate-200 mb-1">
                                        Email Address
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <EnvelopeIcon className="h-4 w-4 text-slate-400" />
                                        </div>
                                        <input
                                            id="forgot-email"
                                            type="email"
                                            value={forgotEmail}
                                            onChange={(e) => setForgotEmail(e.target.value)}
                                            required
                                            disabled={forgotLoading}
                                            className="w-full pl-10 pr-3 py-2.5 bg-slate-700/50 border border-slate-600/50 focus:border-blue-500/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 disabled:opacity-50 text-sm"
                                            placeholder="Enter your registered email"
                                        />
                                    </div>
                                </div>
                                <div className="flex flex-col space-y-3">
                                    <button
                                        type="submit"
                                        disabled={forgotLoading}
                                        className="w-full py-2.5 px-6 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-sm"
                                    >
                                        {forgotLoading ? (
                                            <div className="flex items-center justify-center space-x-2">
                                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                                <span>Sending OTP...</span>
                                            </div>
                                        ) : (
                                            'Send Recovery Code'
                                        )}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (!forgotEmail) {
                                                setForgotMsg("Please enter your email first.");
                                                return;
                                            }
                                            setForgotStep('otp');
                                            setForgotMsg("Use the code from the security alert email.");
                                        }}
                                        className="text-xs text-blue-400 hover:text-blue-300 transition-colors duration-200"
                                    >
                                        Already have a code from system alert?
                                    </button>
                                </div>
                            </form>
                        )}

                        {forgotStep === 'otp' && (
                            <form onSubmit={isRedeemingOnly ? handleRedeemOnly : handleForgotReset} className="space-y-4">
                                <div>
                                    <label htmlFor="otp" className="block text-xs font-semibold text-slate-200 mb-1">
                                        {isRedeemingOnly ? 'Redemption Code' : 'Verification Code'}
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <DevicePhoneMobileIcon className="h-4 w-4 text-slate-400" />
                                        </div>
                                        <input
                                            id="otp"
                                            type="text"
                                            value={otp}
                                            onChange={(e) => setOtp(e.target.value)}
                                            required
                                            disabled={forgotLoading}
                                            className="w-full pl-10 pr-3 py-2.5 bg-slate-700/50 border border-slate-600/50 focus:border-blue-500/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 disabled:opacity-50 text-sm"
                                            placeholder="Enter 6-digit code"
                                            maxLength={6}
                                        />
                                    </div>
                                </div>

                                {!isRedeemingOnly && (
                                    <div>
                                        <label htmlFor="new-password" className="block text-xs font-semibold text-slate-200 mb-1">
                                            New Password
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <LockClosedIcon className="h-4 w-4 text-slate-400" />
                                            </div>
                                            <input
                                                id="new-password"
                                                type="password"
                                                value={newPassword}
                                                onChange={(e) => setNewPassword(e.target.value)}
                                                required
                                                disabled={forgotLoading}
                                                className="w-full pl-10 pr-3 py-2.5 bg-slate-700/50 border border-slate-600/50 focus:border-blue-500/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 disabled:opacity-50 text-sm"
                                                placeholder="Enter new secure password"
                                            />
                                        </div>
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={forgotLoading}
                                    className={`w-full py-2.5 px-6 bg-gradient-to-r ${isRedeemingOnly ? 'from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700' : 'from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700'} text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-sm`}
                                >
                                    {forgotLoading ? (
                                        <div className="flex items-center justify-center space-x-2">
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                            <span>{isRedeemingOnly ? 'Unblocking...' : 'Resetting...'}</span>
                                        </div>
                                    ) : (
                                        isRedeemingOnly ? 'Unlock & Unblock Now' : 'Reset Password'
                                    )}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default LoginPage;
