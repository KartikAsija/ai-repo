import React, { useState, useEffect } from "react";
import { 
  GitFork, 
  ArrowRight, 
  ExternalLink, 
  Search, 
  CheckCircle2, 
  ShieldCheck, 
  Layers, 
  FileText,
  AlertTriangle,
  Compass
} from "lucide-react";
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
        <div className="w-8 h-8 border-2 border-[#58A6FF] border-t-transparent rounded-full animate-spin" />
        <div className="text-xs text-[#8B949E]">Loading bidirectional traceability matrix...</div>
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
    r.req_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (r.category && r.category.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const filteredTasks = roadmap.tasks.filter((t) =>
    t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (t.evidence_artifact && t.evidence_artifact.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#30363D] pb-4">
        <div>
          <div className="text-[11px] font-semibold text-[#58A6FF] uppercase tracking-wider">
            Auditability & Verification Lineage
          </div>
          <h1 className="text-2xl font-bold text-[#F0F6FC] flex items-center gap-2 mt-0.5">
            <GitFork className="w-6 h-6 text-[#58A6FF]" />
            <span>Traceability Explorer</span>
          </h1>
          <p className="text-xs text-[#8B949E] mt-1">
            Bidirectional lineage: verify that every single task and deliverable links directly to an objective industry requirement.
          </p>
        </div>

        {/* View Switcher */}
        <div className="flex items-center gap-1.5 bg-[#161B22] p-1 rounded-xl border border-[#30363D]">
          <button
            onClick={() => setViewMode("forward")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              viewMode === "forward" 
                ? "bg-[#21262D] text-[#58A6FF] border border-[#30363D] shadow-sm" 
                : "text-[#8B949E] hover:text-[#F0F6FC]"
            }`}
          >
            Requirement → Evidence
          </button>
          <button
            onClick={() => setViewMode("reverse")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              viewMode === "reverse" 
                ? "bg-[#21262D] text-[#58A6FF] border border-[#30363D] shadow-sm" 
                : "text-[#8B949E] hover:text-[#F0F6FC]"
            }`}
          >
            Evidence → Requirement
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-[#8B949E] absolute left-3.5 top-3" />
        <input
          type="text"
          placeholder="Search by requirement ID, skill, task, category, or evidence artifact..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-[#161B22] border border-[#30363D] rounded-xl pl-10 pr-4 py-2.5 text-xs text-[#F0F6FC] placeholder-[#8B949E] focus:outline-none focus:ring-1 focus:ring-[#58A6FF] focus:border-[#58A6FF]"
        />
      </div>

      {/* Forward Lineage: Requirement -> Gap -> Tasks -> Deliverables */}
      {viewMode === "forward" && (
        <div className="space-y-4">
          {filteredRequirements.map((req) => {
            const linkedTasks = reqToTasksMap[req.req_id] || [];
            const isMet = req.gap === 0;

            return (
              <div 
                key={req.req_id} 
                className="bg-[#161B22] border border-[#30363D] rounded-xl p-5 sm:p-6 space-y-4 shadow-subtle"
              >
                {/* Requirement Line */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#30363D] pb-3">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="font-mono text-xs font-semibold text-[#58A6FF] bg-[#21262D] px-2 py-0.5 rounded border border-[#30363D]">
                      {req.req_id}
                    </span>
                    <span className="font-semibold text-sm text-[#F0F6FC]">{req.skill}</span>
                    <span className="text-xs text-[#8B949E]">({req.category})</span>
                  </div>

                  <div className="flex items-center gap-3 text-xs font-mono">
                    <span className="text-[#8B949E]">
                      Baseline: <strong className="text-[#58A6FF]">L{req.current_level}</strong> / Target: <strong className="text-[#F0F6FC]">L{req.required_level}</strong>
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                      isMet
                        ? "bg-[#3FB950]/15 text-[#3FB950] border border-[#3FB950]/30"
                        : "bg-[#D29922]/15 text-[#D29922] border border-[#D29922]/30"
                    }`}>
                      {isMet ? "Level Met (0 Gap)" : `Gap Size: -${req.gap}`}
                    </span>
                  </div>
                </div>

                {/* Linked Tasks and Evidence Lineage */}
                <div className="pl-4 border-l-2 border-[#58A6FF]/40 space-y-3">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-[#8B949E] block">
                    Remedial Learning Tasks & Evidence Artifacts ({linkedTasks.length})
                  </span>

                  {linkedTasks.length === 0 ? (
                    <div className="text-xs text-[#8B949E] italic p-3 bg-[#0D1117] rounded-lg border border-[#30363D]">
                      No explicit remedial tasks required (skill is already at or above required standard).
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {linkedTasks.map((t) => (
                        <div 
                          key={t.id} 
                          className="p-3.5 bg-[#21262D]/60 border border-[#30363D] rounded-lg text-xs space-y-2"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-semibold text-[#F0F6FC]">{t.title}</span>
                              <span className="px-1.5 py-0.5 rounded text-[10px] bg-[#0D1117] text-[#8B949E] font-mono border border-[#30363D]">
                                Stage {t.stage} • Week {t.week_number}
                              </span>
                            </div>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                              t.status === "completed" 
                                ? "bg-[#3FB950]/15 text-[#3FB950] border border-[#3FB950]/30" 
                                : "bg-[#0D1117] text-[#8B949E] border border-[#30363D]"
                            }`}>
                              {t.status}
                            </span>
                          </div>

                          <div className="text-[11px] text-[#8B949E] leading-relaxed">
                            <strong className="text-[#F0F6FC]">Expected Deliverable:</strong>{" "}
                            <span className="text-[#58A6FF] font-mono">{t.evidence_artifact}</span>
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
            <div 
              key={task.id} 
              className="bg-[#161B22] border border-[#30363D] rounded-xl p-5 sm:p-6 space-y-3.5 shadow-subtle"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#30363D] pb-3">
                <div className="space-y-0.5">
                  <div className="text-[10px] font-semibold uppercase text-[#58A6FF]">Target Evidence Deliverable</div>
                  <div className="font-semibold text-sm text-[#F0F6FC] font-mono">
                    {task.evidence_artifact || "Project Code Deliverable"}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-xs bg-[#0D1117] border border-[#30363D] font-mono text-[#8B949E]">
                    Week {task.week_number}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                    task.status === "completed" 
                      ? "bg-[#3FB950]/15 text-[#3FB950] border border-[#3FB950]/30" 
                      : "bg-[#0D1117] text-[#8B949E] border border-[#30363D]"
                  }`}>
                    {task.status}
                  </span>
                </div>
              </div>

              {/* Linked Requirement Lineage */}
              <div className="pl-4 border-l-2 border-[#58A6FF] space-y-2">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-[#8B949E] block">
                  Produced by Task: {task.title}
                </span>

                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <span className="text-xs text-[#8B949E]">Addresses Framework Requirements:</span>
                  {task.linked_req_ids.map((rId) => {
                    const reqObj = analysis.requirements.find((r) => r.req_id === rId);
                    return (
                      <span
                        key={rId}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono bg-[#21262D] border border-[#30363D] text-[#F0F6FC]"
                      >
                        <strong className="text-[#58A6FF]">{rId}</strong>
                        {reqObj && <span>({reqObj.skill})</span>}
                      </span>
                    );
                  })}
                </div>

                <div className="text-xs text-[#8B949E] pt-1">
                  <strong className="text-[#F0F6FC]">Numeric Rationale:</strong> {task.numeric_why}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
