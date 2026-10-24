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
  TrendingUp, 
  Layers,
  ChevronRight
} from "lucide-react";
import { useLearner } from "../context/LearnerContext";
import { api } from "../api/client";
import MetricCard from "../components/common/MetricCard";

export default function HomePage({ setCurrentPage, onRunDemo }) {
  const { learners, activeLearnerId, setActiveLearnerId, activeLearner, roles } = useLearner();
  const [analysis, setAnalysis] = useState(null);
  const [roadmap, setRoadmap] = useState(null);

  // Fetch real data for active learner to compute dynamic KPIs
  useEffect(() => {
    if (!activeLearnerId) return;
    let isMounted = true;
    Promise.all([
      api.getAnalysis(activeLearnerId).catch(() => null),
      api.getRoadmap(activeLearnerId).catch(() => null)
    ]).then(([aData, rData]) => {
      if (isMounted) {
        setAnalysis(aData);
        setRoadmap(rData);
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
    <div className="space-y-7 pb-16">
      {/* Calm, Welcoming Header Surface */}
      <div className="rounded-xl border border-[#30363D] bg-[#161B22] p-6 sm:p-7">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2.5 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-[#21262D] text-[#8B949E] border border-[#30363D]">
              <Compass className="w-3.5 h-3.5 text-[#58A6FF]" />
              <span>SFIA 8 & O*NET Competency Alignment</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-[#F0F6FC] tracking-tight">
              Welcome back, {activeLearner?.alias?.split(" ")[0] || "Learner"}
            </h1>

            <p className="text-xs sm:text-sm text-[#8B949E] leading-relaxed">
              Target Career Role: <strong className="text-[#F0F6FC] font-semibold">{activeLearner?.target_role_title || "Technical Track"}</strong>.
              {nextTask ? (
                <span> Recommended next step: <span className="text-[#F0F6FC] font-medium">{nextTask.title}</span> ({nextTask.est_hours} hrs) to progress toward framework alignment.</span>
              ) : (
                <span> Explore your real-time framework alignment and staged milestones below.</span>
              )}
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-2.5">
              <button
                onClick={onRunDemo}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium bg-[#1F6FEB] hover:bg-[#388BFD] text-white transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Run Automated 2-Learner Demo</span>
              </button>

              <button
                onClick={() => setCurrentPage("profile")}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium bg-[#21262D] hover:bg-[#30363D] text-[#F0F6FC] border border-[#30363D] transition-colors"
              >
                <PlusCircle className="w-3.5 h-3.5 text-[#8B949E]" />
                <span>Edit Profile</span>
              </button>

              <button
                onClick={() => setCurrentPage("comparison")}
                className="flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-medium text-[#8B949E] hover:text-[#F0F6FC] transition-colors"
              >
                <span>View Gap Analysis</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Clean Readiness Summary on Right */}
          <div className="hidden md:flex flex-col items-center justify-center p-5 rounded-lg bg-[#21262D] border border-[#30363D] min-w-[160px] text-center">
            <span className="text-[11px] font-medium text-[#8B949E] uppercase tracking-wider">Framework Readiness</span>
            <div className="mt-1 text-3xl font-bold text-[#3FB950] tracking-tight">
              {readinessScore}%
            </div>
            <span className="mt-1 text-[11px] text-[#8B949E]">
              {analysis ? `${analysis.requirements.length} Rubric Criteria` : "Objective Score"}
            </span>
          </div>
        </div>
      </div>

      {/* 4 Consistent KPI Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <MetricCard
          title="Framework Readiness"
          value={`${readinessScore}%`}
          subtitle="Alignment to target rubric"
          icon={Target}
          badge="Score"
        />
        <MetricCard
          title="Skills Matched"
          value={skillsMatched}
          subtitle="At or above required level"
          icon={CheckCircle2}
          badge="Verified"
        />
        <MetricCard
          title="Skills to Improve"
          value={skillsToImprove}
          subtitle="Identified developmental gaps"
          icon={TrendingUp}
          badge="Remedial"
        />
        <MetricCard
          title="Weekly Commitment"
          value={`${weeklyHours} hrs`}
          subtitle="Paced schedule capacity"
          icon={Clock}
          badge="Pacing"
        />
      </div>

      {/* Career Roadmap Preview Section */}
      {nextTask && (
        <div className="rounded-xl border border-[#30363D] bg-[#161B22] p-5 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#30363D] pb-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#21262D] border border-[#30363D] flex items-center justify-center text-[#58A6FF]">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-medium px-1.5 py-0.5 rounded bg-[#21262D] text-[#8B949E] border border-[#30363D]">
                    Stage {nextTask.stage} • Week {nextTask.week_number}
                  </span>
                  <span className="text-xs text-[#8B949E]">Next Milestone</span>
                </div>
                <h3 className="text-sm font-semibold text-[#F0F6FC] mt-0.5">{nextTask.title}</h3>
              </div>
            </div>

            <button
              onClick={() => setCurrentPage("roadmap")}
              className="flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium bg-[#21262D] hover:bg-[#30363D] text-[#F0F6FC] border border-[#30363D] transition-colors shrink-0"
            >
              <span>Continue Roadmap</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#8B949E]" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 text-xs">
            <div className="space-y-1">
              <span className="text-[#8B949E] font-medium">Learning Activity & Objective</span>
              <p className="text-[#F0F6FC] leading-relaxed">{nextTask.numeric_why || "Addresses foundational framework requirements with concrete evidence."}</p>
            </div>
            <div className="space-y-1">
              <span className="text-[#8B949E] font-medium">Deliverable Artifact</span>
              <div className="p-2.5 rounded-lg bg-[#0D1117] border border-[#30363D] text-[#58A6FF] font-mono text-[11px] truncate">
                {nextTask.evidence_artifact || "Code Repository & Deliverable"}
              </div>
            </div>
            <div className="space-y-1">
              <span className="text-[#8B949E] font-medium">Time Allocation</span>
              <div className="p-2.5 rounded-lg bg-[#0D1117] border border-[#30363D] text-[#F0F6FC] flex items-center justify-between">
                <span className="text-[#8B949E]">Estimated Duration:</span>
                <strong className="text-[#F0F6FC]">{nextTask.est_hours} Hours</strong>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Demo Learner Profiles Showcase */}
      <div>
        <div className="mb-3">
          <h2 className="text-base font-semibold text-[#F0F6FC] flex items-center gap-2">
            <Users className="w-4 h-4 text-[#58A6FF]" />
            <span>Learner Profiles</span>
          </h2>
          <p className="text-xs text-[#8B949E]">
            Switch active context to inspect customized gap scoring, weekly capacity schedules, and replans
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {learners.map((learner) => {
            const isSelected = activeLearnerId === learner.id;
            const isJordan = learner.alias.includes("Jordan");
            const isAlex = learner.alias.includes("Alex");
            const pct = learner.readiness_percentage || 0;

            return (
              <div
                key={learner.id}
                onClick={() => setActiveLearnerId(learner.id)}
                className={`rounded-xl p-5 border cursor-pointer transition-all ${
                  isSelected
                    ? "bg-[#161B22] border-[#58A6FF]"
                    : "bg-[#161B22] border-[#30363D] hover:border-[#484F58]"
                }`}
              >
                {/* Header row */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-[#F0F6FC]">{learner.alias}</span>
                      {isSelected ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-[#1F6FEB]/20 text-[#58A6FF] border border-[#1F6FEB]/30">
                          Active Profile
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-[#21262D] text-[#8B949E] border border-[#30363D]">
                          {isJordan ? "Career Changer" : isAlex ? "CS Graduate" : "Custom Learner"}
                        </span>
                      )}
                    </div>
                    <div className="mt-1 flex items-center gap-1.5 text-xs text-[#8B949E]">
                      <Briefcase className="w-3.5 h-3.5" />
                      <span>{learner.current_role}</span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-[11px] text-[#8B949E]">Readiness</div>
                    <div className="text-lg font-bold text-[#3FB950]">
                      {pct > 0 ? `${pct}%` : "Calculating"}
                    </div>
                  </div>
                </div>

                {/* Subtle Progress Bar */}
                <div className="mt-3 w-full bg-[#0D1117] h-1.5 rounded-full overflow-hidden border border-[#30363D]">
                  <div 
                    className="bg-[#58A6FF] h-full rounded-full transition-all" 
                    style={{ width: `${Math.min(100, Math.max(5, pct))}%` }}
                  />
                </div>

                {/* Details */}
                <div className="mt-3 pt-3 border-t border-[#30363D] grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[#8B949E] text-[11px] block">Target Role</span>
                    <div className="font-medium text-[#F0F6FC] truncate">{learner.target_role_title}</div>
                  </div>
                  <div>
                    <span className="text-[#8B949E] text-[11px] block">Weekly Capacity</span>
                    <div className="font-medium text-[#F0F6FC]">{learner.available_hours_per_week} hrs/week</div>
                  </div>
                </div>

                {/* Footer action */}
                <div className="mt-3 pt-2 flex items-center justify-between text-xs border-t border-[#30363D]/60">
                  <span className="text-[11px] text-[#8B949E] truncate max-w-[220px]">
                    {isJordan && "Drops from 6 to 3 hrs/wk -> Roadmap replans"}
                    {isAlex && "Pivots to Cloud/DevOps -> Roles replan"}
                    {!isJordan && !isAlex && "Custom learner profile"}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveLearnerId(learner.id);
                      setCurrentPage("comparison");
                    }}
                    className="flex items-center gap-1 text-[#58A6FF] hover:underline font-medium text-xs shrink-0"
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
        <div className="mb-3">
          <h2 className="text-base font-semibold text-[#F0F6FC] flex items-center gap-2">
            <Award className="w-4 h-4 text-[#58A6FF]" />
            <span>Documented Role Frameworks</span>
          </h2>
          <p className="text-xs text-[#8B949E]">
            Pre-loaded industry taxonomies citing official SFIA and O*NET standards
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {roles.map((r) => (
            <div 
              key={r.role_id} 
              className="rounded-xl p-5 bg-[#161B22] border border-[#30363D] flex flex-col justify-between hover:border-[#484F58] transition-colors"
            >
              <div>
                <div className="font-semibold text-sm text-[#F0F6FC]">{r.title}</div>
                <div className="mt-0.5 text-xs text-[#58A6FF] font-mono">Source: {r.source}</div>
                <p className="mt-2 text-xs text-[#8B949E] leading-relaxed line-clamp-3">{r.description}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-[#30363D] flex items-center justify-between text-[11px] text-[#8B949E]">
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
