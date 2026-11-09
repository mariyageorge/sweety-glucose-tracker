import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { HeartHandshake, AlertCircle, ArrowRight, Sparkles } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login({ email, password });
      navigate("/");
    } catch (err: any) {
      setError(err.message || "Failed to log in.");
    } finally {
      setLoading(false);
    }
  };

  // Demo credential autofill for reviewer convenience
  const fillCredentials = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword("Password123!");
    setError(null);
  };

  return (
    <div className="min-h-screen bg-[#FAF6F0] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Playful Pastel Ambient Glows */}
      <div className="absolute top-10 right-10 w-80 h-80 bg-[#E8E5FA]/70 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-10 left-10 w-80 h-80 bg-[#DDECFB]/70 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-1/2 left-1/3 w-72 h-72 bg-[#FCE8E6]/60 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-md w-full bg-white/95 backdrop-blur-md rounded-[2.5rem] p-8 sm:p-9 shadow-pastel-lavender border border-[#D5CEF5]/90">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-3xl bg-[#E8E5FA] border border-[#D5CEF5] text-[#4E3E8C] flex items-center justify-center mx-auto mb-4 shadow-pastel-lavender">
            <HeartHandshake className="w-7 h-7" />
          </div>
          <div className="flex items-center justify-center gap-1.5 mb-1">
            <h1 className="text-2xl font-extrabold text-[#342D38] tracking-tight">
              Welcome to Sweety
            </h1>
            <Sparkles className="w-5 h-5 text-[#F3B59D]" />
          </div>
          <p className="text-xs text-[#342D38]/70 font-semibold">
            Your human-centered daily blood glucose tracker
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-3.5 bg-[#FCE8E6] border border-[#F7CCD0] rounded-2xl flex items-start gap-2.5 text-xs text-[#8E3737] animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-[#8E3737] shrink-0 mt-0.5" />
            <p className="font-extrabold">{error}</p>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-extrabold text-[#342D38] uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="patient@sweety.app"
              className="w-full px-4 py-3 text-sm bg-[#FAF6F0] border border-[#E5DCF5] rounded-2xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#D5CEF5] focus:border-[#4E3E8C] transition-all font-semibold text-[#342D38]"
            />
          </div>

          <div>
            <label className="block text-xs font-extrabold text-[#342D38] uppercase tracking-wider mb-1.5">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 text-sm bg-[#FAF6F0] border border-[#E5DCF5] rounded-2xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#D5CEF5] focus:border-[#4E3E8C] transition-all font-semibold text-[#342D38]"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 px-4 text-xs font-extrabold text-white bg-[#4E3E8C] hover:bg-[#3D2E73] active:bg-[#30225E] rounded-2xl shadow-pastel-lavender transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <span>{loading ? "Signing in..." : "Sign In to Sweety"}</span>
            {!loading && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>

        {/* Demo Credentials Quick Fill in Pastels */}
        <div className="mt-7 pt-6 border-t border-[#E5DCF5]">
          <p className="text-[11px] font-extrabold text-[#8A7D91] uppercase tracking-wider text-center mb-2.5">
            Quick Demo Autofill
          </p>
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => fillCredentials("demo@sweety.app")}
              className="px-3.5 py-2.5 text-xs font-extrabold text-[#25588C] bg-[#DDECFB] hover:bg-[#DDECFB]/80 border border-[#BCDDF8] rounded-xl transition-all text-center shadow-xs"
            >
              Demo Patient
            </button>
            <button
              type="button"
              onClick={() => fillCredentials("jane@sweety.app")}
              className="px-3.5 py-2.5 text-xs font-extrabold text-[#2E5436] bg-[#E3F0E5] hover:bg-[#E3F0E5]/80 border border-[#C6E2CB] rounded-xl transition-all text-center shadow-xs"
            >
              Jane Doe
            </button>
          </div>
        </div>

        {/* Link to Signup */}
        <p className="text-center text-xs text-[#342D38]/70 font-semibold mt-6">
          Don't have an account?{" "}
          <Link
            to="/signup"
            className="text-[#4E3E8C] font-extrabold hover:underline underline-offset-4"
          >
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
};
