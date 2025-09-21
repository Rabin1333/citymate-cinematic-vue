// src/pages/Auth.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, User, Phone, Eye, EyeOff } from "lucide-react";
import { login, saveAuth } from "../services/api";

const Auth = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isLogin) {
        // ---- REAL LOGIN ----
        const { token, user } = await login(formData.email, formData.password);
        saveAuth(token, user);
        // optional: route admin to /admin
        navigate(user.role === "admin" ? "/admin" : "/");
      } else {
        // ---- SIGN UP (skipped for Iteration 2) ----
        // You can implement POST /api/auth/register later.
        // For now, just show a friendly message:
        setError("Sign up is not enabled for Iteration 2. Please login with a test user.");
      }
    } catch (err: any) {
      setError(err?.message || "Login failed. Check your email/password.");
    } finally {
      setLoading(false);
    }
  }

  const handleSocialLogin = (provider: string) => {
    // Social providers are out-of-scope for Iteration 2
    setError(`${provider} login is not enabled for Iteration 2.`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12">
      <div className="max-w-md w-full mx-4">
        <div className="bg-card rounded-2xl p-8 border border-border shadow-cinematic">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              {isLogin ? "Welcome Back" : "Create Account"}
            </h1>
            <p className="text-foreground-secondary">
              {isLogin ? "Sign in to your account" : "Join City Mate Movie today"}
            </p>
          </div>

          {/* Auth Tabs */}
          <div className="flex bg-background rounded-lg p-1 mb-6">
            <button
              onClick={() => {
                setIsLogin(true);
                setError("");
              }}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                isLogin
                  ? "bg-cinema-red text-white shadow-button"
                  : "text-foreground-secondary hover:text-foreground"
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => {
                setIsLogin(false);
                setError("");
              }}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                !isLogin
                  ? "bg-cinema-red text-white shadow-button"
                  : "text-foreground-secondary hover:text-foreground"
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter your full name"
                    className="input-cinema pl-12"
                    required={!isLogin}
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter your email"
                  className="input-cinema pl-12"
                  required
                />
              </div>
            </div>

            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="Enter your phone number"
                    className="input-cinema pl-12"
                    required={!isLogin}
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Enter your password"
                  className="input-cinema pl-12 pr-12"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="Confirm your password"
                    className="input-cinema pl-12"
                    required={!isLogin}
                  />
                </div>
              </div>
            )}

            {isLogin && (
              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-cinema-red bg-background border-border rounded focus:ring-cinema-red"
                  />
                  <span className="ml-2 text-sm text-foreground-secondary">Remember me</span>
                </label>
                <button type="button" className="text-sm text-cinema-red hover:text-cinema-red-dark">
                  Forgot password?
                </button>
              </div>
            )}

            {error && (
              <div className="text-sm text-red-500">
                {error}
              </div>
            )}

            <button type="submit" className="w-full btn-cinema" disabled={loading}>
              {loading ? (isLogin ? "Signing in…" : "Creating…") : isLogin ? "Sign In" : "Create Account"}
            </button>
          </form>

          {/* Divider */}
          <div className="my-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-card text-foreground-secondary">Or continue with</span>
              </div>
            </div>
          </div>

          {/* Social Login */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handleSocialLogin("google")}
              className="w-full btn-cinema-outline flex items-center justify-center gap-2"
            >
              <div className="w-5 h-5 bg-red-500 rounded text-white text-xs font-bold flex items-center justify-center">
                G
              </div>
              Google
            </button>
            <button
              onClick={() => handleSocialLogin("facebook")}
              className="w-full btn-cinema-outline flex items-center justify-center gap-2"
            >
              <div className="w-5 h-5 bg-blue-600 rounded text-white text-xs font-bold flex items-center justify-center">
                f
              </div>
              Facebook
            </button>
          </div>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-sm text-foreground-secondary">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-cinema-red hover:text-cinema-red-dark font-medium"
              >
                {isLogin ? "Sign up" : "Sign in"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
