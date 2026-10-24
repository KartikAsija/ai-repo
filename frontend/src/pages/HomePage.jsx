import React, { useState, useEffect } from "react";
import { 
  Compass, 
  Users, 
  Sparkles, 
  PlusCircle, 
  ArrowRight, 
  Briefcase, 
  Award, 
  CheckCircle2, 
  Clock, 
  Target, 
  BookOpen,
  ArrowUpRight,
  ChevronRight,
  TrendingUp,
  Layers
} from "lucide-react";
import { useLearner } from "../context/LearnerContext";
import { api } from "../api/client";
import MetricCard from "../components/common/MetricCard";

export default function HomePage({ setCurrentPage, onRunDemo }) {
  const { learners, activeLearnerId, setActiveLearnerId, activeLearner, roles } = useLearner();
  const [analysis, setAnalysis] = useState(null);
  const [roadmap, setRoadmap] = useState(null);
  const [loadingMetrics, setLoadingMetrics] = useState(false);

  // Fetch real data for active learner to compute dynamic KPIs
  useEffect(() => {
    if (!activeLearnerId) return;
    let isMounted = true;
    setLoadingMetrics(true);
    Promise.all([
      api.getAnalysis(activeLearnerId).catch(() => null),
      api.getRoadmap(activeLearnerId).catch(() => null)
    ]).then(([aData, rData]) => {
      if (isMounted) {
        setAnalysis(aData);
        setRoadmap(rData);
        setLoadingMetrics(false);
      }
    });
    return () => { isMounted = false; };
  }, [activeLearnerId]);

  // Derived real KPI metrics
  const readinessScore = analysis?.readiness_percentage ?? activeLearner?.readiness_percentage ?? 0;
  const skillsMatched = analysis 
    ? analysis.requirements.filter((r) => r.gap === 0).length 
    : (activeLearner?.skills?.filter((s) => s.current_level >= 2).length || 0);
  const skillsToImprove = analysis 
    ? analysis.requirements.filter((r) => r.gap > 0).length 
    : 0;
  const weeklyHours = activeLearner?.available_hours_per_week || 10;

  // Next recommended task from actual roadmap
  const nextTask = roadmap?.tasks?.find((t) => t.status !== "completed") || roadmap?.tasks?.[0];

  return (
    <div className="space-y-8 pb-16">
      {/* Personalized Linear-Style Header Banner */}
      <div className="relative rounded-2xl overflow-hidden border border-[#29384F] bg-gradient-to-br from-[#141F32] via-[#0E1A2C] to-[#0B1220] p-6 sm:p-8 shadow-elevated">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-[11px] font-medium bg-[#1A2940] text-[#22C5E5] border border-[#29384F]">
              <Compass className="w-3.5 h-3.5 text-[#22C5E5]" />
              <span>SFIA 8 & O*NET Competency Alignment</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#F1F5F9] tracking-tight">
              Welcome back, <span className="text-[#22C5E5]">{activeLearner?.alias?.split(" ")[0] || "Learner"}</span>
            </h1>

            <p className="text-xs sm:text-sm text-[#94A3B8] leading-relaxed">
              Target Career Role: <strong className="text-[#F1F5F9] font-semibold">{activeLearner?.target_role_title || "Technical Track"}</strong>.
              {nextTask ? (
                <span> Recommended next step: <span className="text-[#F1F5F9] font-medium">{nextTask.title}</span> ({nextTask.est_hours} hrs) to close requirement gaps.</span>
              ) : (
                <span> Explore your real-time framework alignment and staged milestones below.</span>
              )}
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                onClick={onRunDemo}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-[#22C5E5] hover:bg-[#06B6D4] text-[#0B1220] shadow-sm transition-all active:scale-95 focus:ring-2 focus:ring-[#22C5E5] focus:outline-none"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#0B1220]" />
                <span>Run Automated 2-Learner Demo</span>
              </button>

              <button
                onClick={() => setCurrentPage("profile")}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-[#1A2940] hover:bg-[#1E3250] text-[#F1F5F9] border border-[#29384F] transition-all focus:ring-2 focus:ring-[#22C5E5] focus:outline-none"
              >
                <PlusCircle className="w-3.5 h-3.5 text-[#22C5E5]" />
                <span>Build Custom Profile</span>
              </button>

              <button
                onClick={() => setCurrentPage("comparison")}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-[#94A3B8] hover:text-[#F1F5F9] hover:bg-[#1A2940]/60 transition-colors"
              >
                <span>Role Comparison</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#22C5E5]" />
              </button>
            </div>
          </div>

          {/* Quick Readiness Badge on Right */}
          <div className="hidden md:flex flex-col items-center justify-center p-5 rounded-xl bg-[#1A2940]/60 border border-[#29384F] min-w-[170px] text-center">
            <div className="text-[11px] font-semibold text-[#94A3B8] uppercase tracking-wider">Readiness Score</div>
            <div className="mt-1 text-4xl font-extrabold text-[#34D399] tracking-tight">
              {readinessScore}%
            </div>
            <div className="mt-1 text-[10px] text-[#94A3B8]">
              {analysis ? `${analysis.requirements.length} Rubric Criteria` : "Computed Deterministically"}
            </div>
          </div>
        </div>
      </div>

      {/* 4 Consistent KPI Metric Cards */}
      <div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <MetricCard
            title="Framework Readiness"
            value={`${readinessScore}%`}
            subtitle="Alignment to target rubric"
            icon={Target}
            color="emerald"
            badge="SFIA 8"
          />
          <MetricCard
            title="Skills Matched"
            value={skillsMatched}
            subtitle="At or above required level"
            icon={CheckCircle2}
            color="cyan"
            badge="Verified"
          />
          <MetricCard
            title="Skills to Improve"
            value={skillsToImprove}
            subtitle="Identified developmental gaps"
            icon={TrendingUp}
            color="amber"
            badge="Remedial"
          />
          <MetricCard
            title="Weekly Commitment"
            value={`${weeklyHours} hrs`}
            subtitle="Paced schedule capacity"
            icon={Clock}
            color="slate"
            badge="Pacing"
          />
        </div>
      </div>

      {/* Career Roadmap Preview Section */}
      {nextTask && (
        <div className="rounded-2xl border border-[#29384F] bg-[#141F32] p-5 sm:p-6 shadow-subtle">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#29384F] pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#1A2940] border border-[#29384F] flex items-center justify-center text-[#22C5E5]">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#22C5E5]/10 text-[#22C5E5] border border-[#22C5E5]/20">
                    Stage {nextTask.stage} • Week {nextTask.week_number}
                  </span>
                  <span className="text-xs text-[#94A3B8]">Immediate Next Milestone</span>
                </div>
                <h3 className="text-base font-bold text-[#F1F5F9] mt-0.5">{nextTask.title}</h3>
              </div>
            </div>

            <button
              onClick={() => setCurrentPage("roadmap")}
              className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-[#22C5E5] hover:bg-[#06B6D4] text-[#0B1220] transition-all shadow-sm shrink-0"
            >
              <span>Continue Roadmap</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 text-xs">
            <div className="space-y-1">
              <span className="text-[#94A3B8] font-semibold">Learning Activity & Rationale:</span>
              <p className="text-[#F1F5F9] leading-relaxed">{nextTask.numeric_why || "Addresses foundational framework requirements with concrete evidence."}</p>
            </div>
            <div className="space-y-1">
              <span className="text-[#94A3B8] font-semibold">Evidence Deliverable:</span>
              <div className="p-2.5 rounded-lg bg-[#0B1220] border border-[#29384F] text-[#22C5E5] font-mono text-[11px] truncate">
                {nextTask.evidence_artifact || "Code Repository & Analysis Document"}
              </div>
            </div>
            <div className="space-y-1">
              <span className="text-[#94A3B8] font-semibold">Time & Allocation:</span>
              <div className="p-2.5 rounded-lg bg-[#0B1220] border border-[#29384F] text-[#F1F5F9] flex items-center justify-between">
                <span>Estimated Duration:</span>
                <strong className="text-[#22C5E5]">{nextTask.est_hours} Hours</strong>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Demo Learner Profiles Showcase */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h2 className="text-lg font-bold text-[#F1F5F9] flex items-center gap-2">
              <Users className="w-5 h-5 text-[#22C5E5]" />
              <span>Learner Profiles (Context Switcher)</span>
            </h2>
            <p className="text-xs text-[#94A3B8]">
              Select an active profile to inspect customized gap scoring, weekly capacity schedules, and replans
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {learners.map((learner) => {
            const isSelected = activeLearnerId === learner.id;
            const isJordan = learner.alias.includes("Jordan");
            const isAlex = learner.alias.includes("Alex");
            const pct = learner.readiness_percentage || 0;

            return (
              <div
                key={learner.id}
                onClick={() => setActiveLearnerId(learner.id)}
                className={`relative rounded-xl p-5 border cursor-pointer transition-all ${
                  isSelected
                    ? "bg-[#141F32] border-[#22C5E5] shadow-glow-accent ring-1 ring-[#22C5E5]"
                    : "bg-[#141F32] border-[#29384F] hover:border-[#3D506E] hover:bg-[#1A2940]/50"
                }`}
              >
                {/* Header row */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-sm text-[#F1F5F9]">{learner.alias}</span>
                      {isSelected ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#22C5E5]/15 text-[#22C5E5] border border-[#22C5E5]/30">
                          Active Profile
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#1A2940] text-[#94A3B8] border border-[#29384F]">
                          {isJordan ? "Career Changer" : isAlex ? "CS Graduate" : "Custom Learner"}
                        </span>
                      )}
                    </div>
                    <div className="mt-1 flex items-center gap-2 text-xs text-[#94A3B8]">
                      <Briefcase className="w-3.5 h-3.5 text-[#22C5E5]" />
                      <span>{learner.current_role}</span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-[11px] text-[#94A3B8] font-medium">Framework Readiness</div>
                    <div className="text-xl font-extrabold text-[#34D399]">
                      {pct > 0 ? `${pct}%` : "Computing..."}
                    </div>
                  </div>
                </div>

                {/* Compact Progress Bar */}
                <div className="mt-3 w-full bg-[#0B1220] h-1.5 rounded-full overflow-hidden border border-[#29384F]">
                  <div 
                    className="bg-[#22C5E5] h-full rounded-full transition-all duration-500" 
                    style={{ width: `${Math.min(100, Math.max(5, pct))}%` }}
                  />
                </div>

                {/* Details grid */}
                <div className="mt-4 pt-3 border-t border-[#29384F] grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[#94A3B8] text-[11px] block">Target Role</span>
                    <div className="font-semibold text-[#F1F5F9] truncate">{learner.target_role_title}</div>
                  </div>
                  <div>
                    <span className="text-[#94A3B8] text-[11px] block">Weekly Commitment</span>
                    <div className="font-semibold text-[#F1F5F9]">{learner.available_hours_per_week} hrs/week</div>
                  </div>
                </div>

                {/* Footer action */}
                <div className="mt-4 pt-2 flex items-center justify-between text-xs border-t border-[#29384F]/60">
                  <span className="text-[11px] text-[#94A3B8] italic truncate max-w-[220px]">
                    {isJordan && "Scenario: Drops to 3 hrs/wk -> Roadmap replans"}
                    {isAlex && "Scenario: Pivots to Cloud/DevOps -> Roles replan"}
                    {!isJordan && !isAlex && "Custom learner profile"}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveLearnerId(learner.id);
                      setCurrentPage("comparison");
                    }}
                    className="flex items-center gap-1 text-[#22C5E5] hover:text-[#06B6D4] font-semibold text-xs shrink-0"
                  >
                    <span>View Gap Analysis</span>
                    <ChevronRight className="w-3.5 h-3.5" />
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
          <h2 className="text-lg font-bold text-[#F1F5F9] flex items-center gap-2">
            <Award className="w-5 h-5 text-[#22C5E5]" />
            <span>Documented Role Frameworks</span>
          </h2>
          <p className="text-xs text-[#94A3B8]">
            Pre-loaded industry taxonomies citing official SFIA and O*NET standards
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {roles.map((r) => (
            <div 
              key={r.role_id} 
              className="rounded-xl p-5 bg-[#141F32] border border-[#29384F] flex flex-col justify-between hover:border-[#3D506E] transition-all shadow-subtle"
            >
              <div>
                <div className="font-bold text-sm text-[#F1F5F9]">{r.title}</div>
                <div className="mt-1 text-xs text-[#22C5E5] font-mono">Source: {r.source}</div>
                <p className="mt-2 text-xs text-[#94A3B8] leading-relaxed line-clamp-3">{r.description}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-[#29384F] flex items-center justify-between text-[11px] text-[#94A3B8]">
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
