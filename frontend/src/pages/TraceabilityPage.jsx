import React, { useState, useEffect } from "react";
import { GitFork, ArrowRight, ExternalLink, Search, CheckCircle2, ShieldCheck, Layers, FileText } from "lucide-react";
import { useLearner } from "../context/LearnerContext";
import { api } from "../api/client";

export default function TraceabilityPage() {
  const { activeLearnerId, activeLearner } = useLearner();
  const [analysis, setAnalysis] = useState(null);
  const [roadmap, setRoadmap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("forward"); // forward: Req -> Evidence, reverse: Evidence -> Req
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (!activeLearnerId) return;
    setLoading(true);
    Promise.all([
      api.getAnalysis(activeLearnerId),
      api.getRoadmap(activeLearnerId)
    ])
      .then(([aData, rData]) => {
        setAnalysis(aData);
        setRoadmap(rData);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [activeLearnerId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-3">
        <div className="w-8 h-8 border-4 border-[#0F766E] border-t-transparent rounded-full animate-spin" />
        <div className="text-xs text-[#CBD5E1]">Loading bidirectional traceability matrix...</div>
      </div>
    );
  }

  if (!analysis || !roadmap) return null;

  // Build mapping: Req ID -> Tasks
  const reqToTasksMap = {};
  roadmap.tasks.forEach((task) => {
    task.linked_req_ids.forEach((rId) => {
      if (!reqToTasksMap[rId]) reqToTasksMap[rId] = [];
      reqToTasksMap[rId].push(task);
    });
  });

  // Filter items
  const filteredRequirements = analysis.requirements.filter((r) =>
    r.skill.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.req_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredTasks = roadmap.tasks.filter((t) =>
    t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (t.evidence_artifact && t.evidence_artifact.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#334155] pb-4">
        <div>
          <div className="text-xs font-semibold text-[#38BDF8] uppercase tracking-wider">Auditability & Verification</div>
          <h1 className="text-2xl font-bold text-[#F8FAFC] flex items-center gap-2 mt-0.5">
            <GitFork className="w-6 h-6 text-[#38BDF8]" />
            <span>Traceability Explorer</span>
          </h1>
          <p className="text-xs text-[#CBD5E1] mt-1">
            Bidirectional lineage: verify that every single task and deliverable links directly to a documented industry requirement.
          </p>
        </div>

        {/* View Switcher */}
        <div className="flex items-center gap-2 bg-[#111C33] p-1 rounded-xl border border-[#334155]">
          <button
            onClick={() => setViewMode("forward")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              viewMode === "forward" ? "bg-[#0F766E] text-white shadow-sm" : "text-[#CBD5E1] hover:text-[#F8FAFC]"
            }`}
          >
            Requirement → Evidence
          </button>
          <button
            onClick={() => setViewMode("reverse")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              viewMode === "reverse" ? "bg-[#0F766E] text-white shadow-sm" : "text-[#CBD5E1] hover:text-[#F8FAFC]"
            }`}
          >
            Evidence → Requirement
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-[#CBD5E1] absolute left-3 top-3" />
        <input
          type="text"
          placeholder="Search by requirement ID, skill, task, or deliverable..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-[#0B1220] border border-[#334155] rounded-xl pl-9 pr-4 py-2.5 text-xs text-[#F8FAFC] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#38BDF8] focus:border-[#38BDF8]"
        />
      </div>

      {/* Forward Lineage: Requirement -> Gap -> Tasks -> Deliverables */}
      {viewMode === "forward" && (
        <div className="space-y-4">
          {filteredRequirements.map((req) => {
            const linkedTasks = reqToTasksMap[req.req_id] || [];

            return (
              <div key={req.req_id} className="bg-[#111C33] border border-[#334155] rounded-xl p-5 space-y-4">
                {/* Requirement Line */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#334155]/60 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-[#38BDF8] bg-[#38BDF8]/10 px-2 py-0.5 rounded border border-[#38BDF8]/30">
                      {req.req_id}
                    </span>
                    <span className="font-bold text-sm text-[#F8FAFC]">{req.skill}</span>
                    <span className="text-xs text-[#CBD5E1]/70">({req.category})</span>
                  </div>

                  <div className="flex items-center gap-3 text-xs">
                    <span className="text-[#CBD5E1]">
                      Current: <strong className="text-[#38BDF8]">{req.current_level}</strong> / Req: <strong className="text-[#F8FAFC]">{req.required_level}</strong>
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      req.gap > 0 ? "bg-amber-500/20 text-amber-300 border border-amber-500/30" : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                    }`}>
                      {req.status} (Gap: {req.gap})
                    </span>
                  </div>
                </div>

                {/* Linked Tasks and Evidence */}
                <div className="pl-4 border-l-2 border-[#38BDF8]/40 space-y-3">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-[#CBD5E1]/70 block">
                    Assigned Execution Tasks & Evidence Artifacts ({linkedTasks.length})
                  </span>

                  {linkedTasks.length === 0 ? (
                    <div className="text-xs text-[#CBD5E1]/70 italic">
                      No explicit remedial tasks required (skill is already at or above required standard).
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {linkedTasks.map((t) => (
                        <div key={t.id} className="p-3 bg-[#17243B] border border-[#334155] rounded-lg text-xs space-y-1.5">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-[#F8FAFC]">{t.title}</span>
                              <span className="px-1.5 py-0.5 rounded text-[10px] bg-[#0B1220] text-[#CBD5E1] border border-[#334155]/60 font-mono">
                                Stage {t.stage} • Week {t.week_number}
                              </span>
                            </div>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              t.status === "completed" ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" : "bg-[#0B1220] text-[#CBD5E1] border border-[#334155]"
                            }`}>
                              {t.status}
                            </span>
                          </div>

                          <div className="text-[#CBD5E1] text-[11px]">
                            <strong className="text-[#38BDF8]">Evidence Deliverable:</strong> {t.evidence_artifact}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Reverse Lineage: Evidence Deliverable -> Task -> Gap -> Requirement */}
      {viewMode === "reverse" && (
        <div className="space-y-4">
          {filteredTasks.map((task) => (
            <div key={task.id} className="bg-[#111C33] border border-[#334155] rounded-xl p-5 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#334155]/60 pb-3">
                <div className="space-y-0.5">
                  <div className="text-[10px] font-bold uppercase text-[#38BDF8]">Target Evidence Artifact</div>
                  <div className="font-bold text-sm text-[#F8FAFC]">{task.evidence_artifact || "Project Code Deliverable"}</div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-xs bg-[#0B1220] border border-[#334155] font-mono text-[#CBD5E1]">
                    Week {task.week_number}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                    task.status === "completed" ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" : "bg-[#0B1220] text-[#CBD5E1] border border-[#334155]"
                  }`}>
                    {task.status}
                  </span>
                </div>
              </div>

              {/* Linked Requirement Lineage */}
              <div className="pl-4 border-l-2 border-[#0F766E] space-y-2">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-[#CBD5E1]/70 block">
                  Produced by Task: {task.title}
                </span>

                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <span className="text-xs text-[#CBD5E1]">Satisfies Requirements:</span>
                  {task.linked_req_ids.map((rId) => {
                    const reqObj = analysis.requirements.find((r) => r.req_id === rId);
                    return (
                      <span
                        key={rId}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono bg-[#17243B] border border-[#334155] text-[#F8FAFC]"
                      >
                        <strong className="text-[#38BDF8]">{rId}</strong>
                        {reqObj && <span>({reqObj.skill})</span>}
                      </span>
                    );
                  })}
                </div>

                <div className="text-xs text-[#CBD5E1] pt-1">
                  <strong className="text-[#F8FAFC]">Rationale:</strong> {task.numeric_why}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

