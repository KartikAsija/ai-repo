import React, { useState } from "react";
import { 
  Compass, 
  Users, 
  Sparkles, 
  UserCheck, 
  BarChart3, 
  Map, 
  CheckSquare, 
  GitFork, 
  Info,
  Menu,
  X,
  ChevronDown,
  Navigation,
  ShieldCheck
} from "lucide-react";
import { useLearner } from "../../context/LearnerContext";

export default function Navbar({ currentPage, setCurrentPage, onRunDemo }) {
  const { learners, activeLearnerId, setActiveLearnerId, activeLearner } = useLearner();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: "home", label: "Overview", icon: Compass },
    { id: "profile", label: "Profile", icon: UserCheck },
    { id: "comparison", label: "Role Comparison", icon: BarChart3 },
    { id: "roadmap", label: "Roadmap", icon: Map },
    { id: "dashboard", label: "Progress & Replan", icon: CheckSquare },
    { id: "traceability", label: "Traceability", icon: GitFork },
    { id: "about", label: "Methodology", icon: Info },
  ];

  const handleNavClick = (id) => {
    setCurrentPage(id);
    setMobileMenuOpen(false);
  };

  // Extract initials for active learner avatar
  const getInitials = (name) => {
    if (!name) return "AI";
    const parts = name.split(" ");
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <header className="bg-[#141F32]/95 border-b border-[#29384F] sticky top-0 z-40 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* ======================================================== */}
          {/* LEFT: Premium Custom Logo & App Brand Name               */}
          {/* ======================================================== */}
          <div 
            className="flex items-center gap-3 cursor-pointer group select-none shrink-0"
            onClick={() => handleNavClick("home")}
            title="Navigate to Overview"
          >
            {/* Custom Brand Icon Mark */}
            <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-[#1E2E48] via-[#141F32] to-[#0B1220] border border-[#29384F] group-hover:border-[#22C5E5] transition-all duration-300 shadow-subtle group-hover:shadow-[0_0_20px_rgba(34,197,229,0.35)] flex items-center justify-center shrink-0 overflow-hidden">
              {/* Subtle background glow */}
              <div className="absolute inset-0 bg-gradient-to-tr from-[#22C5E5]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              
              {/* Compass Navigator Glyph */}
              <div className="relative transition-transform duration-500 group-hover:rotate-45">
                <svg
                  className="w-5 h-5 text-[#22C5E5]"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {/* Outer reticle ticks */}
                  <circle cx="12" cy="12" r="9.5" stroke="#29384F" strokeWidth="1.5" className="group-hover:stroke-[#22C5E5]/40 transition-colors" />
                  <path d="M12 2.5V4M12 20v1.5M2.5 12H4M20 12h1.5" stroke="#22C5E5" strokeWidth="1.5" strokeLinecap="round" />
                  {/* Diamond needle */}
                  <path
                    d="M12 6L14.5 12L12 18L9.5 12L12 6Z"
                    fill="currentColor"
                    className="drop-shadow-[0_0_4px_rgba(34,197,229,0.6)]"
                  />
                  {/* Central pivot point */}
                  <circle cx="12" cy="12" r="1.5" fill="#34D399" />
                </svg>
              </div>
            </div>

            {/* Brand Typography & Tagline */}
            <div className="flex flex-col">
              <div className="font-extrabold text-sm sm:text-base text-[#F1F5F9] tracking-tight flex items-center gap-2 leading-tight">
                <span>
                  AI Career <span className="text-[#22C5E5]">Navigator</span>
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#22C5E5]/10 text-[#22C5E5] border border-[#22C5E5]/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#34D399] animate-pulse" />
                  SFIA 8 • O*NET
                </span>
              </div>
              <div className="text-[11px] text-[#94A3B8] font-medium tracking-normal hidden sm:block">
                Deterministic Framework Alignment Engine
              </div>
            </div>
          </div>

          {/* ======================================================== */}
          {/* CENTER: Desktop Floating Segmented Nav Strip             */}
          {/* ======================================================== */}
          <nav className="hidden lg:flex items-center bg-[#0B1220]/70 border border-[#29384F] p-1 rounded-xl shadow-inner space-x-0.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                    isActive
                      ? "bg-[#1A2940] text-[#22C5E5] font-semibold border border-[#29384F] shadow-sm"
                      : "text-[#94A3B8] hover:text-[#F1F5F9] hover:bg-[#141F32]"
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? "text-[#22C5E5]" : "text-[#94A3B8]"}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* ======================================================== */}
          {/* RIGHT: Active Learner Badge & Run Demo Action            */}
          {/* ======================================================== */}
          <div className="hidden sm:flex items-center gap-2.5 shrink-0">
            {/* Active Learner Selector Chip */}
            <div className="relative group">
              <div className="flex items-center gap-2 bg-[#0B1220] border border-[#29384F] hover:border-[#3D506E] rounded-xl pl-2 pr-7 py-1.5 text-xs text-[#F1F5F9] transition-colors cursor-pointer">
                {/* User Avatar Circle */}
                <div className="w-5 h-5 rounded-full bg-[#1A2940] text-[#22C5E5] border border-[#29384F] flex items-center justify-center font-bold text-[9px]">
                  {getInitials(activeLearner?.alias)}
                </div>
                <span className="font-semibold text-xs truncate max-w-[130px]">
                  {activeLearner?.alias || "Select Profile"}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-[#94A3B8] absolute right-2 top-2.5 pointer-events-none" />
              </div>

              {/* Native Select Overlay */}
              <select
                value={activeLearnerId || ""}
                onChange={(e) => setActiveLearnerId(e.target.value)}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                title="Switch active learner context"
              >
                {learners.map((l) => (
                  <option key={l.id} value={l.id} className="bg-[#141F32] text-[#F1F5F9]">
                    {l.alias} ({l.target_role_title || "Target Role"})
                  </option>
                ))}
              </select>
            </div>

            {/* Run Demo CTA Button */}
            <button
              onClick={onRunDemo}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-[#22C5E5] to-[#06B6D4] hover:from-[#06B6D4] hover:to-[#0EA5E9] text-[#0B1220] shadow-sm hover:shadow-[0_0_15px_rgba(34,197,229,0.35)] active:scale-95 transition-all focus:ring-2 focus:ring-[#22C5E5] focus:outline-none"
              title="Execute automated walkthrough of both demo learners"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#0B1220]" />
              <span className="whitespace-nowrap">Run Demo</span>
            </button>
          </div>

          {/* Mobile menu trigger */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              onClick={onRunDemo}
              className="flex sm:hidden items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-[#22C5E5] text-[#0B1220]"
            >
              <Sparkles className="w-3 h-3" />
              <span>Demo</span>
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-[#94A3B8] hover:text-[#F1F5F9] hover:bg-[#1A2940] border border-[#29384F] focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 text-[#22C5E5]" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* MOBILE: Collapsible Drawer                               */}
      {/* ======================================================== */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-[#29384F] bg-[#141F32] px-4 pt-3 pb-5 space-y-3 shadow-elevated animate-in fade-in duration-150">
          {/* Mobile Learner Select */}
          <div className="sm:hidden pb-3 border-b border-[#29384F]">
            <label className="block text-[11px] font-semibold text-[#94A3B8] mb-1.5">
              Active Learner Profile:
            </label>
            <div className="relative">
              <select
                value={activeLearnerId || ""}
                onChange={(e) => setActiveLearnerId(e.target.value)}
                className="w-full bg-[#0B1220] border border-[#29384F] text-[#F1F5F9] text-xs rounded-xl pl-9 pr-7 py-2 focus:ring-1 focus:ring-[#22C5E5] focus:outline-none appearance-none"
              >
                {learners.map((l) => (
                  <option key={l.id} value={l.id} className="bg-[#141F32] text-[#F1F5F9]">
                    {l.alias}
                  </option>
                ))}
              </select>
              <Users className="w-3.5 h-3.5 text-[#22C5E5] absolute left-3 top-3 pointer-events-none" />
              <ChevronDown className="w-3.5 h-3.5 text-[#94A3B8] absolute right-3 top-3 pointer-events-none" />
            </div>
          </div>

          {/* Navigation Links */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-left transition-all ${
                    isActive
                      ? "bg-[#1A2940] text-[#22C5E5] font-semibold border border-[#29384F]"
                      : "text-[#94A3B8] hover:bg-[#1A2940]/50 hover:text-[#F1F5F9]"
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-[#22C5E5]" : "text-[#94A3B8]"}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
}
