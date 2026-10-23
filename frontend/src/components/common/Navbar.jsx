import React from "react";
import { Compass, Users, Sparkles, UserCheck, BarChart3, Map, CheckSquare, GitFork, Info } from "lucide-react";
import { useLearner } from "../../context/LearnerContext";

export default function Navbar({ currentPage, setCurrentPage, onRunDemo }) {
  const { learners, activeLearnerId, setActiveLearnerId } = useLearner();

  const navItems = [
    { id: "home", label: "Overview", icon: Compass },
    { id: "profile", label: "Profile", icon: UserCheck },
    { id: "comparison", label: "Role Comparison", icon: BarChart3 },
    { id: "roadmap", label: "Roadmap", icon: Map },
    { id: "dashboard", label: "Progress & Replan", icon: CheckSquare },
    { id: "traceability", label: "Traceability", icon: GitFork },
    { id: "about", label: "Methodology", icon: Info },
  ];

  return (
    <header className="bg-[#111C33] border-b border-[#334155] sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Title */}
          <div 
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => setCurrentPage("home")}
          >
            <div className="w-10 h-10 rounded-xl bg-[#17243B] border border-[#334155] flex items-center justify-center group-hover:border-[#38BDF8] transition-colors">
              <Compass className="w-5 h-5 text-[#38BDF8]" />
            </div>
            <div>
              <div className="font-bold text-base text-[#F8FAFC] flex items-center gap-2">
                <span>AI Career Navigator</span>
                <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-[#17243B] text-[#38BDF8] border border-[#334155]">
                  Localhost
                </span>
              </div>
              <div className="text-xs text-[#CBD5E1]">Framework Alignment Engine</div>
            </div>
          </div>

          {/* Nav links */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentPage(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? "bg-[#0F766E] text-white font-semibold shadow-sm"
                      : "text-[#CBD5E1] hover:text-[#F8FAFC] hover:bg-[#17243B]"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Active Learner Selector & Run Demo Button */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <select
                value={activeLearnerId || ""}
                onChange={(e) => setActiveLearnerId(e.target.value)}
                className="bg-[#17243B] border border-[#334155] text-[#F8FAFC] text-xs rounded-lg px-3 py-2 pr-8 focus:ring-2 focus:ring-[#38BDF8] focus:border-[#38BDF8] focus:outline-none appearance-none cursor-pointer"
              >
                {learners.map((l) => (
                  <option key={l.id} value={l.id} className="bg-[#111C33] text-[#F8FAFC]">
                    {l.alias}
                  </option>
                ))}
              </select>
              <Users className="w-3.5 h-3.5 text-[#CBD5E1] absolute right-2.5 top-2.5 pointer-events-none" />
            </div>

            <button
              onClick={onRunDemo}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-[#0F766E] hover:bg-[#115E59] text-white border border-teal-600/40 shadow-sm active:scale-95 transition-all focus:ring-2 focus:ring-[#38BDF8] focus:outline-none"
              title="Execute automated walkthrough of both demo learners"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#38BDF8]" />
              <span>Run Demo</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="flex md:hidden overflow-x-auto py-2 space-x-1 border-t border-[#334155] custom-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentPage(item.id)}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-medium whitespace-nowrap ${
                  isActive ? "bg-[#0F766E] text-white font-semibold" : "text-[#CBD5E1] hover:bg-[#17243B] hover:text-[#F8FAFC]"
                }`}
              >
                <Icon className="w-3 h-3" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}
