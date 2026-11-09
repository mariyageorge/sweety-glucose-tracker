import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Activity,
  LayoutDashboard,
  ClipboardList,
  BarChart3,
  LogOut,
  Menu,
  X,
  User as UserIcon,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { label: "Dashboard", href: "/", icon: LayoutDashboard },
    { label: "Readings", href: "/readings", icon: ClipboardList },
    { label: "Reports", href: "/reports", icon: BarChart3 },
  ];

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Mobile Top Navigation Bar */}
      <header className="md:hidden bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between sticky top-0 z-30">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center text-white shadow-sm">
            <Activity className="w-5 h-5" />
          </div>
          <span className="font-bold text-slate-900 tracking-tight text-lg">Sweety</span>
        </Link>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-4 py-3 space-y-2 z-20">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = location.pathname === item.href;
            return (
              <Link
                key={item.href}
                to={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  active
                    ? "bg-teal-50 text-teal-700 font-semibold"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <Icon className={`w-5 h-5 ${active ? "text-teal-600" : "text-slate-400"}`} />
                {item.label}
              </Link>
            );
          })}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
                <UserIcon className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <p className="font-semibold text-slate-800">{user?.name}</p>
                <p className="text-slate-500 truncate max-w-[150px]">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="text-xs font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1 p-2"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      )}

      {/* Desktop Sidebar Navigation */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200 p-6 shrink-0 sticky top-0 h-screen justify-between">
        <div className="space-y-8">
          {/* Logo & Brand */}
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-600 flex items-center justify-center text-white shadow-md shadow-teal-500/20">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-bold text-slate-900 tracking-tight text-xl leading-none">
                Sweety
              </h1>
              <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider mt-1">
                Glucose Tracker
              </p>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = location.pathname === item.href;
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    active
                      ? "bg-teal-50 text-teal-800 font-semibold shadow-sm border border-teal-100/60"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  <Icon
                    className={`w-5 h-5 transition-colors ${
                      active ? "text-teal-600" : "text-slate-400"
                    }`}
                  />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Card & Logout */}
        <div className="pt-6 border-t border-slate-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 font-bold shrink-0">
              {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-semibold text-slate-900 truncate">{user?.name}</p>
              <p className="text-xs text-slate-500 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-slate-200 hover:border-rose-100"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
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

