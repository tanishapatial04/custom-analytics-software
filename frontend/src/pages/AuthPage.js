import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { toast } from "sonner";
import { TrendingUp } from "lucide-react";

export default function AuthPage({ onLogin }) {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const endpoint = isLogin ? "/auth/login" : "/auth/register";
      const payload = isLogin
        ? { email: formData.email, password: formData.password }
        : formData;

      const response = await axios.post(endpoint, payload);

      toast.success(
        isLogin ? "Welcome back!" : "Account created successfully!"
      );
      onLogin(response.data.token, response.data.tenant);
      navigate("/dashboard");
    } catch (error) {
      toast.error(error.response?.data?.detail || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <TrendingUp className="w-10 h-10 text-[#1C4B42]" />
            <span className="text-3xl font-bold text-slate-900">SignalVista</span>
          </div>
          <p className="text-slate-600">AI-powered analytics platform</p>
        </div>

        {/* Auth Card */}
        <div
          className="bg-white rounded-2xl shadow-xl p-8"
          data-testid="auth-form"
        >
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              {isLogin ? "Welcome back" : "Create account"}
            </h2>
            <p className="text-slate-600">
              {isLogin
                ? "Sign in to your account"
                : "Get started with SignalVista"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <Label htmlFor="name" className="text-slate-700">
                  Full Name
                </Label>
                <Input
                  id="name"
                  data-testid="input-name"
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                  className="mt-1"
                  placeholder="John Doe"
                />
              </div>
            )}

            <div>
              <Label htmlFor="email" className="text-slate-700">
                Email
              </Label>
              <Input
                id="email"
                data-testid="input-email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
                className="mt-1"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <Label htmlFor="password" className="text-slate-700">
                Password
              </Label>
              <Input
                id="password"
                data-testid="input-password"
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                required
                className="mt-1"
                placeholder="••••••••"
              />
            </div>

            <Button
              data-testid="submit-auth-button"
              type="submit"
              disabled={loading}
              className="w-full bg-[#b4e717] text-[#1C4B42] py-3 rounded-lg font-medium custom-dashboard-btn"
            >
              // Custom style for dashboard button hover
              // This can be moved to a CSS file if preferred
              const style = document.createElement('style');
              style.innerHTML = `.custom-dashboard-btn:hover { background-color: #b4e718 !important; color: #1c4b42 !important; }`;
              document.head.appendChild(style);
              {loading
                ? "Processing..."
                : isLogin
                ? "Sign In"
                : "Create Account"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              data-testid="toggle-auth-mode-button"
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-[#1C4B42] hover:text-[#14503a] font-medium"
            >
              {isLogin
                ? "Don't have an account? Sign up"
                : "Already have an account? Sign in"}
            </button>
          </div>
          <div className="mt-3 text-center">
            <button
              data-testid="home-redirect-button"
              type="button"
              onClick={() => (window.location.href = "/")}
              className="text-[#1C4B42] hover:text-[#14503a] font-medium"
            >
              Go to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
