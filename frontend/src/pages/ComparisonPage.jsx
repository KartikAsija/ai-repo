import React, { useState, useEffect } from "react";
import { BarChart3, ArrowRight, AlertCircle, ExternalLink } from "lucide-react";
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
        <div className="w-8 h-8 border-4 border-[#38BDF8] border-t-transparent rounded-full animate-spin" />
        <div className="text-xs text-[#CBD5E1]">Computing deterministic skill gaps and framework alignment...</div>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="text-center py-16 bg-[#111C33] rounded-xl border border-[#334155] p-8">
        <AlertCircle className="w-8 h-8 text-amber-400 mx-auto mb-2" />
        <h3 className="text-sm font-semibold text-[#F8FAFC]">No Analysis Available</h3>
        <p className="text-xs text-[#CBD5E1] mt-1">Please select or configure a learner profile first.</p>
        <button
          onClick={() => setCurrentPage("profile")}
          className="mt-4 px-4 py-2 bg-[#0F766E] hover:bg-[#115E59] text-white rounded-lg text-xs font-semibold focus:ring-2 focus:ring-[#38BDF8]"
        >
          Configure Profile
        </button>
      </div>
    );
  }

  // Filter & Sort
  const filteredReqs = analysis.requirements.filter((r) => {
    if (filterStatus === "all") return true;
    if (filterStatus === "gaps") return r.gap > 0;
    if (filterStatus === "strengths") return r.status === "Strength";
    if (filterStatus === "missing") return r.status === "Missing";
    return true;
  });

  const sortedReqs = [...filteredReqs].sort((a, b) => {
    if (sortBy === "priority") return b.priority - a.priority;
    if (sortBy === "gap") return b.gap - a.gap;
    if (sortBy === "skill") return a.skill.localeCompare(b.skill);
    return 0;
  });

  return (
    <div className="space-y-6 pb-16">
      {/* Header & Role Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#334155] pb-4">
        <div>
          <div className="text-xs font-semibold text-[#38BDF8] uppercase tracking-wider">Gap Analysis & Benchmarking</div>
          <h1 className="text-2xl font-bold text-[#F8FAFC] flex items-center gap-2 mt-0.5">
            <BarChart3 className="w-6 h-6 text-[#38BDF8]" />
            <span>Target Role: {analysis.role_title}</span>
          </h1>
          <p className="text-xs text-[#CBD5E1] mt-1">
            Assessing {activeLearner?.alias}'s current skills against Level 1-5 objective framework criteria
          </p>
        </div>

        <button
          onClick={() => setCurrentPage("roadmap")}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs bg-[#0F766E] hover:bg-[#115E59] text-white shadow-sm active:scale-95 transition-all focus:ring-2 focus:ring-[#38BDF8] focus:outline-none"
        >
          <span>View Staged Roadmap</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <MetricCard
          title="Readiness Score"
          value={`${analysis.readiness_percentage}%`}
          subtitle="Alignment to framework"
          color="emerald"
        />
        <MetricCard
          title="Strengths"
          value={analysis.strengths_count}
          subtitle="At or above required level"
          color="teal"
        />
        <MetricCard
          title="Major Gaps"
          value={analysis.major_gaps_count}
          subtitle="Gap of 2 or more levels"
          color="amber"
        />
        <MetricCard
          title="Missing Skills"
          value={analysis.missing_count}
          subtitle="Unpracticed baseline skills"
          color="rose"
        />
      </div>

      {/* Comparative Visual Chart */}
      <div className="bg-[#111C33] border border-[#334155] rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-[#F8FAFC]">Current vs Required Level Comparison</h2>
          <div className="flex items-center gap-4 text-[11px]">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-[#38BDF8] inline-block" />
              <span className="text-[#CBD5E1]">Current Level</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-[#334155] inline-block" />
              <span className="text-[#CBD5E1]">Required Level</span>
            </div>
          </div>
        </div>

        <div className="space-y-3 pt-2">
          {analysis.requirements.map((req) => {
            const currentPct = (req.current_level / 5) * 100;
            const requiredPct = (req.required_level / 5) * 100;

            return (
              <div key={req.req_id} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-[#F8FAFC]">
                    <span className="font-mono text-[#38BDF8] mr-2">{req.req_id}</span>
                    {req.skill}
                  </span>
                  <span className="text-[#CBD5E1] font-mono text-[11px]">
                    Current: <strong className="text-[#38BDF8]">{req.current_level}</strong> / Req: <strong className="text-[#F8FAFC]">{req.required_level}</strong>
                  </span>
                </div>

                <div className="h-3 w-full bg-[#0B1220] rounded-full relative overflow-hidden border border-[#334155]/60">
                  {/* Required Target Marker */}
                  <div
                    className="absolute top-0 bottom-0 bg-[#334155] rounded-full"
                    style={{ width: `${requiredPct}%` }}
                  />
                  {/* Current Acquired Level */}
                  <div
                    className="absolute top-0 bottom-0 bg-[#38BDF8] rounded-full transition-all"
                    style={{ width: `${currentPct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Requirements Breakdown Table */}
      <div className="bg-[#111C33] border border-[#334155] rounded-xl overflow-hidden shadow-sm">
        {/* Table Controls */}
        <div className="p-4 border-b border-[#334155] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[#CBD5E1]">Filter:</span>
            <div className="flex rounded-lg bg-[#0B1220] p-0.5 border border-[#334155]">
              {[
                { id: "all", label: "All Reqs" },
                { id: "gaps", label: "Gaps Only" },
                { id: "strengths", label: "Strengths" },
                { id: "missing", label: "Missing" }
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFilterStatus(f.id)}
                  className={`px-2.5 py-1 rounded text-xs font-medium transition-all ${
                    filterStatus === f.id ? "bg-[#0F766E] text-white font-semibold" : "text-[#CBD5E1] hover:text-[#F8FAFC]"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[#CBD5E1]">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-[#0B1220] border border-[#334155] rounded-lg px-2.5 py-1 text-xs text-[#F8FAFC] focus:outline-none focus:ring-1 focus:ring-[#38BDF8]"
            >
              <option value="priority" className="bg-[#111C33] text-[#F8FAFC]">Priority Score (Highest first)</option>
              <option value="gap" className="bg-[#111C33] text-[#F8FAFC]">Gap Size (Largest first)</option>
              <option value="skill" className="bg-[#111C33] text-[#F8FAFC]">Skill Name (Alphabetical)</option>
            </select>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#17243B] text-[#CBD5E1] font-semibold border-b border-[#334155]">
              <tr>
                <th className="py-3 px-4">Req ID</th>
                <th className="py-3 px-4">Requirement / Skill</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4 text-center">Req Lvl</th>
                <th className="py-3 px-4 text-center">Current</th>
                <th className="py-3 px-4 text-center">Gap</th>
                <th className="py-3 px-4 text-center">Priority</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Proof Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#334155]/60 text-[#CBD5E1]">
              {sortedReqs.map((req) => {
                const isVerified = req.verification_status === "verified";
                const isStrength = req.status === "Strength";
                const isMajor = req.status === "Major gap";
                const isMissing = req.status === "Missing";

                return (
                  <tr key={req.req_id} className="hover:bg-[#17243B] transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-[#38BDF8]">{req.req_id}</td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-[#F8FAFC]">{req.skill}</div>
                      <div className="text-[11px] text-[#CBD5E1] mt-0.5 line-clamp-1">{req.description}</div>
                    </td>
                    <td className="py-3 px-4 text-[#CBD5E1]">{req.category}</td>
                    <td className="py-3 px-4 text-center font-bold text-[#F8FAFC]">{req.required_level}</td>
                    <td className="py-3 px-4 text-center font-bold text-[#38BDF8]">{req.current_level}</td>
                    <td className="py-3 px-4 text-center">
                      <span className={`font-mono font-bold ${req.gap > 0 ? "text-amber-400" : "text-emerald-400"}`}>
                        {req.gap}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center font-mono font-bold text-[#38BDF8]">
                      {req.priority}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          isStrength
                            ? "bg-emerald-950/40 text-emerald-400 border border-emerald-700/50"
                            : isMissing
                            ? "bg-rose-950/40 text-rose-400 border border-rose-700/50"
                            : isMajor
                            ? "bg-amber-950/40 text-amber-400 border border-amber-700/50"
                            : "bg-sky-950/40 text-[#38BDF8] border border-sky-700/50"
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
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 hover:underline"
                        >
                          <span>Verified</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      ) : (
                        <span className="text-[11px] font-medium text-amber-400/80 italic">
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
