import React from "react";
import { Compass, Users, Sparkles, PlusCircle, ArrowRight, Briefcase, Award } from "lucide-react";
import { useLearner } from "../context/LearnerContext";

export default function HomePage({ setCurrentPage, onRunDemo }) {
  const { learners, activeLearnerId, setActiveLearnerId, roles } = useLearner();

  return (
    <div className="space-y-8 pb-12">
      {/* Hero Section with Specified Hero Gradient */}
      <div 
        className="relative rounded-2xl overflow-hidden border border-[#334155] p-8 sm:p-10 shadow-xl"
        style={{ background: "linear-gradient(120deg, #0B1220 0%, #132B46 55%, #0F766E 100%)" }}
      >
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-[#17243B]/80 text-[#38BDF8] border border-[#334155]">
            <Compass className="w-3.5 h-3.5" />
            <span>Deterministic Skill Gap Analysis & Staged Roadmaps</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#F8FAFC] tracking-tight">
            Navigate Your Career with <span className="text-[#38BDF8]">Verifiable Evidence</span>
          </h1>

          <p className="text-sm sm:text-base text-[#CBD5E1] leading-relaxed">
            Compare your current skill profile against industry frameworks (O*NET & SFIA). 
            Generate a personalized 4-stage roadmap fitted to your exact weekly hours, linking every gap to tangible deliverables and employability artifacts.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={onRunDemo}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-xs sm:text-sm bg-[#0F766E] hover:bg-[#115E59] text-white border border-teal-600/40 shadow-md transition-all active:scale-[0.98] focus:ring-2 focus:ring-[#38BDF8] focus:outline-none"
            >
              <Sparkles className="w-4 h-4 text-[#38BDF8]" />
              <span>Run Automated 2-Learner Demo</span>
            </button>
            <button
              onClick={() => setCurrentPage("profile")}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-xs sm:text-sm bg-[#17243B] hover:bg-[#1f3150] text-[#F8FAFC] border border-[#334155] transition-all focus:ring-2 focus:ring-[#38BDF8] focus:outline-none"
            >
              <PlusCircle className="w-4 h-4 text-[#38BDF8]" />
              <span>Build Custom Profile</span>
            </button>
          </div>
        </div>
      </div>

      {/* Demo Learner Profiles Showcase */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-[#F8FAFC] flex items-center gap-2">
              <Users className="w-5 h-5 text-[#38BDF8]" />
              <span>Learner Profiles (Select or Inspect)</span>
            </h2>
            <p className="text-xs text-[#CBD5E1]">
              Switch active context to inspect custom gap analysis, schedules, and replans
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {learners.map((learner) => {
            const isSelected = activeLearnerId === learner.id;
            const isJordan = learner.alias.includes("Jordan");
            const isAlex = learner.alias.includes("Alex");

            return (
              <div
                key={learner.id}
                onClick={() => setActiveLearnerId(learner.id)}
                className={`relative rounded-xl p-5 border cursor-pointer transition-all ${
                  isSelected
                    ? "bg-[#111C33] border-[#38BDF8] shadow-md ring-1 ring-[#38BDF8]"
                    : "bg-[#111C33] border-[#334155] hover:border-slate-500 hover:bg-[#17243B]"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-[#F8FAFC]">{learner.alias}</span>
                      {isSelected && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#17243B] text-[#38BDF8] border border-[#38BDF8]/40">
                          Active Profile
                        </span>
                      )}
                    </div>
                    <div className="mt-1 flex items-center gap-3 text-xs text-[#CBD5E1]">
                      <span className="flex items-center gap-1">
                        <Briefcase className="w-3 h-3 text-[#38BDF8]" />
                        {learner.current_role}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-xs text-[#CBD5E1] font-medium">Framework Readiness</div>
                    <div className="text-lg font-extrabold text-emerald-400">
                      {learner.readiness_percentage ? `${learner.readiness_percentage}%` : "Calculating..."}
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-[#334155] grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-400">Target Role:</span>
                    <div className="font-medium text-[#F8FAFC] truncate">{learner.target_role_title}</div>
                  </div>
                  <div>
                    <span className="text-slate-400">Weekly Commitment:</span>
                    <div className="font-medium text-[#F8FAFC]">{learner.available_hours_per_week} hrs/week</div>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between text-xs pt-1">
                  <span className="text-[11px] text-[#CBD5E1] italic">
                    {isJordan && "Scenario: Drops from 6 to 3 hrs/wk -> Roadmap replans with diff"}
                    {isAlex && "Scenario: Pivots from Full-Stack to Cloud/DevOps -> Roles replan"}
                    {!isJordan && !isAlex && "Custom learner profile"}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveLearnerId(learner.id);
                      setCurrentPage("comparison");
                    }}
                    className="flex items-center gap-1 text-[#38BDF8] hover:text-sky-300 font-semibold"
                  >
                    <span>View Gap Analysis</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Target Role Frameworks Catalog */}
      <div>
        <div className="mb-4">
          <h2 className="text-lg font-bold text-[#F8FAFC] flex items-center gap-2">
            <Award className="w-5 h-5 text-[#38BDF8]" />
            <span>Documented Role Frameworks</span>
          </h2>
          <p className="text-xs text-[#CBD5E1]">
            Pre-loaded industry taxonomies citing official SFIA and O*NET standards
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {roles.map((r) => (
            <div 
              key={r.role_id} 
              className="rounded-xl p-5 bg-[#111C33] border border-[#334155] flex flex-col justify-between hover:border-slate-500 transition-colors"
            >
              <div>
                <div className="font-bold text-sm text-[#F8FAFC]">{r.title}</div>
                <div className="mt-1 text-xs text-[#38BDF8] font-medium">Source: {r.source}</div>
                <p className="mt-2 text-xs text-[#CBD5E1] leading-relaxed line-clamp-3">{r.description}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-[#334155] flex items-center justify-between text-[11px] text-[#CBD5E1]">
                <span>{r.requirements_count} Requirements</span>
                <span>{r.resources_count} Learning Modules</span>
                <span>{r.projects_count} Capstones</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
