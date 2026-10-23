import React, { useState, useEffect } from "react";
import { Map, ExternalLink, Layers, CheckSquare, AlertCircle, FileText, HelpCircle } from "lucide-react";
import { useLearner } from "../context/LearnerContext";
import { api } from "../api/client";

export default function RoadmapPage({ setCurrentPage }) {
  const { activeLearnerId, activeLearner } = useLearner();
  const [roadmap, setRoadmap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedStage, setSelectedStage] = useState(1);
  const [activeTaskModal, setActiveTaskModal] = useState(null);
  const [loggedHoursInput, setLoggedHoursInput] = useState("");
  const [evidenceLinkInput, setEvidenceLinkInput] = useState("");

  const loadRoadmap = async () => {
    if (!activeLearnerId) return;
    try {
      setLoading(true);
      const data = await api.getRoadmap(activeLearnerId);
      setRoadmap(data);
    } catch (err) {
      console.error("Failed to load roadmap:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRoadmap();
  }, [activeLearnerId]);

  const handleUpdateTaskStatus = async (taskId, newStatus, hours = null, proof = null) => {
    try {
      const payload = { status: newStatus };
      if (hours !== null) payload.logged_hours = parseFloat(hours);
      if (proof !== null) payload.evidence_link = proof;

      await api.updateTask(taskId, payload);
      await loadRoadmap();
      setActiveTaskModal(null);
    } catch (err) {
      alert("Failed to update task: " + err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-3">
        <div className="w-8 h-8 border-4 border-[#38BDF8] border-t-transparent rounded-full animate-spin" />
        <div className="text-xs text-[#CBD5E1]">Loading staged schedule and weekly hours allocation...</div>
      </div>
    );
  }

  if (!roadmap) {
    return (
      <div className="text-center py-16 bg-[#111C33] rounded-xl border border-[#334155] p-8">
        <AlertCircle className="w-8 h-8 text-amber-400 mx-auto mb-2" />
        <h3 className="text-sm font-semibold text-[#F8FAFC]">No Active Roadmap</h3>
        <p className="text-xs text-[#CBD5E1] mt-1">Generate a schedule based on your profile to proceed.</p>
        <button
          onClick={() => api.createRoadmap(activeLearnerId).then(loadRoadmap)}
          className="mt-4 px-4 py-2 bg-[#0F766E] hover:bg-[#115E59] text-white rounded-lg text-xs font-semibold focus:ring-2 focus:ring-[#38BDF8]"
        >
          Generate Schedule Now
        </button>
      </div>
    );
  }

  const currentStageGroup = roadmap.stages.find((s) => s.stage === selectedStage) || roadmap.stages[0];

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#334155] pb-4">
        <div>
          <div className="text-xs font-semibold text-[#38BDF8] uppercase tracking-wider">
            Staged Execution Roadmap (v{roadmap.version})
          </div>
          <h1 className="text-2xl font-bold text-[#F8FAFC] flex items-center gap-2 mt-0.5">
            <Map className="w-6 h-6 text-[#38BDF8]" />
            <span>Target Role: {roadmap.role_title}</span>
          </h1>
          <p className="text-xs text-[#CBD5E1] mt-1">
            Fitted to <strong>{activeLearner?.available_hours_per_week} hrs/week</strong> • {roadmap.total_weeks} Total Weeks • {roadmap.total_planned_hours} Planned Hours
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-[11px] text-[#CBD5E1] font-medium">Progress Completion</div>
            <div className="text-lg font-bold text-emerald-400">{roadmap.completion_percentage}%</div>
          </div>
          <button
            onClick={() => setCurrentPage("dashboard")}
            className="px-4 py-2 bg-[#17243B] hover:bg-[#1f3150] border border-[#334155] text-[#F8FAFC] rounded-xl text-xs font-semibold transition-colors focus:ring-2 focus:ring-[#38BDF8]"
          >
            Open Progress & Replan
          </button>
        </div>
      </div>

      {/* Stage Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {roadmap.stages.map((stg) => {
          const isSelected = selectedStage === stg.stage;
          const pct = stg.tasks_count > 0 ? Math.round((stg.completed_count / stg.tasks_count) * 100) : 0;

          return (
            <button
              key={stg.stage}
              onClick={() => setSelectedStage(stg.stage)}
              className={`p-3.5 rounded-xl border text-left transition-all ${
                isSelected
                  ? "bg-[#111C33] border-[#38BDF8] shadow-md ring-1 ring-[#38BDF8]"
                  : "bg-[#111C33] border-[#334155] hover:border-slate-500 hover:bg-[#17243B]"
              }`}
            >
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-[#38BDF8]">Stage {stg.stage}</span>
                <span className="text-[#CBD5E1] font-mono text-[11px]">{pct}%</span>
              </div>
              <div className="text-xs font-bold text-[#F8FAFC] mt-0.5 truncate">{stg.stage_name}</div>
              <div className="mt-2 flex items-center justify-between text-[11px] text-[#CBD5E1]">
                <span>{stg.tasks_count} tasks</span>
                <span>{stg.total_hours} hrs</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Stage Detail Header */}
      <div className="bg-[#111C33] border border-[#334155] rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
        <div>
          <h2 className="text-base font-bold text-[#F8FAFC] flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#38BDF8]" />
            <span>Stage {currentStageGroup.stage}: {currentStageGroup.stage_name}</span>
          </h2>
          <p className="text-xs text-[#CBD5E1] mt-0.5">
            Tasks in this stage are strictly budgeted into sequential weeks adhering to the {activeLearner?.available_hours_per_week}h/week constraint.
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono">
          <span className="text-[#CBD5E1]">Stage Planned: <strong className="text-[#F8FAFC]">{currentStageGroup.total_hours}h</strong></span>
          <span className="text-[#CBD5E1]">Logged: <strong className="text-emerald-400">{currentStageGroup.completed_hours}h</strong></span>
        </div>
      </div>

      {/* Task Cards List */}
      <div className="space-y-4">
        {currentStageGroup.tasks.map((task) => {
          const isCompleted = task.status === "completed";
          const isInProgress = task.status === "in_progress";
          const isMilestone = task.title.toLowerCase().includes("milestone");

          return (
            <div
              key={task.id}
              className={`rounded-xl border p-5 transition-all shadow-sm ${
                isCompleted
                  ? "bg-[#111C33]/90 border-emerald-600/50"
                  : isMilestone
                  ? "bg-[#111C33] border-amber-500/50"
                  : "bg-[#111C33] border-[#334155] hover:border-slate-500"
              }`}
            >
              {/* Task Header Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#334155] pb-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-[#17243B] text-[#38BDF8] border border-[#334155]">
                    Week {task.week_number}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[11px] font-mono text-[#CBD5E1] bg-[#17243B] border border-[#334155]">
                    {task.est_hours} hrs est
                  </span>
                  {task.linked_req_ids.map((rId) => (
                    <span key={rId} className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#0B1220] text-[#38BDF8] border border-[#334155]">
                      {rId}
                    </span>
                  ))}
                  {isMilestone && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950/40 text-amber-300 border border-amber-700/50">
                      Stage Milestone Checkpoint
                    </span>
                  )}
                </div>

                {/* Status Badges */}
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      isCompleted
                        ? "bg-emerald-950/40 text-emerald-400 border border-emerald-700/50"
                        : isInProgress
                        ? "bg-sky-950/40 text-[#38BDF8] border border-sky-700/50"
                        : "bg-[#17243B] text-[#CBD5E1] border border-[#334155]"
                    }`}
                  >
                    {isCompleted ? "Completed" : isInProgress ? "In Progress" : "To Do"}
                  </span>
                </div>
              </div>

              {/* Task Body */}
              <div className="mt-3 space-y-3">
                <div>
                  <h3 className="text-sm font-bold text-[#F8FAFC]">{task.title}</h3>
                  {task.description && (
                    <p className="text-xs text-[#CBD5E1] mt-1 leading-relaxed">{task.description}</p>
                  )}
                </div>

                {/* Deterministic Numeric "Why" Box */}
                <div className="rounded-lg bg-[#17243B] border border-[#334155] p-3 flex items-start gap-2.5">
                  <HelpCircle className="w-4 h-4 text-[#38BDF8] shrink-0 mt-0.5" />
                  <div className="text-xs text-[#CBD5E1] leading-relaxed">
                    <span className="font-semibold text-[#F8FAFC] mr-1">Numeric Rationale:</span>
                    {task.numeric_why}
                  </div>
                </div>

                {/* Resource & Deliverables */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs pt-1">
                  {task.resource_title && (
                    <div className="bg-[#17243B] rounded-lg p-2.5 border border-[#334155]">
                      <span className="text-[10px] font-semibold text-slate-400 uppercase block">Curated Learning / Project</span>
                      <a
                        href={task.resource_url}
                        target="_blank"
                        rel="noreferrer"
                        className="font-semibold text-[#38BDF8] hover:text-sky-300 flex items-center gap-1 mt-0.5 group"
                      >
                        <span className="group-hover:underline truncate">{task.resource_title}</span>
                        <ExternalLink className="w-3 h-3 shrink-0" />
                      </a>
                    </div>
                  )}

                  {task.evidence_artifact && (
                    <div className="bg-[#17243B] rounded-lg p-2.5 border border-[#334155]">
                      <span className="text-[10px] font-semibold text-slate-400 uppercase block">Tangible Evidence Deliverable</span>
                      <span className="font-medium text-[#F8FAFC] line-clamp-2 mt-0.5">{task.evidence_artifact}</span>
                    </div>
                  )}
                </div>

                {/* Proof Link & Logged Hours if Completed */}
                {isCompleted && (
                  <div className="pt-2 flex flex-wrap items-center justify-between text-xs border-t border-[#334155]">
                    <div className="text-[#CBD5E1] flex items-center gap-3">
                      <span>Logged: <strong className="text-emerald-400">{task.logged_hours} hrs</strong></span>
                      {task.evidence_link && (
                        <a
                          href={task.evidence_link}
                          target="_blank"
                          rel="noreferrer"
                          className="text-emerald-400 hover:underline flex items-center gap-1 font-medium"
                        >
                          <FileText className="w-3 h-3" />
                          <span>Submitted Evidence</span>
                        </a>
                      )}
                    </div>
                  </div>
                )}

                {/* Action buttons */}
                <div className="pt-2 flex items-center justify-end gap-2">
                  {!isCompleted && (
                    <>
                      {task.status !== "in_progress" && (
                        <button
                          onClick={() => handleUpdateTaskStatus(task.id, "in_progress")}
                          className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-[#17243B] hover:bg-[#1f3150] text-[#CBD5E1] hover:text-white border border-[#334155] transition-colors"
                        >
                          Start Task
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setActiveTaskModal(task);
                          setLoggedHoursInput(String(task.est_hours));
                          setEvidenceLinkInput(task.evidence_link || "");
                        }}
                        className="px-4 py-1.5 rounded-lg text-xs font-bold bg-[#0F766E] hover:bg-[#115E59] text-white shadow-sm flex items-center gap-1.5 transition-colors focus:ring-2 focus:ring-[#38BDF8]"
                      >
                        <CheckSquare className="w-3.5 h-3.5" />
                        <span>Log & Complete</span>
                      </button>
                    </>
                  )}
                  {isCompleted && (
                    <button
                      onClick={() => handleUpdateTaskStatus(task.id, "todo")}
                      className="px-3 py-1 text-[11px] text-slate-400 hover:text-[#F8FAFC] transition-colors"
                    >
                      Re-open Task
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Completion Modal */}
      {activeTaskModal && (
        <div className="fixed inset-0 z-50 bg-[#0B1220]/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111C33] border border-[#334155] rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-[#F8FAFC]">Log Task Completion</h3>
            <p className="text-xs text-[#CBD5E1]">
              Complete <strong>{activeTaskModal.title}</strong> and record your evidence artifact link.
            </p>

            <div>
              <label className="block text-xs font-semibold text-[#CBD5E1] mb-1">Actual Hours Spent</label>
              <input
                type="number"
                step="0.5"
                min="0.5"
                value={loggedHoursInput}
                onChange={(e) => setLoggedHoursInput(e.target.value)}
                className="w-full bg-[#0B1220] border border-[#334155] rounded-lg px-3 py-2 text-xs text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#38BDF8]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#CBD5E1] mb-1">Evidence Artifact URL (GitHub, Repo, or Doc Link)</label>
              <input
                type="url"
                placeholder="https://github.com/username/project-repo"
                value={evidenceLinkInput}
                onChange={(e) => setEvidenceLinkInput(e.target.value)}
                className="w-full bg-[#0B1220] border border-[#334155] rounded-lg px-3 py-2 text-xs text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#38BDF8]"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setActiveTaskModal(null)}
                className="px-4 py-2 bg-[#17243B] hover:bg-[#1f3150] text-[#CBD5E1] border border-[#334155] rounded-lg text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={() => handleUpdateTaskStatus(activeTaskModal.id, "completed", loggedHoursInput, evidenceLinkInput)}
                className="px-5 py-2 bg-[#0F766E] hover:bg-[#115E59] text-white rounded-lg text-xs font-bold shadow-sm focus:ring-2 focus:ring-[#38BDF8]"
              >
                Confirm Completion
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
