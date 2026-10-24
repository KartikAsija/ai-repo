import React, { useState, useEffect } from "react";
import { 
  BarChart3, 
  ArrowRight, 
  AlertCircle, 
  ExternalLink, 
  CheckCircle2, 
  AlertTriangle, 
  Layers, 
  BookOpen, 
  Filter, 
  ArrowUpDown,
  Compass
} from "lucide-react";
import { useLearner } from "../context/LearnerContext";
import { api } from "../api/client";
import MetricCard from "../components/common/MetricCard";

export default function ComparisonPage({ setCurrentPage }) {
  const { activeLearnerId, activeLearner } = useLearner();
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortBy, setSortBy] = useState("priority");

  useEffect(() => {
    if (!activeLearnerId) return;
    setLoading(true);
    api.getAnalysis(activeLearnerId)
      .then((data) => {
        setAnalysis(data);
      })
      .catch((err) => {
        console.error("Failed to load gap analysis:", err);
      })
      .finally(() => setLoading(false));
  }, [activeLearnerId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-3">
        <div className="w-8 h-8 border-3 border-[#22C5E5] border-t-transparent rounded-full animate-spin" />
        <div className="text-xs text-[#94A3B8]">Computing deterministic skill gaps and rubric alignment...</div>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="text-center py-16 bg-[#141F32] rounded-2xl border border-[#29384F] p-8 shadow-subtle">
        <AlertCircle className="w-8 h-8 text-[#FBBF24] mx-auto mb-2" />
        <h3 className="text-sm font-bold text-[#F1F5F9]">No Gap Analysis Found</h3>
        <p className="text-xs text-[#94A3B8] mt-1">Please select or configure a learner profile to evaluate framework fit.</p>
        <button
          onClick={() => setCurrentPage("profile")}
          className="mt-4 px-4 py-2 bg-[#22C5E5] hover:bg-[#06B6D4] text-[#0B1220] rounded-lg text-xs font-bold shadow-sm"
        >
          Configure Profile
        </button>
      </div>
    );
  }

  // Filter items
  const filteredReqs = analysis.requirements.filter((r) => {
    if (filterStatus === "all") return true;
    if (filterStatus === "gaps") return r.gap > 0;
    if (filterStatus === "strengths") return r.status === "Strength";
    if (filterStatus === "missing") return r.status === "Missing";
    return true;
  });

  // Sort items
  const sortedReqs = [...filteredReqs].sort((a, b) => {
    if (sortBy === "priority") return b.priority - a.priority;
    if (sortBy === "gap") return b.gap - a.gap;
    if (sortBy === "skill") return a.skill.localeCompare(b.skill);
    return 0;
  });

  return (
    <div className="space-y-6 pb-20">
      {/* Header & Role Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#29384F] pb-4">
        <div>
          <div className="text-[11px] font-semibold text-[#22C5E5] uppercase tracking-wider">
            Framework Alignment & Gap Discovery
          </div>
          <h1 className="text-2xl font-bold text-[#F1F5F9] flex items-center gap-2 mt-0.5">
            <BarChart3 className="w-6 h-6 text-[#22C5E5]" />
            <span>Target Role: {analysis.role_title}</span>
          </h1>
          <p className="text-xs text-[#94A3B8] mt-1">
            Benchmarking <strong className="text-[#F1F5F9]">{activeLearner?.alias}</strong>'s competency against Level 1-5 criteria ({analysis.source || "SFIA 8 & O*NET"}).
          </p>
        </div>

        <button
          onClick={() => setCurrentPage("roadmap")}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs bg-[#22C5E5] hover:bg-[#06B6D4] text-[#0B1220] shadow-sm active:scale-95 transition-all focus:ring-2 focus:ring-[#22C5E5]"
        >
          <span>View Staged Roadmap</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <MetricCard
          title="Framework Readiness"
          value={`${analysis.readiness_percentage}%`}
          subtitle="Overall alignment to rubric"
          color="emerald"
          badge="Score"
        />
        <MetricCard
          title="Matched Strengths"
          value={analysis.strengths_count}
          subtitle="At or above required level"
          color="cyan"
          badge="Level Met"
        />
        <MetricCard
          title="Major Gaps"
          value={analysis.major_gaps_count}
          subtitle="Disparity of 2+ rubric levels"
          color="amber"
          badge="Remedial"
        />
        <MetricCard
          title="Missing Skills"
          value={analysis.missing_count}
          subtitle="Baseline level 0 unpracticed"
          color="rose"
          badge="Prioritize"
        />
      </div>

      {/* Visual Proficiency Comparison Bars */}
      <div className="bg-[#141F32] border border-[#29384F] rounded-2xl p-5 sm:p-6 space-y-4 shadow-subtle">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#29384F] pb-3">
          <div>
            <h2 className="text-sm font-bold text-[#F1F5F9] flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#22C5E5]" />
              <span>Current Proficiency vs Required Proficiency</span>
            </h2>
            <p className="text-xs text-[#94A3B8]">
              Comparison across standard SFIA/O*NET 5-level scale (Level 1 Novice to Level 5 Expert)
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs shrink-0">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-[#22C5E5] inline-block" />
              <span className="text-[#F1F5F9] font-medium">Current Acquired</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-[#29384F] inline-block border border-[#3D506E]" />
              <span className="text-[#94A3B8]">Target Required</span>
            </div>
          </div>
        </div>

        <div className="space-y-3.5 pt-1">
          {analysis.requirements.map((req) => {
            const currentPct = (req.current_level / 5) * 100;
            const requiredPct = (req.required_level / 5) * 100;
            const isMet = req.gap === 0;

            return (
              <div key={req.req_id} className="space-y-1.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
                  <div className="flex items-center gap-2 truncate">
                    <span className="font-mono text-[11px] font-bold text-[#22C5E5] bg-[#1A2940] px-1.5 py-0.5 rounded border border-[#29384F]">
                      {req.req_id}
                    </span>
                    <span className="font-semibold text-[#F1F5F9] truncate">{req.skill}</span>
                    <span className="text-[11px] text-[#94A3B8] hidden md:inline">({req.category})</span>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] font-mono shrink-0">
                    <span className="text-[#94A3B8]">
                      Current: <strong className="text-[#22C5E5]">{req.current_level}</strong> / Req: <strong className="text-[#F1F5F9]">{req.required_level}</strong>
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      isMet
                        ? "bg-[#34D399]/15 text-[#34D399] border border-[#34D399]/30"
                        : "bg-[#FBBF24]/15 text-[#FBBF24] border border-[#FBBF24]/30"
                    }`}>
                      {isMet ? "Met" : `Gap: -${req.gap}`}
                    </span>
                  </div>
                </div>

                {/* Overlaid Progress Bar */}
                <div className="h-2.5 w-full bg-[#0B1220] rounded-full relative overflow-hidden border border-[#29384F]">
                  {/* Required Target (Background Bar) */}
                  <div
                    className="absolute top-0 bottom-0 bg-[#29384F] rounded-full"
                    style={{ width: `${requiredPct}%` }}
                    title={`Required: Level ${req.required_level}`}
                  />
                  {/* Current Acquired Level (Accent Bar) */}
                  <div
                    className={`absolute top-0 bottom-0 rounded-full transition-all duration-500 ${
                      isMet ? "bg-[#34D399]" : "bg-[#22C5E5]"
                    }`}
                    style={{ width: `${currentPct}%` }}
                    title={`Current: Level ${req.current_level}`}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Structured Requirements Breakdown Table */}
      <div className="bg-[#141F32] border border-[#29384F] rounded-2xl overflow-hidden shadow-subtle">
        {/* Table Filter & Sort Controls */}
        <div className="p-4 border-b border-[#29384F] flex flex-wrap items-center justify-between gap-3 bg-[#1A2940]/40">
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-[#22C5E5]" />
            <span className="text-xs font-semibold text-[#94A3B8]">Filter:</span>
            <div className="flex rounded-lg bg-[#0B1220] p-0.5 border border-[#29384F]">
              {[
                { id: "all", label: "All Skills" },
                { id: "gaps", label: "Gaps Only" },
                { id: "strengths", label: "Matched" },
                { id: "missing", label: "Missing (0)" }
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFilterStatus(f.id)}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                    filterStatus === f.id 
                      ? "bg-[#1A2940] text-[#22C5E5] font-semibold border border-[#29384F] shadow-sm" 
                      : "text-[#94A3B8] hover:text-[#F1F5F9]"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <ArrowUpDown className="w-3.5 h-3.5 text-[#22C5E5]" />
            <span className="text-xs font-semibold text-[#94A3B8]">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-[#0B1220] border border-[#29384F] focus:border-[#22C5E5] rounded-lg px-2.5 py-1 text-xs text-[#F1F5F9] focus:outline-none cursor-pointer"
            >
              <option value="priority" className="bg-[#141F32] text-[#F1F5F9]">Priority Ranking (High to Low)</option>
              <option value="gap" className="bg-[#141F32] text-[#F1F5F9]">Gap Size (Largest first)</option>
              <option value="skill" className="bg-[#141F32] text-[#F1F5F9]">Skill Name (A-Z)</option>
            </select>
          </div>
        </div>

        {/* Responsive Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#1A2940] text-[#94A3B8] font-semibold border-b border-[#29384F]">
              <tr>
                <th className="py-3 px-4">Req ID</th>
                <th className="py-3 px-4">Framework Requirement</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4 text-center">Req Level</th>
                <th className="py-3 px-4 text-center">Current</th>
                <th className="py-3 px-4 text-center">Gap Size</th>
                <th className="py-3 px-4 text-center">Priority</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Evidence Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#29384F] text-[#94A3B8]">
              {sortedReqs.map((req) => {
                const isVerified = req.verification_status === "verified";
                const isStrength = req.status === "Strength";
                const isMajor = req.status === "Major gap";
                const isMissing = req.status === "Missing";

                return (
                  <tr key={req.req_id} className="hover:bg-[#1A2940]/40 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-[#22C5E5]">{req.req_id}</td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-[#F1F5F9]">{req.skill}</div>
                      <div className="text-[11px] text-[#94A3B8] mt-0.5 line-clamp-1">{req.description}</div>
                    </td>
                    <td className="py-3 px-4 text-[#F1F5F9]">{req.category}</td>
                    <td className="py-3 px-4 text-center font-bold text-[#F1F5F9]">Level {req.required_level}</td>
                    <td className="py-3 px-4 text-center font-bold text-[#22C5E5]">Level {req.current_level}</td>
                    <td className="py-3 px-4 text-center">
                      <span className={`font-mono font-bold ${req.gap > 0 ? "text-[#FBBF24]" : "text-[#34D399]"}`}>
                        {req.gap > 0 ? `-${req.gap}` : "0"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center font-mono font-bold text-[#22C5E5]">
                      {req.priority}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          isStrength
                            ? "bg-[#34D399]/15 text-[#34D399] border border-[#34D399]/30"
                            : isMissing
                            ? "bg-[#F87171]/15 text-[#F87171] border border-[#F87171]/30"
                            : isMajor
                            ? "bg-[#FBBF24]/15 text-[#FBBF24] border border-[#FBBF24]/30"
                            : "bg-[#22C5E5]/15 text-[#22C5E5] border border-[#22C5E5]/30"
                        }`}
                      >
                        {req.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {isVerified ? (
                        <a
                          href={req.proof_url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#34D399] hover:underline"
                        >
                          <span>Verified Artifact</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      ) : (
                        <span className="text-[11px] text-[#FBBF24]/80 italic">
                          Unverified
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
