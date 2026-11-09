import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  ClipboardList,
  BarChart3,
  LogOut,
  Menu,
  X,
  HeartHandshake,
  Sparkles,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { label: "Dashboard", href: "/", icon: LayoutDashboard, iconBg: "bg-[#DDECFB]", iconColor: "text-[#25588C]" },
    { label: "Readings", href: "/readings", icon: ClipboardList, iconBg: "bg-[#E3F0E5]", iconColor: "text-[#2E5436]" },
    { label: "Reports", href: "/reports", icon: BarChart3, iconBg: "bg-[#E8E5FA]", iconColor: "text-[#4E3E8C]" },
  ];

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const getInitials = (name?: string) => {
    if (!name) return "S";
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  return (
    <div className="min-h-screen bg-[#FAF6F0] flex flex-col md:flex-row text-[#342D38]">
      {/* Mobile Top Navigation Bar: Soft Lavender Tint */}
      <header className="md:hidden bg-[#FBF8FE]/95 backdrop-blur-md border-b border-[#E5DCF5] px-4 py-3.5 flex items-center justify-between sticky top-0 z-30 shadow-xs">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-[#E8E5FA] border border-[#D5CEF5] flex items-center justify-center text-[#4E3E8C] shadow-pastel-lavender">
            <HeartHandshake className="w-5 h-5" />
          </div>
          <div>
            <span className="font-extrabold text-[#342D38] tracking-tight text-base leading-none block">
              Sweety
            </span>
            <span className="text-[10px] font-bold text-[#8A7D91] tracking-wider uppercase block mt-0.5">
              Glucose Tracker
            </span>
          </div>
        </Link>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle navigation menu"
          className="p-2 text-[#342D38] hover:bg-[#E8E5FA] rounded-xl transition-colors"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </header>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#FBF8FE] border-b border-[#E5DCF5] px-4 py-4 space-y-2.5 z-20 shadow-pastel-card">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = location.pathname === item.href;
            return (
              <Link
                key={item.href}
                to={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-2xl text-xs font-extrabold transition-all ${
                  active
                    ? "bg-[#E8E5FA] text-[#4E3E8C] border border-[#D5CEF5] shadow-pastel-lavender"
                    : "text-[#342D38] hover:bg-white/80"
                }`}
              >
                <div className={`w-7 h-7 rounded-xl flex items-center justify-center ${item.iconBg} ${item.iconColor}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <span>{item.label}</span>
              </Link>
            );
          })}
          <div className="pt-3.5 border-t border-[#E5DCF5] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-[#F8DDE8] border border-[#F2BFD6] flex items-center justify-center text-[#8A345C] text-xs font-extrabold">
                {getInitials(user?.name)}
              </div>
              <div className="text-xs">
                <p className="font-extrabold text-[#342D38]">{user?.name}</p>
                <p className="text-[11px] text-[#8A7D91] truncate max-w-[140px] font-medium">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="text-xs font-extrabold text-[#8E3737] hover:bg-[#FCE8E6] flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-colors border border-transparent hover:border-[#F7CCD0]"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign out
            </button>
          </div>
        </div>
      )}

      {/* Desktop Sidebar Navigation: Subtle Lavender/Blush Tint */}
      <aside className="hidden md:flex flex-col w-64 bg-[#FBF8FE] border-r border-[#E5DCF5] p-6 shrink-0 sticky top-0 h-screen justify-between shadow-[2px_0_16px_rgba(120,100,200,0.03)]">
        <div className="space-y-8">
          {/* Logo & Brand Header */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-2xl bg-[#E8E5FA] border border-[#D5CEF5] flex items-center justify-center text-[#4E3E8C] shadow-pastel-lavender transition-transform duration-200 group-hover:scale-105">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="font-extrabold text-[#342D38] tracking-tight text-xl leading-none">
                  Sweety
                </h1>
                <Sparkles className="w-4 h-4 text-[#F3B59D]" />
              </div>
              <p className="text-[10px] font-bold text-[#8A7D91] uppercase tracking-widest mt-1">
                Glucose Tracker
              </p>
            </div>
          </Link>

          {/* Navigation Links with Colored Icon Accents */}
          <nav className="space-y-2">
            <div className="text-[10px] font-extrabold text-[#8A7D91] uppercase tracking-widest px-3 mb-2">
              Menu
            </div>
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = location.pathname === item.href;
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-extrabold transition-all duration-200 ${
                    active
                      ? "bg-[#E8E5FA] text-[#4E3E8C] shadow-pastel-lavender border border-[#D5CEF5]"
                      : "text-[#342D38]/80 hover:bg-white hover:text-[#342D38] border border-transparent hover:border-black/5"
                  }`}
                >
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shadow-2xs ${item.iconBg} ${item.iconColor}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Card & Logout with Rose/Blush Avatar */}
        <div className="pt-5 border-t border-[#E5DCF5]">
          <div className="flex items-center gap-3 p-2.5 rounded-2xl bg-white border border-[#E5DCF5] mb-3 shadow-xs">
            <div className="w-9 h-9 rounded-xl bg-[#F8DDE8] border border-[#F2BFD6] flex items-center justify-center text-[#8A345C] text-xs font-extrabold shrink-0">
              {getInitials(user?.name)}
            </div>
            <div className="overflow-hidden min-w-0">
              <p className="text-xs font-extrabold text-[#342D38] truncate">{user?.name}</p>
              <p className="text-[11px] text-[#8A7D91] truncate font-medium">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-extrabold text-[#8E3737] hover:bg-[#FCE8E6] rounded-xl transition-colors border border-transparent hover:border-[#F7CCD0]"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-6xl mx-auto w-full">
        {children}
      </main>
    </div>
  );
};
