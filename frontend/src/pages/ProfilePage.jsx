import React, { useState, useEffect, useCallback } from "react";
import { UserCheck, ShieldAlert, Trash2, Save, Plus, X, ExternalLink, Sparkles, CheckCircle2 } from "lucide-react";
import { useLearner } from "../context/LearnerContext";
import { api } from "../api/client";
import CalendarDropdown from "../components/common/CalendarDropdown";
import SkillCompetencyCard from "../components/profile/SkillCompetencyCard";

export default function ProfilePage({ setCurrentPage }) {
  const { activeLearner, activeLearnerId, roles, refreshAll, setActiveLearnerId } = useLearner();

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    alias: "",
    current_role: "",
    education: "",
    target_role_id: "data_analyst",
    preferred_learning_style: "Hands-on Projects",
    available_hours_per_week: 10.0,
    target_completion_date: "2026-09-01",
    interests: [],
    skills: [],
    experiences: []
  });
  const [newInterest, setNewInterest] = useState("");
  const [targetRoleData, setTargetRoleData] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Sync active learner into form
  useEffect(() => {
    if (activeLearner) {
      setFormData({
        alias: activeLearner.alias || "",
        current_role: activeLearner.current_role || "",
        education: activeLearner.education || "",
        target_role_id: activeLearner.target_role_id || "data_analyst",
        preferred_learning_style: activeLearner.preferred_learning_style || "Hands-on Projects",
        available_hours_per_week: activeLearner.available_hours_per_week || 10.0,
        target_completion_date: activeLearner.target_completion_date || "",
        interests: activeLearner.interests || [],
        skills: activeLearner.skills ? [...activeLearner.skills] : [],
        experiences: activeLearner.experiences ? [...activeLearner.experiences] : []
      });
    }
  }, [activeLearner]);

  // Load target role framework to populate skills if needed
  useEffect(() => {
    if (formData.target_role_id) {
      api.getRole(formData.target_role_id)
        .then((role) => {
          setTargetRoleData(role);
          // If skills list is empty, initialize from role requirements
          setFormData((prev) => {
            if (prev.skills.length === 0 && role.requirements) {
              const initSkills = role.requirements.map((req) => ({
                skill_name: req.skill,
                current_level: 1,
                proof_url: ""
              }));
              return { ...prev, skills: initSkills };
            }
            return prev;
          });
        })
        .catch(console.error);
    }
  }, [formData.target_role_id]);

  const handleSkillLevelChange = useCallback((skillName, level) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.map((s) => (s.skill_name === skillName ? { ...s, current_level: level } : s))
    }));
  }, []);

  const handleProofUrlChange = useCallback((skillName, url) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.map((s) => (s.skill_name === skillName ? { ...s, proof_url: url } : s))
    }));
  }, []);

  const handleAddInterest = () => {
    if (newInterest.trim() && !formData.interests.includes(newInterest.trim())) {
      setFormData((prev) => ({
        ...prev,
        interests: [...prev.interests, newInterest.trim()]
      }));
      setNewInterest("");
    }
  };

  const handleRemoveInterest = (item) => {
    setFormData((prev) => ({
      ...prev,
      interests: prev.interests.filter((i) => i !== item)
    }));
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      if (activeLearnerId) {
        await api.updateLearner(activeLearnerId, formData);
      } else {
        const created = await api.createLearner(formData);
        setActiveLearnerId(created.id);
      }
      await refreshAll();
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      alert("Failed to save learner: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!activeLearnerId) return;
    const confirmDelete = window.confirm(
      "Are you sure you want to permanently delete this learner profile and all associated roadmaps, progress, and logs? This action is irreversible."
    );
    if (!confirmDelete) return;

    try {
      await api.deleteLearner(activeLearnerId);
      await refreshAll();
      setCurrentPage("home");
    } catch (err) {
      alert("Failed to delete learner: " + err.message);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#334155] pb-4">
        <div>
          <h1 className="text-2xl font-bold text-[#F8FAFC] flex items-center gap-2">
            <UserCheck className="w-6 h-6 text-[#38BDF8]" />
            <span>Learner Profile & Self-Assessment</span>
          </h1>
          <p className="text-xs text-[#CBD5E1] mt-1">
            Capture role goals, self-rated competency levels, proof artifacts, and weekly time budget
          </p>
        </div>

        <div className="flex items-center gap-3">
          {activeLearnerId && (
            <button
              onClick={handleDelete}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-rose-300 hover:text-white bg-rose-950/40 hover:bg-rose-900/60 border border-rose-900/50 transition-all focus:ring-2 focus:ring-rose-500 focus:outline-none"
              title="Delete all data permanently"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete My Data</span>
            </button>
          )}

          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-[#0F766E] hover:bg-[#115E59] text-white shadow-sm active:scale-95 transition-all focus:ring-2 focus:ring-[#38BDF8] focus:outline-none"
          >
            {saveSuccess ? <CheckCircle2 className="w-4 h-4 text-emerald-300" /> : <Save className="w-4 h-4 text-white" />}
            <span>{isSaving ? "Saving..." : saveSuccess ? "Saved!" : "Save Profile"}</span>
          </button>
        </div>
      </div>

      {/* Steps navigation */}
      <div className="grid grid-cols-4 gap-2 border-b border-[#334155] pb-2">
        {[
          { num: 1, label: "Identity & Role" },
          { num: 2, label: "Schedule & Preferences" },
          { num: 3, label: "Skills Self-Rating" },
          { num: 4, label: "Interests & Experience" }
        ].map((s) => (
          <button
            key={s.num}
            onClick={() => setStep(s.num)}
            className={`py-2 px-3 rounded-lg text-xs font-semibold transition-all text-left ${
              step === s.num
                ? "bg-[#0F766E]/20 text-[#38BDF8] border border-[#38BDF8]/40"
                : "bg-[#111C33] text-[#CBD5E1] border border-[#334155] hover:border-slate-500"
            }`}
          >
            <div className="text-[10px] text-slate-400 uppercase">Step {s.num}</div>
            <div>{s.label}</div>
          </button>
        ))}
      </div>

      {/* Step 1: Identity & Target Role */}
      {step === 1 && (
        <div className="bg-[#111C33] border border-[#334155] rounded-xl p-6 space-y-4">
          <h2 className="text-base font-bold text-[#F8FAFC]">Identity & Career Objectives</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#CBD5E1] mb-1">Learner Name / Alias *</label>
              <input
                type="text"
                value={formData.alias}
                onChange={(e) => setFormData({ ...formData, alias: e.target.value })}
                placeholder="e.g. Jordan Miller"
                className="w-full bg-[#0B1220] border border-[#334155] rounded-lg px-3 py-2 text-xs text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#38BDF8] focus:border-[#38BDF8]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#CBD5E1] mb-1">Current Role / Status</label>
              <input
                type="text"
                value={formData.current_role}
                onChange={(e) => setFormData({ ...formData, current_role: e.target.value })}
                placeholder="e.g. Retail Store Manager or CS Senior"
                className="w-full bg-[#0B1220] border border-[#334155] rounded-lg px-3 py-2 text-xs text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#38BDF8] focus:border-[#38BDF8]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#CBD5E1] mb-1">Educational Background</label>
              <input
                type="text"
                value={formData.education}
                onChange={(e) => setFormData({ ...formData, education: e.target.value })}
                placeholder="e.g. B.A. in Business Administration"
                className="w-full bg-[#0B1220] border border-[#334155] rounded-lg px-3 py-2 text-xs text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#38BDF8] focus:border-[#38BDF8]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#CBD5E1] mb-1">Target Role Framework *</label>
              <select
                value={formData.target_role_id}
                onChange={(e) => setFormData({ ...formData, target_role_id: e.target.value, skills: [] })}
                className="w-full bg-[#0B1220] border border-[#334155] rounded-lg px-3 py-2 text-xs text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#38BDF8] focus:border-[#38BDF8]"
              >
                {roles.map((r) => (
                  <option key={r.role_id} value={r.role_id} className="bg-[#111C33] text-[#F8FAFC]">
                    {r.title} ({r.source.split("(")[0]})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Schedule & Study Preferences */}
      {step === 2 && (
        <div className="bg-[#111C33] border border-[#334155] rounded-xl p-6 space-y-6">
          <h2 className="text-base font-bold text-[#F8FAFC]">Study Commitment & Style</h2>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-[#CBD5E1]">
                Available Weekly Hours: <strong className="text-[#38BDF8] text-sm">{formData.available_hours_per_week} hrs/week</strong>
              </label>
              <span className="text-[11px] text-slate-400">Roadmap will pack tasks strictly within this limit</span>
            </div>
            <input
              type="range"
              min="1"
              max="40"
              step="1"
              value={formData.available_hours_per_week}
              onChange={(e) => setFormData({ ...formData, available_hours_per_week: parseFloat(e.target.value) })}
              className="w-full h-2 bg-[#17243B] rounded-lg appearance-none cursor-pointer accent-[#0F766E]"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1">
              <span>1 hr (Low capacity)</span>
              <span>10 hrs (Standard part-time)</span>
              <span>20 hrs (Intensive)</span>
              <span>40 hrs (Full-time)</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#CBD5E1] mb-1">Preferred Learning Style</label>
              <select
                value={formData.preferred_learning_style}
                onChange={(e) => setFormData({ ...formData, preferred_learning_style: e.target.value })}
                className="w-full bg-[#0B1220] border border-[#334155] rounded-lg px-3 py-2 text-xs text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#38BDF8] focus:border-[#38BDF8]"
              >
                <option value="Hands-on Projects" className="bg-[#111C33] text-[#F8FAFC]">Hands-on Projects & Building</option>
                <option value="Documentation & Books" className="bg-[#111C33] text-[#F8FAFC]">Technical Documentation & Deep Reading</option>
                <option value="Video Tutorials" className="bg-[#111C33] text-[#F8FAFC]">Video Courses & Guided Labs</option>
                <option value="Mixed" className="bg-[#111C33] text-[#F8FAFC]">Mixed Multimodal Approach</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#CBD5E1] mb-1">Target Completion Date</label>
              <CalendarDropdown
                value={formData.target_completion_date}
                onChange={(dateStr) => setFormData({ ...formData, target_completion_date: dateStr })}
                placeholder="Choose target date..."
              />
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Skills Self-Assessment & Proof URLs */}
      {step === 3 && (
        <div className="bg-[#111C33] border border-[#334155] rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-[#F8FAFC]">Skill Competency Ratings (1 to 5)</h2>
              <p className="text-xs text-[#CBD5E1]">
                Self-rate your baseline level. Skills without a valid URL link will be labeled as "unverified".
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {formData.skills.map((skill) => (
              <SkillCompetencyCard
                key={skill.skill_name}
                skill={skill}
                onLevelChange={handleSkillLevelChange}
                onProofChange={handleProofUrlChange}
              />
            ))}
          </div>
        </div>
      )}

      {/* Step 4: Interests & Prior Experiences */}
      {step === 4 && (
        <div className="bg-[#111C33] border border-[#334155] rounded-xl p-6 space-y-6">
          <div>
            <h2 className="text-base font-bold text-[#F8FAFC]">Declared Interests</h2>
            <p className="text-xs text-[#CBD5E1] mb-3">
              Skills matching your interests receive a +15% priority boost during roadmap sequencing
            </p>

            <div className="flex flex-wrap gap-2 mb-3">
              {formData.interests.map((interest) => (
                <span
                  key={interest}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[#17243B] text-[#38BDF8] border border-[#334155]"
                >
                  <span>{interest}</span>
                  <button onClick={() => handleRemoveInterest(interest)} className="hover:text-rose-400">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add interest tag (e.g. Retail Analytics, CI/CD, React)..."
                value={newInterest}
                onChange={(e) => setNewInterest(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAddInterest(); } }}
                className="flex-1 bg-[#0B1220] border border-[#334155] rounded-lg px-3 py-1.5 text-xs text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#38BDF8]"
              />
              <button
                type="button"
                onClick={handleAddInterest}
                className="px-4 py-1.5 bg-[#0F766E] hover:bg-[#115E59] text-white rounded-lg text-xs font-semibold focus:ring-2 focus:ring-[#38BDF8]"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Actions */}
      <div className="flex justify-between items-center pt-4 border-t border-[#334155]">
        <button
          onClick={() => setStep((prev) => Math.max(1, prev - 1))}
          disabled={step === 1}
          className="px-4 py-2 bg-[#17243B] hover:bg-[#1f3150] disabled:opacity-40 text-[#CBD5E1] border border-[#334155] rounded-lg text-xs font-semibold transition-colors"
        >
          Previous Step
        </button>

        {step < 4 ? (
          <button
            onClick={() => setStep((prev) => Math.min(4, prev + 1))}
            className="px-5 py-2 bg-[#0F766E] hover:bg-[#115E59] text-white rounded-lg text-xs font-bold shadow-sm transition-colors focus:ring-2 focus:ring-[#38BDF8]"
          >
            Next Step
          </button>
        ) : (
          <button
            onClick={() => {
              handleSave().then(() => setCurrentPage("comparison"));
            }}
            className="px-5 py-2 bg-[#0F766E] hover:bg-[#115E59] text-white font-bold rounded-lg text-xs shadow-sm transition-colors focus:ring-2 focus:ring-[#38BDF8]"
          >
            Save & View Role Comparison
          </button>
        )}
      </div>
    </div>
  );
}

