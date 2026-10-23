import React, { useState, useEffect } from "react";
import { CheckSquare, RefreshCw, Play, CheckCircle2, Layers, Sliders } from "lucide-react";
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
        <div className="w-8 h-8 border-4 border-[#38BDF8] border-t-transparent rounded-full animate-spin" />
        <div className="text-xs text-[#CBD5E1]">Loading progress indicators and replanning engine...</div>
      </div>
    );
  }

  if (!progress) {
    return null;
  }

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#334155] pb-4">
        <div>
          <div className="text-xs font-semibold text-[#38BDF8] uppercase tracking-wider">Progress Tracking & Dynamic Replanning</div>
          <h1 className="text-2xl font-bold text-[#F8FAFC] flex items-center gap-2 mt-0.5">
            <CheckSquare className="w-6 h-6 text-[#38BDF8]" />
            <span>Learner: {progress.alias}</span>
          </h1>
          <p className="text-xs text-[#CBD5E1] mt-1">
            Tracking execution against target framework <strong>{progress.target_role_title}</strong>
          </p>
        </div>

        <button
          onClick={() => setCurrentPage("roadmap")}
          className="px-4 py-2 bg-[#0F766E] hover:bg-[#115E59] text-white rounded-xl text-xs font-semibold shadow-sm focus:ring-2 focus:ring-[#38BDF8]"
        >
          View Active Roadmap
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <MetricCard
          title="Framework Readiness"
          value={`${progress.readiness_percentage}%`}
          subtitle="Rubric Level Alignment"
          color="emerald"
        />
        <MetricCard
          title="Roadmap Tasks"
          value={`${progress.overall_progress_percentage}%`}
          subtitle="Completed Tasks"
          color="teal"
        />
        <MetricCard
          title="Hours Logged"
          value={`${progress.total_logged_hours}h`}
          subtitle={`of ${progress.total_planned_hours}h planned`}
          color="cyan"
        />
        <MetricCard
          title="Timeline Schedule"
          value={`Week ${progress.current_week}`}
          subtitle={`of ${progress.total_weeks} total weeks`}
          color="amber"
        />
      </div>

      {/* Next 3 Immediate Actions */}
      <div className="bg-[#111C33] border border-[#334155] rounded-xl p-5 space-y-3 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-[#F8FAFC] flex items-center gap-2">
              <Play className="w-4 h-4 text-emerald-400 fill-emerald-400/20" />
              <span>Next 3 Concrete Actions (Immediate Focus)</span>
            </h2>
            <p className="text-xs text-[#CBD5E1]">
              Scheduled in priority order. Every recommendation cites a requirement and concrete deliverable.
            </p>
          </div>
          <span className="text-[11px] font-semibold text-[#CBD5E1]">Active Week: {progress.current_week}</span>
        </div>

        {progress.next_three_actions.length === 0 ? (
          <div className="py-6 text-center text-xs text-[#CBD5E1]">
            <CheckCircle2 className="w-6 h-6 text-emerald-400 mx-auto mb-1" />
            <span>All scheduled tasks completed! Great work achieving framework readiness.</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
            {progress.next_three_actions.map((task, i) => (
              <div key={task.id} className="bg-[#17243B] border border-[#334155] rounded-xl p-4 flex flex-col justify-between space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="px-2 py-0.5 rounded font-bold bg-[#111C33] text-[#38BDF8] border border-[#334155]">
                      Step {i + 1} • Week {task.week_number}
                    </span>
                    <span className="text-[#CBD5E1] font-mono">{task.est_hours} hrs</span>
                  </div>

                  <h3 className="font-bold text-xs text-[#F8FAFC] line-clamp-2">{task.title}</h3>
                  
                  <div className="text-[11px] text-[#CBD5E1] line-clamp-2 leading-relaxed">
                    {task.description || task.numeric_why}
                  </div>
                </div>

                <div className="pt-2 border-t border-[#334155] text-[11px] space-y-1">
                  <div className="text-[#CBD5E1] truncate">
                    <strong className="text-[#F8FAFC]">Deliverable:</strong> {task.evidence_artifact}
                  </div>
                  <button
                    onClick={() => setCurrentPage("roadmap")}
                    className="w-full mt-2 py-1.5 bg-[#111C33] hover:bg-[#0B1220] text-[#38BDF8] border border-[#334155] rounded-lg text-center font-semibold text-xs transition-colors"
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
      <div className="bg-[#111C33] border border-[#334155] rounded-xl p-5 space-y-3 shadow-sm">
        <h2 className="text-sm font-bold text-[#F8FAFC] flex items-center gap-2">
          <Layers className="w-4 h-4 text-[#38BDF8]" />
          <span>Stage Completion Breakdown</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          {progress.stages_progress.map((stg) => (
            <div key={stg.stage} className="bg-[#17243B] p-3 rounded-lg border border-[#334155] space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[#F8FAFC]">
                  Stage {stg.stage}: {stg.stage_name}
                </span>
                <span className="font-mono text-[#38BDF8] font-bold">{stg.completion_percentage}%</span>
              </div>
              <div className="h-2 w-full bg-[#0B1220] rounded-full overflow-hidden border border-[#334155]/60">
                <div
                  className="h-full bg-[#0F766E] rounded-full transition-all"
                  style={{ width: `${stg.completion_percentage}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-[#CBD5E1]">
                <span>{stg.completed_tasks} completed</span>
                <span>{stg.total_tasks} total tasks</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Dynamic Replan Panel & Diff Viewer */}
      <div className="bg-[#111C33] border border-[#334155] rounded-xl p-5 space-y-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-[#F8FAFC] flex items-center gap-2">
              <Sliders className="w-4 h-4 text-[#38BDF8]" />
              <span>Adaptive Replanning Engine</span>
            </h2>
            <p className="text-xs text-[#CBD5E1]">
              Modify study capacity or switch target role: completed work is preserved, remaining tasks adapt, and a transparent diff is generated.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <div className="flex justify-between text-xs mb-1">
              <label className="text-[#CBD5E1] font-semibold">Weekly Available Hours</label>
              <strong className="text-[#38BDF8] font-mono">{replanHours} hrs/week</strong>
            </div>
            <input
              type="range"
              min="1"
              max="40"
              step="1"
              value={replanHours}
              onChange={(e) => setReplanHours(parseFloat(e.target.value))}
              className="w-full h-2 bg-[#17243B] rounded-lg appearance-none cursor-pointer accent-[#0F766E]"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1">
              <span>Low (3h/wk)</span>
              <span>Jordan Demo (3h)</span>
              <span>Alex Demo (15h)</span>
              <span>40h</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#CBD5E1] mb-1">Target Role Framework</label>
            <select
              value={replanRoleId}
              onChange={(e) => setReplanRoleId(e.target.value)}
              className="w-full bg-[#0B1220] border border-[#334155] rounded-lg px-3 py-2 text-xs text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#38BDF8]"
            >
              {roles.map((r) => (
                <option key={r.role_id} value={r.role_id} className="bg-[#111C33] text-[#F8FAFC]">
                  {r.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex justify-end pt-1">
          <button
            onClick={handleExecuteReplan}
            disabled={isReplanning}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs bg-[#0F766E] hover:bg-[#115E59] text-white shadow-sm active:scale-95 transition-all focus:ring-2 focus:ring-[#38BDF8]"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isReplanning ? "animate-spin" : ""}`} />
            <span>{isReplanning ? "Computing Replan..." : "Execute Replan & Compute Diff"}</span>
          </button>
        </div>

        {/* Visual Replanning Diff Modal / Card */}
        {replanDiff && (
          <div className="mt-4 p-5 rounded-xl bg-[#17243B] border border-[#38BDF8]/40 space-y-4">
            <div className="flex items-center justify-between border-b border-[#334155] pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#38BDF8]">
                  Audited Replanning Diff Report
                </span>
                <h3 className="text-sm font-bold text-[#F8FAFC] mt-0.5">{replanDiff.summary}</h3>
              </div>
              <span className={`px-2.5 py-1 rounded text-xs font-bold ${
                replanDiff.weeks_delta > 0
                  ? "bg-amber-950/40 text-amber-300 border border-amber-700/50"
                  : "bg-emerald-950/40 text-emerald-300 border border-emerald-700/50"
              }`}>
                Timeline: {replanDiff.weeks_delta > 0 ? `+${replanDiff.weeks_delta} wks` : `${replanDiff.weeks_delta} wks`}
              </span>
            </div>

            {/* Metrics Breakdown */}
            <div className="grid grid-cols-4 gap-2 text-center text-xs">
              <div className="bg-[#111C33] p-2.5 rounded-lg border border-[#334155]">
                <span className="text-[10px] text-[#CBD5E1] block">Retained</span>
                <strong className="text-emerald-400 text-base">{replanDiff.tasks_retained}</strong>
              </div>
              <div className="bg-[#111C33] p-2.5 rounded-lg border border-[#334155]">
                <span className="text-[10px] text-[#CBD5E1] block">Rescheduled</span>
                <strong className="text-amber-400 text-base">{replanDiff.tasks_rescheduled}</strong>
              </div>
              <div className="bg-[#111C33] p-2.5 rounded-lg border border-[#334155]">
                <span className="text-[10px] text-[#CBD5E1] block">Added</span>
                <strong className="text-[#38BDF8] text-base">{replanDiff.tasks_added}</strong>
              </div>
              <div className="bg-[#111C33] p-2.5 rounded-lg border border-[#334155]">
                <span className="text-[10px] text-[#CBD5E1] block">Removed</span>
                <strong className="text-rose-400 text-base">{replanDiff.tasks_removed}</strong>
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
                      className="p-2.5 rounded-lg bg-[#111C33] border border-[#334155] flex items-start justify-between text-xs gap-3"
                    >
                      <div className="space-y-0.5">
                        <div className="font-semibold text-[#F8FAFC]">{item.title}</div>
                        <div className="text-[11px] text-[#CBD5E1]">{item.reason}</div>
                      </div>
                      <span
                        className={`shrink-0 px-2 py-0.5 rounded text-[10px] font-bold ${
                          isAdded
                            ? "bg-sky-950/40 text-[#38BDF8] border border-sky-700/50"
                            : isRescheduled
                            ? "bg-amber-950/40 text-amber-300 border border-amber-700/50"
                            : "bg-rose-950/40 text-rose-300 border border-rose-700/50"
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
