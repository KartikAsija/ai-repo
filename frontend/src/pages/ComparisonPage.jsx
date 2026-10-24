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
        <div className="w-8 h-8 border-2 border-[#58A6FF] border-t-transparent rounded-full animate-spin" />
        <div className="text-xs text-[#8B949E]">Computing deterministic skill gaps and rubric alignment...</div>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="text-center py-16 bg-[#161B22] rounded-xl border border-[#30363D] p-8 shadow-subtle">
        <AlertCircle className="w-8 h-8 text-[#D29922] mx-auto mb-2" />
        <h3 className="text-sm font-bold text-[#F0F6FC]">No Gap Analysis Found</h3>
        <p className="text-xs text-[#8B949E] mt-1">Please select or configure a learner profile to evaluate framework fit.</p>
        <button
          onClick={() => setCurrentPage("profile")}
          className="mt-4 px-4 py-2 bg-[#1F6FEB] hover:bg-[#388BFD] text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#30363D] pb-4">
        <div>
          <div className="text-[11px] font-semibold text-[#58A6FF] uppercase tracking-wider">
            Framework Alignment & Gap Discovery
          </div>
          <h1 className="text-2xl font-bold text-[#F0F6FC] flex items-center gap-2 mt-0.5">
            <BarChart3 className="w-6 h-6 text-[#58A6FF]" />
            <span>Target Role: {analysis.role_title}</span>
          </h1>
          <p className="text-xs text-[#8B949E] mt-1">
            Benchmarking <strong className="text-[#F0F6FC]">{activeLearner?.alias}</strong>'s competency against Level 1-5 criteria ({analysis.source || "SFIA 8 & O*NET"}).
          </p>
        </div>

        <button
          onClick={() => setCurrentPage("roadmap")}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-xs bg-[#1F6FEB] hover:bg-[#388BFD] text-white shadow-sm transition-colors focus:ring-1 focus:ring-[#58A6FF]"
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
      <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-5 sm:p-6 space-y-4 shadow-subtle">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#30363D] pb-3">
          <div>
            <h2 className="text-sm font-bold text-[#F0F6FC] flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#58A6FF]" />
              <span>Current Proficiency vs Required Proficiency</span>
            </h2>
            <p className="text-xs text-[#8B949E]">
              Comparison across standard SFIA/O*NET 5-level scale (Level 1 Novice to Level 5 Expert)
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs shrink-0">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-[#58A6FF] inline-block" />
              <span className="text-[#F0F6FC] font-medium">Current Acquired</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-[#21262D] inline-block border border-[#30363D]" />
              <span className="text-[#8B949E]">Target Required</span>
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
                    <span className="font-mono text-[11px] font-semibold text-[#58A6FF] bg-[#21262D] px-1.5 py-0.5 rounded border border-[#30363D]">
                      {req.req_id}
                    </span>
                    <span className="font-semibold text-[#F0F6FC] truncate">{req.skill}</span>
                    <span className="text-[11px] text-[#8B949E] hidden md:inline">({req.category})</span>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] font-mono shrink-0">
                    <span className="text-[#8B949E]">
                      Current: <strong className="text-[#58A6FF]">{req.current_level}</strong> / Req: <strong className="text-[#F0F6FC]">{req.required_level}</strong>
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                      isMet
                        ? "bg-[#3FB950]/15 text-[#3FB950] border border-[#3FB950]/30"
                        : "bg-[#D29922]/15 text-[#D29922] border border-[#D29922]/30"
                    }`}>
                      {isMet ? "Met" : `Gap: -${req.gap}`}
                    </span>
                  </div>
                </div>

                {/* Overlaid Progress Bar */}
                <div className="h-2 w-full bg-[#0D1117] rounded-full relative overflow-hidden border border-[#30363D]">
                  {/* Required Target (Background Bar) */}
                  <div
                    className="absolute top-0 bottom-0 bg-[#21262D] rounded-full"
                    style={{ width: `${requiredPct}%` }}
                    title={`Required: Level ${req.required_level}`}
                  />
                  {/* Current Acquired Level (Accent Bar) */}
                  <div
                    className={`absolute top-0 bottom-0 rounded-full transition-all duration-300 ${
                      isMet ? "bg-[#3FB950]" : "bg-[#58A6FF]"
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
      <div className="bg-[#161B22] border border-[#30363D] rounded-xl overflow-hidden shadow-subtle">
        {/* Table Filter & Sort Controls */}
        <div className="p-4 border-b border-[#30363D] flex flex-wrap items-center justify-between gap-3 bg-[#21262D]/40">
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-[#58A6FF]" />
            <span className="text-xs font-semibold text-[#8B949E]">Filter:</span>
            <div className="flex rounded-md bg-[#0D1117] p-0.5 border border-[#30363D]">
              {[
                { id: "all", label: "All Skills" },
                { id: "gaps", label: "Gaps Only" },
                { id: "strengths", label: "Matched" },
                { id: "missing", label: "Missing (0)" }
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFilterStatus(f.id)}
                  className={`px-3 py-1 rounded text-xs font-medium transition-all ${
                    filterStatus === f.id 
                      ? "bg-[#21262D] text-[#58A6FF] font-semibold border border-[#30363D] shadow-sm" 
                      : "text-[#8B949E] hover:text-[#F0F6FC]"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <ArrowUpDown className="w-3.5 h-3.5 text-[#58A6FF]" />
            <span className="text-xs font-semibold text-[#8B949E]">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-[#0D1117] border border-[#30363D] focus:border-[#58A6FF] rounded-md px-2.5 py-1 text-xs text-[#F0F6FC] focus:outline-none cursor-pointer"
            >
              <option value="priority" className="bg-[#161B22] text-[#F0F6FC]">Priority Ranking (High to Low)</option>
              <option value="gap" className="bg-[#161B22] text-[#F0F6FC]">Gap Size (Largest first)</option>
              <option value="skill" className="bg-[#161B22] text-[#F0F6FC]">Skill Name (A-Z)</option>
            </select>
          </div>
        </div>

        {/* Responsive Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#21262D] text-[#8B949E] font-semibold border-b border-[#30363D]">
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
            <tbody className="divide-y divide-[#30363D] text-[#8B949E]">
              {sortedReqs.map((req) => {
                const isVerified = req.verification_status === "verified";
                const isStrength = req.status === "Strength";
                const isMajor = req.status === "Major gap";
                const isMissing = req.status === "Missing";

                return (
                  <tr key={req.req_id} className="hover:bg-[#21262D]/40 transition-colors">
                    <td className="py-3 px-4 font-mono font-semibold text-[#58A6FF]">{req.req_id}</td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-[#F0F6FC]">{req.skill}</div>
                      <div className="text-[11px] text-[#8B949E] mt-0.5 line-clamp-1">{req.description}</div>
                    </td>
                    <td className="py-3 px-4 text-[#F0F6FC]">{req.category}</td>
                    <td className="py-3 px-4 text-center font-semibold text-[#F0F6FC]">Level {req.required_level}</td>
                    <td className="py-3 px-4 text-center font-semibold text-[#58A6FF]">Level {req.current_level}</td>
                    <td className="py-3 px-4 text-center">
                      <span className={`font-mono font-semibold ${req.gap > 0 ? "text-[#D29922]" : "text-[#3FB950]"}`}>
                        {req.gap > 0 ? `-${req.gap}` : "0"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center font-mono font-semibold text-[#58A6FF]">
                      {req.priority}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          isStrength
                            ? "bg-[#3FB950]/15 text-[#3FB950] border border-[#3FB950]/30"
                            : isMissing
                            ? "bg-[#F85149]/15 text-[#F85149] border border-[#F85149]/30"
                            : isMajor
                            ? "bg-[#D29922]/15 text-[#D29922] border border-[#D29922]/30"
                            : "bg-[#58A6FF]/15 text-[#58A6FF] border border-[#58A6FF]/30"
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
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#3FB950] hover:underline"
                        >
                          <span>Verified Artifact</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      ) : (
                        <span className="text-[11px] text-[#8B949E] italic">
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
