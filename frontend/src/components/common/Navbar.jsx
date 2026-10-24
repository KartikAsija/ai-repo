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
  ChevronDown
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

  return (
    <header className="bg-[#161B22] border-b border-[#30363D] sticky top-0 z-40 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 gap-4">
          
          {/* Left: Minimal, Trustworthy Brand Identity */}
          <div 
            className="flex items-center gap-2.5 cursor-pointer select-none shrink-0"
            onClick={() => handleNavClick("home")}
            title="Navigate to Overview"
          >
            {/* Minimalist Icon Badge */}
            <div className="w-8 h-8 rounded-lg bg-[#21262D] border border-[#30363D] flex items-center justify-center text-[#58A6FF] shrink-0">
              <Compass className="w-4 h-4" />
            </div>

            {/* Title & Framework Info */}
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm text-[#F0F6FC] tracking-tight">
                AI Career Navigator
              </span>
              <span className="hidden sm:inline-block text-[10px] font-mono text-[#8B949E] px-1.5 py-0.5 rounded bg-[#21262D] border border-[#30363D]">
                SFIA & O*NET
              </span>
            </div>
          </div>

          {/* Center: Understated, Spacious Navigation */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${
                    isActive
                      ? "bg-[#21262D] text-[#F0F6FC] border border-[#30363D]"
                      : "text-[#8B949E] hover:text-[#F0F6FC] hover:bg-[#21262D]/60"
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? "text-[#58A6FF]" : "text-[#8B949E]"}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right: Learner Selector + Primary Action */}
          <div className="hidden sm:flex items-center gap-2.5 shrink-0">
            {/* Active Learner Selector */}
            <div className="relative">
              <select
                value={activeLearnerId || ""}
                onChange={(e) => setActiveLearnerId(e.target.value)}
                className="bg-[#21262D] border border-[#30363D] hover:border-[#484F58] text-[#F0F6FC] text-xs rounded-lg pl-8 pr-7 py-1.5 focus:outline-none focus:border-[#58A6FF] appearance-none cursor-pointer transition-colors"
                title="Switch active learner context"
              >
                {learners.map((l) => (
                  <option key={l.id} value={l.id} className="bg-[#161B22] text-[#F0F6FC]">
                    {l.alias}
                  </option>
                ))}
              </select>
              <Users className="w-3.5 h-3.5 text-[#8B949E] absolute left-2.5 top-2.5 pointer-events-none" />
              <ChevronDown className="w-3.5 h-3.5 text-[#8B949E] absolute right-2 top-2.5 pointer-events-none" />
            </div>

            {/* Run Demo Button (Calm, Professional) */}
            <button
              onClick={onRunDemo}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-[#1F6FEB] hover:bg-[#388BFD] text-white transition-colors focus:outline-none"
              title="Execute automated walkthrough of both demo learners"
            >
              <Sparkles className="w-3.5 h-3.5 text-white/90" />
              <span>Run Demo</span>
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              onClick={onRunDemo}
              className="flex sm:hidden items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-[#1F6FEB] text-white"
            >
              <Sparkles className="w-3 h-3" />
              <span>Demo</span>
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 rounded-md text-[#8B949E] hover:text-[#F0F6FC] hover:bg-[#21262D] border border-[#30363D]"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-4 h-4 text-[#F0F6FC]" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-[#30363D] bg-[#161B22] px-4 pt-3 pb-4 space-y-3">
          <div className="sm:hidden pb-2 border-b border-[#30363D]">
            <label className="block text-[11px] font-medium text-[#8B949E] mb-1">Active Learner:</label>
            <div className="relative">
              <select
                value={activeLearnerId || ""}
                onChange={(e) => setActiveLearnerId(e.target.value)}
                className="w-full bg-[#21262D] border border-[#30363D] text-[#F0F6FC] text-xs rounded-lg pl-8 pr-7 py-2 focus:outline-none appearance-none"
              >
                {learners.map((l) => (
                  <option key={l.id} value={l.id} className="bg-[#161B22] text-[#F0F6FC]">
                    {l.alias}
                  </option>
                ))}
              </select>
              <Users className="w-3.5 h-3.5 text-[#8B949E] absolute left-2.5 top-2.5 pointer-events-none" />
              <ChevronDown className="w-3.5 h-3.5 text-[#8B949E] absolute right-2.5 top-2.5 pointer-events-none" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-medium text-left transition-colors ${
                    isActive
                      ? "bg-[#21262D] text-[#58A6FF] font-semibold border border-[#30363D]"
                      : "text-[#8B949E] hover:bg-[#21262D]/60 hover:text-[#F0F6FC]"
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-[#58A6FF]" : "text-[#8B949E]"}`} />
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
