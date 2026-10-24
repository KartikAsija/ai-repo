import React, { useState, useEffect } from "react";
import { 
  CheckSquare, 
  RefreshCw, 
  Play, 
  CheckCircle2, 
  Layers, 
  Sliders, 
  Clock, 
  Calendar, 
  ArrowRight,
  TrendingUp,
  FileText,
  AlertCircle
} from "lucide-react";
import { useLearner } from "../context/LearnerContext";
import { api } from "../api/client";
import MetricCard from "../components/common/MetricCard";

export default function DashboardPage({ setCurrentPage }) {
  const { activeLearnerId, activeLearner, roles, refreshAll } = useLearner();
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);

  // Replan states
  const [replanHours, setReplanHours] = useState(10.0);
  const [replanRoleId, setReplanRoleId] = useState("");
  const [isReplanning, setIsReplanning] = useState(false);
  const [replanDiff, setReplanDiff] = useState(null);

  const loadProgress = async () => {
    if (!activeLearnerId) return;
    try {
      setLoading(true);
      const data = await api.getProgress(activeLearnerId);
      setProgress(data);
      if (activeLearner) {
        setReplanHours(activeLearner.available_hours_per_week || 10.0);
        setReplanRoleId(activeLearner.target_role_id || "data_analyst");
      }
    } catch (err) {
      console.error("Failed to load progress:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProgress();
  }, [activeLearnerId]);

  const handleExecuteReplan = async () => {
    if (!activeLearnerId) return;
    try {
      setIsReplanning(true);
      const payload = {
        new_available_hours_per_week: replanHours,
        new_target_role_id: replanRoleId,
        reason: `Replan: Available hours set to ${replanHours}h/wk, target role set to ${replanRoleId}`
      };
      const response = await api.replanLearner(activeLearnerId, payload);
      setReplanDiff(response.diff);
      await loadProgress();
      await refreshAll();
    } catch (err) {
      alert("Replanning failed: " + err.message);
    } finally {
      setIsReplanning(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-3">
        <div className="w-8 h-8 border-3 border-[#22C5E5] border-t-transparent rounded-full animate-spin" />
        <div className="text-xs text-[#94A3B8]">Loading execution logs and adaptive replanning engine...</div>
      </div>
    );
  }

  if (!progress) {
    return (
      <div className="text-center py-16 bg-[#141F32] rounded-2xl border border-[#29384F] p-8 shadow-subtle">
        <AlertCircle className="w-8 h-8 text-[#FBBF24] mx-auto mb-2" />
        <h3 className="text-sm font-bold text-[#F1F5F9]">No Progress Data Found</h3>
        <p className="text-xs text-[#94A3B8] mt-1">Please select an active learner to inspect progress logs.</p>
      </div>
    );
  }

  const completedActivities = progress.stages_progress.reduce((acc, s) => acc + s.completed_tasks, 0);
  const totalActivities = progress.stages_progress.reduce((acc, s) => acc + s.total_tasks, 0);
  const remainingActivities = Math.max(0, totalActivities - completedActivities);

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#29384F] pb-4">
        <div>
          <div className="text-[11px] font-semibold text-[#22C5E5] uppercase tracking-wider">
            Progress Tracking & Adaptive Replanning
          </div>
          <h1 className="text-2xl font-bold text-[#F1F5F9] flex items-center gap-2 mt-0.5">
            <CheckSquare className="w-6 h-6 text-[#22C5E5]" />
            <span>Learner: {progress.alias}</span>
          </h1>
          <p className="text-xs text-[#94A3B8] mt-1">
            Tracking execution against target framework <strong>{progress.target_role_title}</strong>
          </p>
        </div>

        <button
          onClick={() => setCurrentPage("roadmap")}
          className="flex items-center gap-1.5 px-4 py-2 bg-[#22C5E5] hover:bg-[#06B6D4] text-[#0B1220] rounded-xl text-xs font-bold shadow-sm transition-all focus:ring-2 focus:ring-[#22C5E5]"
        >
          <span>View Active Roadmap</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <MetricCard
          title="Framework Readiness"
          value={`${progress.readiness_percentage}%`}
          subtitle="Alignment to target rubric"
          icon={TrendingUp}
          color="emerald"
          badge="Score"
        />
        <MetricCard
          title="Activities Done"
          value={`${completedActivities} / ${totalActivities}`}
          subtitle={`${remainingActivities} remaining tasks`}
          icon={CheckCircle2}
          color="cyan"
          badge={`${progress.overall_progress_percentage}%`}
        />
        <MetricCard
          title="Learning Hours Logged"
          value={`${progress.total_logged_hours}h`}
          subtitle={`of ${progress.total_planned_hours}h planned`}
          icon={Clock}
          color="slate"
          badge="Actual"
        />
        <MetricCard
          title="Timeline Pacing"
          value={`Week ${progress.current_week}`}
          subtitle={`of ${progress.total_weeks} total weeks`}
          icon={Calendar}
          color="amber"
          badge="Schedule"
        />
      </div>

      {/* Next 3 Concrete Actions (Immediate Focus) */}
      <div className="bg-[#141F32] border border-[#29384F] rounded-2xl p-5 sm:p-6 space-y-4 shadow-subtle">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#29384F] pb-3">
          <div>
            <h2 className="text-sm font-bold text-[#F1F5F9] flex items-center gap-2">
              <Play className="w-4 h-4 text-[#22C5E5]" />
              <span>Next 3 Concrete Actions (Immediate Priority)</span>
            </h2>
            <p className="text-xs text-[#94A3B8]">
              Scheduled in strict priority sequence. Every action produces a tangible proof artifact.
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-[#22C5E5] bg-[#1A2940] px-2.5 py-1 rounded-lg border border-[#29384F]">
            Active Schedule: Week {progress.current_week}
          </span>
        </div>

        {progress.next_three_actions.length === 0 ? (
          <div className="py-8 text-center text-xs text-[#94A3B8] bg-[#0B1220] rounded-xl border border-[#29384F]">
            <CheckCircle2 className="w-8 h-8 text-[#34D399] mx-auto mb-2" />
            <span className="font-semibold text-[#F1F5F9]">All scheduled roadmap activities completed!</span>
            <p className="text-[11px] text-[#94A3B8] mt-1">You have satisfied the current framework benchmark.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
            {progress.next_three_actions.map((task, i) => (
              <div 
                key={task.id} 
                className="bg-[#1A2940]/60 border border-[#29384F] hover:border-[#3D506E] rounded-xl p-4 flex flex-col justify-between space-y-3 transition-colors shadow-subtle"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="px-2 py-0.5 rounded font-mono font-bold text-[10px] bg-[#0B1220] text-[#22C5E5] border border-[#29384F]">
                      Action 0{i + 1} • Week {task.week_number}
                    </span>
                    <span className="text-[#94A3B8] font-mono text-[11px]">{task.est_hours} hrs</span>
                  </div>

                  <h3 className="font-bold text-xs text-[#F1F5F9] line-clamp-2">{task.title}</h3>
                  
                  <div className="text-[11px] text-[#94A3B8] line-clamp-2 leading-relaxed">
                    {task.description || task.numeric_why}
                  </div>
                </div>

                <div className="pt-2 border-t border-[#29384F] text-[11px] space-y-1.5">
                  <div className="text-[#94A3B8] truncate">
                    <strong className="text-[#F1F5F9]">Deliverable:</strong> {task.evidence_artifact}
                  </div>
                  <button
                    onClick={() => setCurrentPage("roadmap")}
                    className="w-full mt-2 py-1.5 bg-[#0B1220] hover:bg-[#141F32] text-[#22C5E5] border border-[#29384F] hover:border-[#22C5E5]/40 rounded-lg text-center font-semibold text-xs transition-colors"
                  >
                    Open in Roadmap
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Stage Progression Bars */}
      <div className="bg-[#141F32] border border-[#29384F] rounded-2xl p-5 sm:p-6 space-y-4 shadow-subtle">
        <h2 className="text-sm font-bold text-[#F1F5F9] flex items-center gap-2">
          <Layers className="w-4 h-4 text-[#22C5E5]" />
          <span>Stage Completion Breakdown</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          {progress.stages_progress.map((stg) => (
            <div key={stg.stage} className="bg-[#1A2940]/50 p-3.5 rounded-xl border border-[#29384F] space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[#F1F5F9]">
                  Stage {stg.stage}: {stg.stage_name}
                </span>
                <span className="font-mono text-[#22C5E5] font-bold">{stg.completion_percentage}%</span>
              </div>
              <div className="h-2 w-full bg-[#0B1220] rounded-full overflow-hidden border border-[#29384F]">
                <div
                  className="h-full bg-[#22C5E5] rounded-full transition-all duration-500"
                  style={{ width: `${stg.completion_percentage}%` }}
                />
              </div>
              <div className="flex justify-between text-[11px] text-[#94A3B8]">
                <span>{stg.completed_tasks} completed</span>
                <span>{stg.total_tasks} total tasks</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Dynamic Replan Panel & Diff Viewer */}
      <div className="bg-[#141F32] border border-[#29384F] rounded-2xl p-5 sm:p-6 space-y-5 shadow-subtle">
        <div>
          <h2 className="text-sm font-bold text-[#F1F5F9] flex items-center gap-2">
            <Sliders className="w-4 h-4 text-[#22C5E5]" />
            <span>Adaptive Replanning Engine</span>
          </h2>
          <p className="text-xs text-[#94A3B8] mt-1">
            Simulate changes to study capacity or target roles. Completed work is strictly preserved, uncompleted tasks are repacked, and an audited diff is generated.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-[#0B1220] border border-[#29384F] space-y-2">
            <div className="flex justify-between text-xs mb-1">
              <label className="text-[#94A3B8] font-semibold">Weekly Study Capacity</label>
              <strong className="text-[#22C5E5] font-mono">{replanHours} hrs/week</strong>
            </div>
            <input
              type="range"
              min="1"
              max="40"
              step="1"
              value={replanHours}
              onChange={(e) => setReplanHours(parseFloat(e.target.value))}
              className="w-full h-2 bg-[#1A2940] rounded-lg appearance-none cursor-pointer accent-[#22C5E5]"
            />
            <div className="flex justify-between text-[10px] text-[#94A3B8] font-mono pt-1">
              <span>3h (Part-time)</span>
              <span>6h (Jordan)</span>
              <span>15h (Alex)</span>
              <span>40h (Full-time)</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#0B1220] border border-[#29384F] space-y-2">
            <label className="block text-xs font-semibold text-[#94A3B8]">Target Career Framework</label>
            <select
              value={replanRoleId}
              onChange={(e) => setReplanRoleId(e.target.value)}
              className="w-full bg-[#141F32] border border-[#29384F] rounded-lg px-3 py-2 text-xs text-[#F1F5F9] focus:outline-none focus:ring-1 focus:ring-[#22C5E5] cursor-pointer mt-1"
            >
              {roles.map((r) => (
                <option key={r.role_id} value={r.role_id} className="bg-[#141F32] text-[#F1F5F9]">
                  {r.title}
                </option>
              ))}
            </select>
            <p className="text-[10px] text-[#94A3B8]">
              Switching frameworks recomputes requirement gaps while maintaining earned competencies.
            </p>
          </div>
        </div>

        <div className="flex justify-end pt-1">
          <button
            onClick={handleExecuteReplan}
            disabled={isReplanning}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs bg-[#22C5E5] hover:bg-[#06B6D4] text-[#0B1220] shadow-sm active:scale-95 transition-all focus:ring-2 focus:ring-[#22C5E5]"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isReplanning ? "animate-spin" : ""}`} />
            <span>{isReplanning ? "Executing Replanning Algorithm..." : "Execute Replan & Compute Diff"}</span>
          </button>
        </div>

        {/* Visual Replanning Diff Modal / Card */}
        {replanDiff && (
          <div className="mt-4 p-5 rounded-xl bg-[#1A2940] border border-[#22C5E5]/40 space-y-4 shadow-subtle animate-in fade-in duration-150">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#29384F] pb-3">
              <div>
                <span className="text-[10px] font-bold font-mono uppercase tracking-wider text-[#22C5E5]">
                  Audited Replanning Diff Report
                </span>
                <h3 className="text-sm font-bold text-[#F1F5F9] mt-0.5">{replanDiff.summary}</h3>
              </div>
              <span className={`px-2.5 py-1 rounded text-xs font-bold font-mono ${
                replanDiff.weeks_delta > 0
                  ? "bg-[#FBBF24]/15 text-[#FBBF24] border border-[#FBBF24]/30"
                  : "bg-[#34D399]/15 text-[#34D399] border border-[#34D399]/30"
              }`}>
                Timeline Impact: {replanDiff.weeks_delta > 0 ? `+${replanDiff.weeks_delta} wks` : `${replanDiff.weeks_delta} wks`}
              </span>
            </div>

            {/* Metrics Breakdown */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
              <div className="bg-[#141F32] p-3 rounded-lg border border-[#29384F]">
                <span className="text-[10px] text-[#94A3B8] block">Retained</span>
                <strong className="text-[#34D399] text-base">{replanDiff.tasks_retained}</strong>
              </div>
              <div className="bg-[#141F32] p-3 rounded-lg border border-[#29384F]">
                <span className="text-[10px] text-[#94A3B8] block">Rescheduled</span>
                <strong className="text-[#FBBF24] text-base">{replanDiff.tasks_rescheduled}</strong>
              </div>
              <div className="bg-[#141F32] p-3 rounded-lg border border-[#29384F]">
                <span className="text-[10px] text-[#94A3B8] block">Newly Added</span>
                <strong className="text-[#22C5E5] text-base">{replanDiff.tasks_added}</strong>
              </div>
              <div className="bg-[#141F32] p-3 rounded-lg border border-[#29384F]">
                <span className="text-[10px] text-[#94A3B8] block">De-scoped</span>
                <strong className="text-[#F87171] text-base">{replanDiff.tasks_removed}</strong>
              </div>
            </div>

            {/* Diff Details List */}
            {replanDiff.details.length > 0 && (
              <div className="space-y-2 max-h-56 overflow-y-auto custom-scrollbar pr-1">
                {replanDiff.details.map((item, idx) => {
                  const isRescheduled = item.type === "rescheduled";
                  const isAdded = item.type === "added";

                  return (
                    <div
                      key={idx}
                      className="p-3 rounded-lg bg-[#141F32] border border-[#29384F] flex items-start justify-between text-xs gap-3"
                    >
                      <div className="space-y-0.5">
                        <div className="font-semibold text-[#F1F5F9]">{item.title}</div>
                        <div className="text-[11px] text-[#94A3B8]">{item.reason}</div>
                      </div>
                      <span
                        className={`shrink-0 px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                          isAdded
                            ? "bg-[#22C5E5]/15 text-[#22C5E5] border border-[#22C5E5]/30"
                            : isRescheduled
                            ? "bg-[#FBBF24]/15 text-[#FBBF24] border border-[#FBBF24]/30"
                            : "bg-[#F87171]/15 text-[#F87171] border border-[#F87171]/30"
                        }`}
                      >
                        {isAdded ? "Added" : isRescheduled ? `Week ${item.old_week} → ${item.new_week}` : "Removed"}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
