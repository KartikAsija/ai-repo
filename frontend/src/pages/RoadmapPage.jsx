import React, { useState, useEffect } from "react";
import { 
  Map, 
  ExternalLink, 
  Layers, 
  CheckSquare, 
  AlertCircle, 
  FileText, 
  HelpCircle,
  Clock,
  CheckCircle2,
  Calendar,
  Sparkles,
  ArrowRight
} from "lucide-react";
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
        <div className="w-8 h-8 border-3 border-[#22C5E5] border-t-transparent rounded-full animate-spin" />
        <div className="text-xs text-[#94A3B8]">Loading sequential schedule and weekly capacity allocation...</div>
      </div>
    );
  }

  if (!roadmap) {
    return (
      <div className="text-center py-16 bg-[#141F32] rounded-2xl border border-[#29384F] p-8 shadow-subtle">
        <AlertCircle className="w-8 h-8 text-[#FBBF24] mx-auto mb-2" />
        <h3 className="text-sm font-bold text-[#F1F5F9]">No Active Roadmap</h3>
        <p className="text-xs text-[#94A3B8] mt-1">Generate a schedule based on your profile to proceed.</p>
        <button
          onClick={() => api.createRoadmap(activeLearnerId).then(loadRoadmap)}
          className="mt-4 px-4 py-2 bg-[#22C5E5] hover:bg-[#06B6D4] text-[#0B1220] rounded-lg text-xs font-bold shadow-sm"
        >
          Generate Schedule Now
        </button>
      </div>
    );
  }

  const currentStageGroup = roadmap.stages.find((s) => s.stage === selectedStage) || roadmap.stages[0];

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#29384F] pb-4">
        <div>
          <div className="text-[11px] font-semibold text-[#22C5E5] uppercase tracking-wider">
            Staged Execution Roadmap (v{roadmap.version})
          </div>
          <h1 className="text-2xl font-bold text-[#F1F5F9] flex items-center gap-2 mt-0.5">
            <Map className="w-6 h-6 text-[#22C5E5]" />
            <span>Target Role: {roadmap.role_title}</span>
          </h1>
          <p className="text-xs text-[#94A3B8] mt-1">
            Strict capacity packing: <strong>{activeLearner?.available_hours_per_week} hrs/week</strong> • {roadmap.total_weeks} Total Weeks • {roadmap.total_planned_hours} Planned Hours
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-[11px] text-[#94A3B8] font-medium">Roadmap Progress</div>
            <div className="text-xl font-extrabold text-[#34D399]">{roadmap.completion_percentage}%</div>
          </div>
          <button
            onClick={() => setCurrentPage("dashboard")}
            className="px-4 py-2 bg-[#1A2940] hover:bg-[#1E3250] border border-[#29384F] text-[#F1F5F9] rounded-xl text-xs font-semibold transition-colors focus:ring-1 focus:ring-[#22C5E5]"
          >
            Open Progress & Replan
          </button>
        </div>
      </div>

      {/* Stage Selector Tabs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {roadmap.stages.map((stg) => {
          const isSelected = selectedStage === stg.stage;
          const pct = stg.tasks_count > 0 ? Math.round((stg.completed_count / stg.tasks_count) * 100) : 0;

          return (
            <button
              key={stg.stage}
              onClick={() => setSelectedStage(stg.stage)}
              className={`p-4 rounded-xl border text-left transition-all ${
                isSelected
                  ? "bg-[#141F32] border-[#22C5E5] shadow-glow-accent ring-1 ring-[#22C5E5]"
                  : "bg-[#141F32] border-[#29384F] hover:border-[#3D506E] hover:bg-[#1A2940]/50"
              }`}
            >
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-[#22C5E5] font-mono">Stage 0{stg.stage}</span>
                <span className="text-[#34D399] font-mono text-[11px]">{pct}% Done</span>
              </div>
              <div className="text-xs font-bold text-[#F1F5F9] mt-1 truncate">{stg.stage_name}</div>
              
              {/* Progress line */}
              <div className="mt-2.5 w-full bg-[#0B1220] h-1 rounded-full overflow-hidden border border-[#29384F]/60">
                <div 
                  className="bg-[#22C5E5] h-full rounded-full transition-all" 
                  style={{ width: `${Math.min(100, Math.max(0, pct))}%` }} 
                />
              </div>

              <div className="mt-2 flex items-center justify-between text-[11px] text-[#94A3B8]">
                <span>{stg.tasks_count} tasks</span>
                <span>{stg.total_hours} hrs total</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Stage Detail Header Banner */}
      <div className="bg-[#141F32] border border-[#29384F] rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-subtle">
        <div className="space-y-0.5">
          <h2 className="text-sm font-bold text-[#F1F5F9] flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#22C5E5]" />
            <span>Stage {currentStageGroup.stage}: {currentStageGroup.stage_name}</span>
          </h2>
          <p className="text-xs text-[#94A3B8]">
            Sequential pacing strictly packed into weekly milestones respecting your {activeLearner?.available_hours_per_week}h/week limit.
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono shrink-0">
          <span className="text-[#94A3B8] bg-[#0B1220] px-2.5 py-1 rounded-lg border border-[#29384F]">
            Planned: <strong className="text-[#F1F5F9]">{currentStageGroup.total_hours}h</strong>
          </span>
          <span className="text-[#94A3B8] bg-[#0B1220] px-2.5 py-1 rounded-lg border border-[#29384F]">
            Logged: <strong className="text-[#34D399]">{currentStageGroup.completed_hours}h</strong>
          </span>
        </div>
      </div>

      {/* Task Cards List */}
      <div className="space-y-4">
        {currentStageGroup.tasks.map((task) => {
          const isCompleted = task.status === "completed";
          const isInProgress = task.status === "in_progress";
          const isMilestone = task.title.toLowerCase().includes("milestone") || task.title.toLowerCase().includes("capstone");

          return (
            <div
              key={task.id}
              className={`rounded-2xl border p-5 transition-all shadow-subtle ${
                isCompleted
                  ? "bg-[#141F32]/90 border-[#34D399]/40"
                  : isMilestone
                  ? "bg-[#141F32] border-[#FBBF24]/40"
                  : "bg-[#141F32] border-[#29384F] hover:border-[#3D506E]"
              }`}
            >
              {/* Task Header Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#29384F] pb-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-[#1A2940] text-[#22C5E5] border border-[#29384F]">
                    Week {task.week_number}
                  </span>
                  <span className="px-2.5 py-0.5 rounded text-[11px] font-mono text-[#94A3B8] bg-[#0B1220] border border-[#29384F]">
                    {task.est_hours} hrs
                  </span>
                  {task.linked_req_ids.map((rId) => (
                    <span key={rId} className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#1A2940] text-[#22C5E5] border border-[#29384F]">
                      {rId}
                    </span>
                  ))}
                  {isMilestone && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#FBBF24]/15 text-[#FBBF24] border border-[#FBBF24]/30">
                      Checkpoint Milestone
                    </span>
                  )}
                </div>

                {/* Status Badges */}
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      isCompleted
                        ? "bg-[#34D399]/15 text-[#34D399] border border-[#34D399]/30"
                        : isInProgress
                        ? "bg-[#22C5E5]/15 text-[#22C5E5] border border-[#22C5E5]/30"
                        : "bg-[#1A2940] text-[#94A3B8] border border-[#29384F]"
                    }`}
                  >
                    {isCompleted ? "Completed" : isInProgress ? "In Progress" : "Pending"}
                  </span>
                </div>
              </div>

              {/* Task Body */}
              <div className="mt-3.5 space-y-3">
                <div>
                  <h3 className="text-sm font-bold text-[#F1F5F9]">{task.title}</h3>
                  {task.description && (
                    <p className="text-xs text-[#94A3B8] mt-1 leading-relaxed">{task.description}</p>
                  )}
                </div>

                {/* Numeric Rationale Box */}
                <div className="rounded-xl bg-[#0B1220] border border-[#29384F] p-3 flex items-start gap-2.5">
                  <HelpCircle className="w-4 h-4 text-[#22C5E5] shrink-0 mt-0.5" />
                  <div className="text-xs text-[#94A3B8] leading-relaxed">
                    <span className="font-semibold text-[#F1F5F9] mr-1">Numeric Why:</span>
                    {task.numeric_why}
                  </div>
                </div>

                {/* Resource & Deliverables */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs pt-1">
                  {task.resource_title && (
                    <div className="bg-[#1A2940]/60 rounded-xl p-3 border border-[#29384F]">
                      <span className="text-[10px] font-semibold text-[#94A3B8] uppercase tracking-wider block">
                        Curated Learning Resource
                      </span>
                      <a
                        href={task.resource_url}
                        target="_blank"
                        rel="noreferrer"
                        className="font-semibold text-[#22C5E5] hover:text-[#06B6D4] flex items-center gap-1 mt-1 group"
                      >
                        <span className="group-hover:underline truncate">{task.resource_title}</span>
                        <ExternalLink className="w-3 h-3 shrink-0" />
                      </a>
                    </div>
                  )}

                  {task.evidence_artifact && (
                    <div className="bg-[#1A2940]/60 rounded-xl p-3 border border-[#29384F]">
                      <span className="text-[10px] font-semibold text-[#94A3B8] uppercase tracking-wider block">
                        Target Evidence Deliverable
                      </span>
                      <span className="font-medium text-[#F1F5F9] line-clamp-2 mt-1">{task.evidence_artifact}</span>
                    </div>
                  )}
                </div>

                {/* Proof Link & Logged Hours if Completed */}
                {isCompleted && (
                  <div className="pt-2.5 flex flex-wrap items-center justify-between text-xs border-t border-[#29384F]">
                    <div className="text-[#94A3B8] flex items-center gap-3">
                      <span>Logged: <strong className="text-[#34D399]">{task.logged_hours} hrs</strong></span>
                      {task.evidence_link && (
                        <a
                          href={task.evidence_link}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[#22C5E5] hover:underline flex items-center gap-1 font-medium"
                        >
                          <FileText className="w-3 h-3" />
                          <span>Submitted Artifact</span>
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
                          className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-[#1A2940] hover:bg-[#1E3250] text-[#94A3B8] hover:text-[#F1F5F9] border border-[#29384F] transition-colors"
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
                        className="px-4 py-1.5 rounded-lg text-xs font-bold bg-[#22C5E5] hover:bg-[#06B6D4] text-[#0B1220] shadow-sm flex items-center gap-1.5 transition-all focus:ring-1 focus:ring-[#22C5E5]"
                      >
                        <CheckSquare className="w-3.5 h-3.5" />
                        <span>Log & Complete</span>
                      </button>
                    </>
                  )}
                  {isCompleted && (
                    <button
                      onClick={() => handleUpdateTaskStatus(task.id, "todo")}
                      className="px-3 py-1 text-[11px] text-[#94A3B8] hover:text-[#F1F5F9] transition-colors"
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
        <div className="fixed inset-0 z-50 bg-[#0B1220]/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-[#141F32] border border-[#29384F] rounded-2xl p-6 max-w-md w-full space-y-4 shadow-elevated">
            <div className="flex items-center gap-2 text-[#22C5E5]">
              <CheckCircle2 className="w-5 h-5" />
              <h3 className="text-base font-bold text-[#F1F5F9]">Log Task Completion</h3>
            </div>
            <p className="text-xs text-[#94A3B8]">
              Record time spent and attach an evidence artifact link for <strong className="text-[#F1F5F9]">{activeTaskModal.title}</strong>.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[#F1F5F9] mb-1">Actual Hours Spent</label>
                <input
                  type="number"
                  step="0.5"
                  min="0.5"
                  value={loggedHoursInput}
                  onChange={(e) => setLoggedHoursInput(e.target.value)}
                  className="w-full bg-[#0B1220] border border-[#29384F] focus:border-[#22C5E5] focus:ring-1 focus:ring-[#22C5E5] rounded-lg px-3 py-2 text-xs text-[#F1F5F9] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#F1F5F9] mb-1">Evidence Artifact URL (GitHub, Demo, or Doc Link)</label>
                <input
                  type="url"
                  placeholder="https://github.com/username/project-repo"
                  value={evidenceLinkInput}
                  onChange={(e) => setEvidenceLinkInput(e.target.value)}
                  className="w-full bg-[#0B1220] border border-[#29384F] focus:border-[#22C5E5] focus:ring-1 focus:ring-[#22C5E5] rounded-lg px-3 py-2 text-xs text-[#F1F5F9] focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2.5 pt-2">
              <button
                onClick={() => setActiveTaskModal(null)}
                className="px-4 py-2 bg-[#1A2940] hover:bg-[#1E3250] text-[#94A3B8] hover:text-[#F1F5F9] border border-[#29384F] rounded-lg text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={() => handleUpdateTaskStatus(activeTaskModal.id, "completed", loggedHoursInput, evidenceLinkInput)}
                className="px-5 py-2 bg-[#22C5E5] hover:bg-[#06B6D4] text-[#0B1220] rounded-lg text-xs font-bold shadow-sm"
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
