import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Lock, User, Eye, EyeOff, LogIn } from "lucide-react";

export function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const { login, isAuthenticated } = useAuth();

  useEffect(() => {
    // Redirect if already authenticated
    if (isAuthenticated) {
      window.location.href = "/";
    }
  }, [isAuthenticated]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (!username || !password) {
      setError("Please enter both username and password");
      setIsLoading(false);
      return;
    }

    const result = await login(username, password);

    if (result.success) {
      window.location.href = "/";
    } else {
      setError(result.error || "Invalid username or password");
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 z-0">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-red-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute top-0 right-0 w-80 h-80 bg-orange-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-80 h-80 bg-pink-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      <div className="w-full max-w-md bg-white/80 backdrop-blur-xl rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/20 p-8 relative z-10 transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
        <div className="text-center mb-8 space-y-2">
          <div className="inline-flex p-3 bg-red-50 rounded-2xl mb-2">
            <img
              src="/logo.png"
              alt="SE TECH Logo"
              className="h-10 w-auto object-contain"
            />
          </div>
          <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">
            Welcome back
          </h1>
          <p className="text-sm text-gray-500">
            Enter your credentials to access the dashboard
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="rounded-xl bg-red-50 border border-red-100 p-3 flex items-start space-x-2 animate-shake">
              <div className="text-sm text-red-600 font-medium">{error}</div>
            </div>
          )}

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label
                htmlFor="username"
                className="block text-sm font-medium text-gray-700 ml-1"
              >
                Username
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <User className="h-4 w-4 text-gray-400 group-focus-within:text-red-500 transition-colors" />
                </div>
                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl bg-gray-50/50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 focus:bg-white transition-all duration-200 sm:text-sm"
                  placeholder="Enter your username"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between ml-1">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700"
                >
                  Password
                </label>
                <a
                  href="/forgot-password"
                  className="text-xs font-medium text-red-600 hover:text-red-500 transition-colors"
                >
                  Forgot password?
                </a>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-gray-400 group-focus-within:text-red-500 transition-colors" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-xl bg-gray-50/50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 focus:bg-white transition-all duration-200 sm:text-sm"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-xl text-sm font-semibold text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
            ) : (
              <LogIn className="h-4 w-4 mr-2" />
            )}
            {isLoading ? "Signing in..." : "Sign in"}
          </button>

          <p className="text-center text-xs text-gray-500 mt-6">
            © 2025 SE TECH (Pvt.) Ltd.
            <br />
            Protected by reCAPTCHA and subject to the Privacy Policy.
          </p>
        </form>
      </div>
    </div>
  );
}
