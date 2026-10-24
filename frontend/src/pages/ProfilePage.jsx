import React, { useState, useEffect, useCallback, useMemo } from "react";
import { 
  UserCheck, 
  Trash2, 
  Save, 
  Plus, 
  X, 
  ExternalLink, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  ChevronRight, 
  ChevronLeft, 
  Briefcase, 
  GraduationCap, 
  Layers, 
  Tag
} from "lucide-react";
import { useLearner } from "../context/LearnerContext";
import { api } from "../api/client";
import CalendarDropdown from "../components/common/CalendarDropdown";
import SkillCompetencyCard from "../components/profile/SkillCompetencyCard";

const STEP_DEFINITIONS = [
  { num: 1, title: "Identity & Role", subtitle: "Basic info & target track" },
  { num: 2, title: "Schedule & Pacing", subtitle: "Time budget & target date" },
  { num: 3, title: "Skills Self-Rating", subtitle: "Competencies & proof links" },
  { num: 4, title: "Experience & Interests", subtitle: "Projects & domain tags" }
];

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

  const [validationErrors, setValidationErrors] = useState({});
  const [newInterest, setNewInterest] = useState("");
  const [targetRoleData, setTargetRoleData] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Experience form modal / inline add
  const [newExp, setNewExp] = useState({ title: "", organization: "", duration: "", description: "" });
  const [showAddExp, setShowAddExp] = useState(false);

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

  const handleAddExperience = () => {
    if (!newExp.title.trim()) return;
    setFormData((prev) => ({
      ...prev,
      experiences: [...prev.experiences, { ...newExp }]
    }));
    setNewExp({ title: "", organization: "", duration: "", description: "" });
    setShowAddExp(false);
  };

  const handleRemoveExperience = (index) => {
    setFormData((prev) => ({
      ...prev,
      experiences: prev.experiences.filter((_, idx) => idx !== index)
    }));
  };

  const validateStep = (stepNumber) => {
    const errors = {};
    if (stepNumber === 1) {
      if (!formData.alias.trim()) {
        errors.alias = "Learner name is required.";
      }
    }
    if (stepNumber === 2) {
      if (!formData.available_hours_per_week || formData.available_hours_per_week < 1) {
        errors.hours = "Please specify weekly study hours.";
      }
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const goToNextStep = () => {
    if (validateStep(step)) {
      setStep((prev) => Math.min(4, prev + 1));
    }
  };

  const goToStep = (sNum) => {
    if (sNum > step && !validateStep(step)) return;
    setStep(sNum);
  };

  const handleSave = async () => {
    if (!validateStep(1)) {
      setStep(1);
      return;
    }
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

  const handleConfirmDelete = async () => {
    if (!activeLearnerId) return;
    try {
      setIsDeleting(true);
      await api.deleteLearner(activeLearnerId);
      await refreshAll();
      setShowDeleteModal(false);
      setCurrentPage("home");
    } catch (err) {
      alert("Failed to delete learner: " + err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const categorizedSkills = useMemo(() => {
    if (!targetRoleData?.requirements) {
      return [{ category: "Core Competencies", skills: formData.skills }];
    }

    const categoryMap = {};
    formData.skills.forEach((skill) => {
      const match = targetRoleData.requirements.find(
        (r) => r.skill.toLowerCase() === skill.skill_name.toLowerCase()
      );
      const cat = match?.category || "Core Requirements";
      if (!categoryMap[cat]) categoryMap[cat] = [];
      categoryMap[cat].push(skill);
    });

    return Object.entries(categoryMap).map(([category, skills]) => ({
      category,
      skills
    }));
  }, [formData.skills, targetRoleData]);

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#30363D] pb-4">
        <div>
          <h1 className="text-xl font-bold text-[#F0F6FC] flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-[#58A6FF]" />
            <span>Learner Profile & Assessment</span>
          </h1>
          <p className="text-xs text-[#8B949E] mt-0.5">
            Manage career goals, baseline competency ratings, proof artifacts, and study capacity.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeLearnerId && (
            <button
              onClick={() => setShowDeleteModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-[#F85149] hover:bg-[#F85149]/10 border border-[#F85149]/30 transition-colors"
              title="Delete learner profile"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Delete Profile</span>
            </button>
          )}

          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-medium bg-[#1F6FEB] hover:bg-[#388BFD] text-white transition-colors"
          >
            {saveSuccess ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-white" />
            ) : (
              <Save className="w-3.5 h-3.5 text-white" />
            )}
            <span>{isSaving ? "Saving..." : saveSuccess ? "Saved" : "Save Profile"}</span>
          </button>
        </div>
      </div>

      {/* Desktop Stepper */}
      <div className="hidden sm:grid grid-cols-4 gap-2">
        {STEP_DEFINITIONS.map((s) => {
          const isCurrent = step === s.num;
          const isDone = step > s.num;

          return (
            <button
              key={s.num}
              onClick={() => goToStep(s.num)}
              className={`p-3 rounded-lg border text-left transition-colors ${
                isCurrent
                  ? "bg-[#21262D] border-[#58A6FF]"
                  : isDone
                  ? "bg-[#161B22] border-[#30363D] text-[#3FB950]"
                  : "bg-[#161B22] border-[#30363D] text-[#8B949E] opacity-70"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className={`text-[10px] font-mono font-medium ${
                  isCurrent ? "text-[#58A6FF]" : isDone ? "text-[#3FB950]" : "text-[#8B949E]"
                }`}>
                  0{s.num}
                </span>
                {isDone && <CheckCircle2 className="w-3.5 h-3.5 text-[#3FB950]" />}
              </div>
              <div className="text-xs font-semibold text-[#F0F6FC] truncate">
                {s.title}
              </div>
              <div className="text-[10px] text-[#8B949E] truncate">{s.subtitle}</div>
            </button>
          );
        })}
      </div>

      {/* Mobile Progress Bar */}
      <div className="sm:hidden bg-[#161B22] border border-[#30363D] rounded-lg p-3 space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-[#F0F6FC]">
            Step {step} of 4: {STEP_DEFINITIONS[step - 1].title}
          </span>
          <span className="text-[11px] text-[#8B949E]">{Math.round((step / 4) * 100)}%</span>
        </div>
        <div className="w-full bg-[#0D1117] h-1.5 rounded-full overflow-hidden border border-[#30363D]">
          <div
            className="bg-[#58A6FF] h-full rounded-full transition-all duration-300"
            style={{ width: `${(step / 4) * 100}%` }}
          />
        </div>
      </div>

      {/* Step 1: Identity & Target Role */}
      {step === 1 && (
        <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-5 sm:p-6 space-y-4">
          <div className="border-b border-[#30363D] pb-3">
            <h2 className="text-sm font-semibold text-[#F0F6FC] flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-[#58A6FF]" />
              <span>Identity & Career Objective</span>
            </h2>
            <p className="text-xs text-[#8B949E] mt-0.5">
              Select your target framework to initialize standard competency benchmarks.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#F0F6FC] mb-1">
                Learner Name / Alias <span className="text-[#F85149]">*</span>
              </label>
              <input
                type="text"
                value={formData.alias}
                onChange={(e) => {
                  setFormData({ ...formData, alias: e.target.value });
                  if (validationErrors.alias) setValidationErrors({ ...validationErrors, alias: null });
                }}
                placeholder="e.g. Jordan Miller"
                className={`w-full bg-[#0D1117] border rounded-lg px-3 py-2 text-xs text-[#F0F6FC] focus:outline-none transition-colors ${
                  validationErrors.alias
                    ? "border-[#F85149]"
                    : "border-[#30363D] focus:border-[#58A6FF]"
                }`}
              />
              {validationErrors.alias && (
                <p className="text-[11px] text-[#F85149] mt-1 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  <span>{validationErrors.alias}</span>
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-[#F0F6FC] mb-1">Current Role / Status</label>
              <input
                type="text"
                value={formData.current_role}
                onChange={(e) => setFormData({ ...formData, current_role: e.target.value })}
                placeholder="e.g. Retail Store Operations Manager or CS Senior"
                className="w-full bg-[#0D1117] border border-[#30363D] focus:border-[#58A6FF] rounded-lg px-3 py-2 text-xs text-[#F0F6FC] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#F0F6FC] mb-1">Educational Background</label>
              <input
                type="text"
                value={formData.education}
                onChange={(e) => setFormData({ ...formData, education: e.target.value })}
                placeholder="e.g. B.A. in Business Administration"
                className="w-full bg-[#0D1117] border border-[#30363D] focus:border-[#58A6FF] rounded-lg px-3 py-2 text-xs text-[#F0F6FC] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#F0F6FC] mb-1">
                Target Role Framework <span className="text-[#F85149]">*</span>
              </label>
              <select
                value={formData.target_role_id}
                onChange={(e) => setFormData({ ...formData, target_role_id: e.target.value, skills: [] })}
                className="w-full bg-[#0D1117] border border-[#30363D] focus:border-[#58A6FF] rounded-lg px-3 py-2 text-xs text-[#F0F6FC] focus:outline-none cursor-pointer"
              >
                {roles.map((r) => (
                  <option key={r.role_id} value={r.role_id} className="bg-[#161B22] text-[#F0F6FC]">
                    {r.title} — {r.source.split("(")[0]}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Schedule & Preferences */}
      {step === 2 && (
        <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-5 sm:p-6 space-y-5">
          <div className="border-b border-[#30363D] pb-3">
            <h2 className="text-sm font-semibold text-[#F0F6FC] flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#58A6FF]" />
              <span>Weekly Pacing & Preferences</span>
            </h2>
            <p className="text-xs text-[#8B949E] mt-0.5">
              The scheduler packs activities so no week exceeds your weekly limit.
            </p>
          </div>

          <div className="p-4 rounded-lg bg-[#0D1117] border border-[#30363D] space-y-2.5">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-xs font-semibold text-[#F0F6FC]">Weekly Study Commitment</label>
                <div className="text-[11px] text-[#8B949E]">Capacity invariant: ∑ Task Hours ≤ Capacity</div>
              </div>
              <div className="text-sm font-bold text-[#F0F6FC] bg-[#21262D] px-2.5 py-1 rounded border border-[#30363D]">
                {formData.available_hours_per_week} hrs/week
              </div>
            </div>

            <input
              type="range"
              min="1"
              max="40"
              step="1"
              value={formData.available_hours_per_week}
              onChange={(e) => setFormData({ ...formData, available_hours_per_week: parseFloat(e.target.value) })}
              className="w-full h-1.5 bg-[#21262D] rounded-lg appearance-none cursor-pointer accent-[#58A6FF]"
            />

            <div className="flex justify-between text-[10px] text-[#8B949E] font-mono">
              <button type="button" onClick={() => setFormData({ ...formData, available_hours_per_week: 3 })} className="hover:text-[#F0F6FC]">
                3 hrs
              </button>
              <button type="button" onClick={() => setFormData({ ...formData, available_hours_per_week: 6 })} className="hover:text-[#F0F6FC]">
                6 hrs (Jordan)
              </button>
              <button type="button" onClick={() => setFormData({ ...formData, available_hours_per_week: 15 })} className="hover:text-[#F0F6FC]">
                15 hrs (Alex)
              </button>
              <button type="button" onClick={() => setFormData({ ...formData, available_hours_per_week: 30 })} className="hover:text-[#F0F6FC]">
                30 hrs
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#F0F6FC] mb-1">Preferred Learning Methodology</label>
              <select
                value={formData.preferred_learning_style}
                onChange={(e) => setFormData({ ...formData, preferred_learning_style: e.target.value })}
                className="w-full bg-[#0D1117] border border-[#30363D] focus:border-[#58A6FF] rounded-lg px-3 py-2 text-xs text-[#F0F6FC] focus:outline-none cursor-pointer"
              >
                <option value="Hands-on Projects" className="bg-[#161B22] text-[#F0F6FC]">Hands-on Projects & Guided Practice</option>
                <option value="Documentation & Books" className="bg-[#161B22] text-[#F0F6FC]">Technical Documentation & Deep Reading</option>
                <option value="Video Tutorials" className="bg-[#161B22] text-[#F0F6FC]">Video Courses & Interactive Labs</option>
                <option value="Mixed" className="bg-[#161B22] text-[#F0F6FC]">Multimodal Approach</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#F0F6FC] mb-1">Target Completion Date</label>
              <CalendarDropdown
                value={formData.target_completion_date}
                onChange={(dateStr) => setFormData({ ...formData, target_completion_date: dateStr })}
                placeholder="Choose target date..."
              />
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Skills Self-Rating */}
      {step === 3 && (
        <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-5 sm:p-6 space-y-5">
          <div className="border-b border-[#30363D] pb-3">
            <h2 className="text-sm font-semibold text-[#F0F6FC] flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#58A6FF]" />
              <span>Skill Competency Self-Ratings</span>
            </h2>
            <p className="text-xs text-[#8B949E] mt-0.5">
              Rate your baseline competency (Level 1 to 5). Backing skills with public links earns verified status.
            </p>
          </div>

          <div className="space-y-5">
            {categorizedSkills.map((group) => (
              <div key={group.category} className="space-y-2.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-[#C9D1D9]">
                    {group.category}
                  </span>
                  <div className="h-[1px] flex-1 bg-[#30363D]" />
                  <span className="text-[10px] text-[#8B949E] font-mono">
                    {group.skills.length} Skills
                  </span>
                </div>

                <div className="space-y-2.5">
                  {group.skills.map((skill) => (
                    <SkillCompetencyCard
                      key={skill.skill_name}
                      skill={skill}
                      onLevelChange={handleSkillLevelChange}
                      onProofChange={handleProofUrlChange}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Step 4: Interests & Experience */}
      {step === 4 && (
        <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-5 sm:p-6 space-y-5">
          {/* Interests tags */}
          <div className="space-y-2.5">
            <div className="border-b border-[#30363D] pb-2.5">
              <h2 className="text-sm font-semibold text-[#F0F6FC] flex items-center gap-2">
                <Tag className="w-4 h-4 text-[#58A6FF]" />
                <span>Declared Career Interests</span>
              </h2>
              <p className="text-xs text-[#8B949E] mt-0.5">
                Tasks matching your interests receive higher sequencing priority.
              </p>
            </div>

            <div className="flex flex-wrap gap-1.5 min-h-[32px]">
              {formData.interests.map((interest) => (
                <span
                  key={interest}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-[#21262D] text-[#C9D1D9] border border-[#30363D]"
                >
                  <span>{interest}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveInterest(interest)}
                    className="hover:text-[#F85149] transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add interest tag (e.g. Retail Analytics, SQL Optimization)..."
                value={newInterest}
                onChange={(e) => setNewInterest(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddInterest();
                  }
                }}
                className="flex-1 bg-[#0D1117] border border-[#30363D] focus:border-[#58A6FF] rounded-lg px-3 py-1.5 text-xs text-[#F0F6FC] focus:outline-none"
              />
              <button
                type="button"
                onClick={handleAddInterest}
                className="px-3.5 py-1.5 bg-[#21262D] hover:bg-[#30363D] text-[#F0F6FC] border border-[#30363D] rounded-lg text-xs font-medium transition-colors"
              >
                Add Tag
              </button>
            </div>
          </div>

          {/* Prior Experience */}
          <div className="space-y-3 pt-3 border-t border-[#30363D]">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-semibold text-[#F0F6FC] flex items-center gap-2">
                  <Briefcase className="w-3.5 h-3.5 text-[#58A6FF]" />
                  <span>Prior Experience & Projects</span>
                </h3>
                <p className="text-[11px] text-[#8B949E]">
                  Background history for transferrable skill evaluation.
                </p>
              </div>

              {!showAddExp && (
                <button
                  type="button"
                  onClick={() => setShowAddExp(true)}
                  className="flex items-center gap-1 px-3 py-1 rounded-md text-xs font-medium bg-[#21262D] hover:bg-[#30363D] text-[#C9D1D9] border border-[#30363D]"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add Experience</span>
                </button>
              )}
            </div>

            <div className="space-y-2">
              {formData.experiences.length === 0 && !showAddExp && (
                <div className="text-xs text-[#8B949E] italic p-3 bg-[#0D1117] rounded-lg border border-[#30363D] text-center">
                  No prior experience records attached. Click "Add Experience" to document previous roles.
                </div>
              )}

              {formData.experiences.map((exp, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-lg bg-[#0D1117] border border-[#30363D] flex items-start justify-between gap-3 text-xs"
                >
                  <div className="space-y-0.5">
                    <div className="font-semibold text-[#F0F6FC]">{exp.title}</div>
                    <div className="text-[#8B949E] text-[11px]">
                      {exp.organization} • <span>{exp.duration}</span>
                    </div>
                    {exp.description && (
                      <p className="text-[#8B949E] text-[11px] leading-relaxed pt-1">{exp.description}</p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveExperience(idx)}
                    className="text-[#8B949E] hover:text-[#F85149] p-1 rounded transition-colors shrink-0"
                    title="Remove experience"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}

              {showAddExp && (
                <div className="p-3.5 rounded-lg bg-[#0D1117] border border-[#30363D] space-y-2.5">
                  <div className="font-medium text-xs text-[#F0F6FC]">Add Experience Record</div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                    <input
                      type="text"
                      placeholder="Title (e.g. Lead Operations)..."
                      value={newExp.title}
                      onChange={(e) => setNewExp({ ...newExp, title: e.target.value })}
                      className="bg-[#161B22] border border-[#30363D] rounded-md px-2.5 py-1.5 text-xs text-[#F0F6FC] focus:outline-none"
                    />
                    <input
                      type="text"
                      placeholder="Organization..."
                      value={newExp.organization}
                      onChange={(e) => setNewExp({ ...newExp, organization: e.target.value })}
                      className="bg-[#161B22] border border-[#30363D] rounded-md px-2.5 py-1.5 text-xs text-[#F0F6FC] focus:outline-none"
                    />
                    <input
                      type="text"
                      placeholder="Duration..."
                      value={newExp.duration}
                      onChange={(e) => setNewExp({ ...newExp, duration: e.target.value })}
                      className="bg-[#161B22] border border-[#30363D] rounded-md px-2.5 py-1.5 text-xs text-[#F0F6FC] focus:outline-none"
                    />
                  </div>
                  <textarea
                    placeholder="Brief description of deliverables or tools..."
                    value={newExp.description}
                    onChange={(e) => setNewExp({ ...newExp, description: e.target.value })}
                    rows={2}
                    className="w-full bg-[#161B22] border border-[#30363D] rounded-md p-2 text-xs text-[#F0F6FC] focus:outline-none"
                  />
                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowAddExp(false)}
                      className="px-3 py-1 rounded text-xs text-[#8B949E] hover:text-[#F0F6FC]"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleAddExperience}
                      className="px-3 py-1 bg-[#1F6FEB] hover:bg-[#388BFD] text-white rounded text-xs font-medium"
                    >
                      Save Entry
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Stepper Navigation Actions */}
      <div className="flex justify-between items-center pt-3 border-t border-[#30363D]">
        <button
          onClick={() => setStep((prev) => Math.max(1, prev - 1))}
          disabled={step === 1}
          className="flex items-center gap-1 px-3.5 py-1.5 bg-[#21262D] hover:bg-[#30363D] disabled:opacity-40 text-[#C9D1D9] border border-[#30363D] rounded-lg text-xs font-medium transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Previous Step</span>
        </button>

        {step < 4 ? (
          <button
            onClick={goToNextStep}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-[#1F6FEB] hover:bg-[#388BFD] text-white rounded-lg text-xs font-medium transition-colors"
          >
            <span>Next Step</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={() => {
              handleSave().then(() => setCurrentPage("comparison"));
            }}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-[#1F6FEB] hover:bg-[#388BFD] text-white font-medium rounded-lg text-xs transition-colors"
          >
            <span>Save & View Role Comparison</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 bg-[#0D1117]/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#161B22] border border-[#30363D] rounded-xl max-w-md w-full p-5 space-y-4 shadow-elevated">
            <div className="flex items-center gap-2.5 text-[#F85149]">
              <AlertTriangle className="w-5 h-5" />
              <h3 className="text-sm font-semibold text-[#F0F6FC]">Delete Learner Profile?</h3>
            </div>

            <p className="text-xs text-[#8B949E] leading-relaxed">
              Are you sure you want to permanently delete <strong className="text-[#F0F6FC]">{formData.alias || "this profile"}</strong> and all associated competency ratings and roadmap logs? This action is permanent.
            </p>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting}
                className="px-3.5 py-1.5 bg-[#21262D] hover:bg-[#30363D] text-[#C9D1D9] border border-[#30363D] rounded-lg text-xs font-medium"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="px-3.5 py-1.5 bg-[#F85149] hover:bg-red-600 text-white rounded-lg text-xs font-medium"
              >
                {isDeleting ? "Deleting..." : "Confirm Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
