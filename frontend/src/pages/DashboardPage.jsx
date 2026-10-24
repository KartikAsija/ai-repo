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
        <div className="w-8 h-8 border-2 border-[#58A6FF] border-t-transparent rounded-full animate-spin" />
        <div className="text-xs text-[#8B949E]">Loading execution logs and adaptive replanning engine...</div>
      </div>
    );
  }

  if (!progress) {
    return (
      <div className="text-center py-16 bg-[#161B22] rounded-xl border border-[#30363D] p-8 shadow-subtle">
        <AlertCircle className="w-8 h-8 text-[#D29922] mx-auto mb-2" />
        <h3 className="text-sm font-bold text-[#F0F6FC]">No Progress Data Found</h3>
        <p className="text-xs text-[#8B949E] mt-1">Please select an active learner to inspect progress logs.</p>
      </div>
    );
  }

  const completedActivities = progress.stages_progress.reduce((acc, s) => acc + s.completed_tasks, 0);
  const totalActivities = progress.stages_progress.reduce((acc, s) => acc + s.total_tasks, 0);
  const remainingActivities = Math.max(0, totalActivities - completedActivities);

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#30363D] pb-4">
        <div>
          <div className="text-[11px] font-semibold text-[#58A6FF] uppercase tracking-wider">
            Progress Tracking & Adaptive Replanning
          </div>
          <h1 className="text-2xl font-bold text-[#F0F6FC] flex items-center gap-2 mt-0.5">
            <CheckSquare className="w-6 h-6 text-[#58A6FF]" />
            <span>Learner: {progress.alias}</span>
          </h1>
          <p className="text-xs text-[#8B949E] mt-1">
            Tracking execution against target framework <strong>{progress.target_role_title}</strong>
          </p>
        </div>

        <button
          onClick={() => setCurrentPage("roadmap")}
          className="flex items-center gap-1.5 px-4 py-2 bg-[#1F6FEB] hover:bg-[#388BFD] text-white rounded-lg text-xs font-semibold shadow-sm transition-colors focus:ring-1 focus:ring-[#58A6FF]"
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
      <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-5 sm:p-6 space-y-4 shadow-subtle">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#30363D] pb-3">
          <div>
            <h2 className="text-sm font-bold text-[#F0F6FC] flex items-center gap-2">
              <Play className="w-4 h-4 text-[#58A6FF]" />
              <span>Next 3 Concrete Actions (Immediate Priority)</span>
            </h2>
            <p className="text-xs text-[#8B949E]">
              Scheduled in strict priority sequence. Every action produces a tangible proof artifact.
            </p>
          </div>
          <span className="text-xs font-mono font-semibold text-[#58A6FF] bg-[#21262D] px-2.5 py-1 rounded-md border border-[#30363D]">
            Active Schedule: Week {progress.current_week}
          </span>
        </div>

        {progress.next_three_actions.length === 0 ? (
          <div className="py-8 text-center text-xs text-[#8B949E] bg-[#0D1117] rounded-xl border border-[#30363D]">
            <CheckCircle2 className="w-8 h-8 text-[#3FB950] mx-auto mb-2" />
            <span className="font-semibold text-[#F0F6FC]">All scheduled roadmap activities completed!</span>
            <p className="text-[11px] text-[#8B949E] mt-1">You have satisfied the current framework benchmark.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
            {progress.next_three_actions.map((task, i) => (
              <div 
                key={task.id} 
                className="bg-[#21262D]/60 border border-[#30363D] hover:border-[#8B949E]/40 rounded-xl p-4 flex flex-col justify-between space-y-3 transition-colors shadow-subtle"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="px-2 py-0.5 rounded font-mono font-semibold text-[10px] bg-[#0D1117] text-[#58A6FF] border border-[#30363D]">
                      Action 0{i + 1} • Week {task.week_number}
                    </span>
                    <span className="text-[#8B949E] font-mono text-[11px]">{task.est_hours} hrs</span>
                  </div>

                  <h3 className="font-semibold text-xs text-[#F0F6FC] line-clamp-2">{task.title}</h3>
                  
                  <div className="text-[11px] text-[#8B949E] line-clamp-2 leading-relaxed">
                    {task.description || task.numeric_why}
                  </div>
                </div>

                <div className="pt-2 border-t border-[#30363D] text-[11px] space-y-1.5">
                  <div className="text-[#8B949E] truncate">
                    <strong className="text-[#F0F6FC]">Deliverable:</strong> {task.evidence_artifact}
                  </div>
                  <button
                    onClick={() => setCurrentPage("roadmap")}
                    className="w-full mt-2 py-1.5 bg-[#0D1117] hover:bg-[#161B22] text-[#58A6FF] border border-[#30363D] hover:border-[#58A6FF]/40 rounded-lg text-center font-medium text-xs transition-colors"
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
      <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-5 sm:p-6 space-y-4 shadow-subtle">
        <h2 className="text-sm font-bold text-[#F0F6FC] flex items-center gap-2">
          <Layers className="w-4 h-4 text-[#58A6FF]" />
          <span>Stage Completion Breakdown</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          {progress.stages_progress.map((stg) => (
            <div key={stg.stage} className="bg-[#21262D]/50 p-3.5 rounded-xl border border-[#30363D] space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[#F0F6FC]">
                  Stage {stg.stage}: {stg.stage_name}
                </span>
                <span className="font-mono text-[#58A6FF] font-semibold">{stg.completion_percentage}%</span>
              </div>
              <div className="h-2 w-full bg-[#0D1117] rounded-full overflow-hidden border border-[#30363D]">
                <div
                  className="h-full bg-[#58A6FF] rounded-full transition-all duration-300"
                  style={{ width: `${stg.completion_percentage}%` }}
                />
              </div>
              <div className="flex justify-between text-[11px] text-[#8B949E]">
                <span>{stg.completed_tasks} completed</span>
                <span>{stg.total_tasks} total tasks</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Dynamic Replan Panel & Diff Viewer */}
      <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-5 sm:p-6 space-y-5 shadow-subtle">
        <div>
          <h2 className="text-sm font-bold text-[#F0F6FC] flex items-center gap-2">
            <Sliders className="w-4 h-4 text-[#58A6FF]" />
            <span>Adaptive Replanning Engine</span>
          </h2>
          <p className="text-xs text-[#8B949E] mt-1">
            Simulate changes to study capacity or target roles. Completed work is strictly preserved, uncompleted tasks are repacked, and an audited diff is generated.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-[#0D1117] border border-[#30363D] space-y-2">
            <div className="flex justify-between text-xs mb-1">
              <label className="text-[#8B949E] font-medium">Weekly Study Capacity</label>
              <strong className="text-[#58A6FF] font-mono">{replanHours} hrs/week</strong>
            </div>
            <input
              type="range"
              min="1"
              max="40"
              step="1"
              value={replanHours}
              onChange={(e) => setReplanHours(parseFloat(e.target.value))}
              className="w-full h-2 bg-[#21262D] rounded-lg appearance-none cursor-pointer accent-[#58A6FF]"
            />
            <div className="flex justify-between text-[10px] text-[#8B949E] font-mono pt-1">
              <span>3h (Part-time)</span>
              <span>6h (Jordan)</span>
              <span>15h (Alex)</span>
              <span>40h (Full-time)</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#0D1117] border border-[#30363D] space-y-2">
            <label className="block text-xs font-medium text-[#8B949E]">Target Career Framework</label>
            <select
              value={replanRoleId}
              onChange={(e) => setReplanRoleId(e.target.value)}
              className="w-full bg-[#161B22] border border-[#30363D] rounded-lg px-3 py-2 text-xs text-[#F0F6FC] focus:outline-none focus:ring-1 focus:ring-[#58A6FF] cursor-pointer mt-1"
            >
              {roles.map((r) => (
                <option key={r.role_id} value={r.role_id} className="bg-[#161B22] text-[#F0F6FC]">
                  {r.title}
                </option>
              ))}
            </select>
            <p className="text-[10px] text-[#8B949E]">
              Switching frameworks recomputes requirement gaps while maintaining earned competencies.
            </p>
          </div>
        </div>

        <div className="flex justify-end pt-1">
          <button
            onClick={handleExecuteReplan}
            disabled={isReplanning}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-xs bg-[#1F6FEB] hover:bg-[#388BFD] text-white shadow-sm transition-colors focus:ring-1 focus:ring-[#58A6FF]"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isReplanning ? "animate-spin" : ""}`} />
            <span>{isReplanning ? "Executing Replanning Algorithm..." : "Execute Replan & Compute Diff"}</span>
          </button>
        </div>

        {/* Visual Replanning Diff Modal / Card */}
        {replanDiff && (
          <div className="mt-4 p-5 rounded-xl bg-[#21262D] border border-[#58A6FF]/40 space-y-4 shadow-subtle animate-in fade-in duration-150">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#30363D] pb-3">
              <div>
                <span className="text-[10px] font-semibold font-mono uppercase tracking-wider text-[#58A6FF]">
                  Audited Replanning Diff Report
                </span>
                <h3 className="text-sm font-bold text-[#F0F6FC] mt-0.5">{replanDiff.summary}</h3>
              </div>
              <span className={`px-2.5 py-1 rounded text-xs font-semibold font-mono ${
                replanDiff.weeks_delta > 0
                  ? "bg-[#D29922]/15 text-[#D29922] border border-[#D29922]/30"
                  : "bg-[#3FB950]/15 text-[#3FB950] border border-[#3FB950]/30"
              }`}>
                Timeline Impact: {replanDiff.weeks_delta > 0 ? `+${replanDiff.weeks_delta} wks` : `${replanDiff.weeks_delta} wks`}
              </span>
            </div>

            {/* Metrics Breakdown */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
              <div className="bg-[#161B22] p-3 rounded-lg border border-[#30363D]">
                <span className="text-[10px] text-[#8B949E] block">Retained</span>
                <strong className="text-[#3FB950] text-base">{replanDiff.tasks_retained}</strong>
              </div>
              <div className="bg-[#161B22] p-3 rounded-lg border border-[#30363D]">
                <span className="text-[10px] text-[#8B949E] block">Rescheduled</span>
                <strong className="text-[#D29922] text-base">{replanDiff.tasks_rescheduled}</strong>
              </div>
              <div className="bg-[#161B22] p-3 rounded-lg border border-[#30363D]">
                <span className="text-[10px] text-[#8B949E] block">Newly Added</span>
                <strong className="text-[#58A6FF] text-base">{replanDiff.tasks_added}</strong>
              </div>
              <div className="bg-[#161B22] p-3 rounded-lg border border-[#30363D]">
                <span className="text-[10px] text-[#8B949E] block">De-scoped</span>
                <strong className="text-[#F85149] text-base">{replanDiff.tasks_removed}</strong>
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
                      className="p-3 rounded-lg bg-[#161B22] border border-[#30363D] flex items-start justify-between text-xs gap-3"
                    >
                      <div className="space-y-0.5">
                        <div className="font-semibold text-[#F0F6FC]">{item.title}</div>
                        <div className="text-[11px] text-[#8B949E]">{item.reason}</div>
                      </div>
                      <span
                        className={`shrink-0 px-2 py-0.5 rounded text-[10px] font-semibold font-mono ${
                          isAdded
                            ? "bg-[#58A6FF]/15 text-[#58A6FF] border border-[#58A6FF]/30"
                            : isRescheduled
                            ? "bg-[#D29922]/15 text-[#D29922] border border-[#D29922]/30"
                            : "bg-[#F85149]/15 text-[#F85149] border border-[#F85149]/30"
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
