import React, { useState } from "react";
import { LearnerProvider, useLearner } from "./context/LearnerContext";
import DisclaimerBanner from "./components/common/DisclaimerBanner";
import Navbar from "./components/common/Navbar";
import HomePage from "./pages/HomePage";
import ProfilePage from "./pages/ProfilePage";
import ComparisonPage from "./pages/ComparisonPage";
import RoadmapPage from "./pages/RoadmapPage";
import DashboardPage from "./pages/DashboardPage";
import TraceabilityPage from "./pages/TraceabilityPage";
import AboutPage from "./pages/AboutPage";
import { api } from "./api/client";
import { Sparkles, CheckCircle2, ArrowRight, X } from "lucide-react";

function AppContent() {
  const [currentPage, setCurrentPage] = useState("home");
  const { setActiveLearnerId, refreshAll } = useLearner();
  const [demoModalOpen, setDemoModalOpen] = useState(false);
  const [demoStep, setDemoStep] = useState(0);
  const [demoRunning, setDemoRunning] = useState(false);
  const [demoLog, setDemoLog] = useState([]);

  const runAutomatedDemo = async () => {
    setDemoModalOpen(true);
    setDemoRunning(true);
    setDemoLog([]);
    setDemoStep(1);

    try {
      // Step 1: Ensure Seed Data exists
      setDemoLog((prev) => [...prev, "Seeding demo learners (Jordan Miller & Alex Chen)..."]);
      await api.seedDemo();
      await refreshAll();
      await new Promise((r) => setTimeout(r, 800));

      // Step 2: Load Learner A (Jordan Miller - Career Changer)
      setDemoStep(2);
      setDemoLog((prev) => [...prev, "Activating Learner A: Jordan Miller (Career Changer, 6 hrs/wk -> Data Analyst)..."]);
      setActiveLearnerId("learner-a-jordan-miller");
      setCurrentPage("comparison");
      await new Promise((r) => setTimeout(r, 1200));

      // Step 3: View Roadmap & Simulate Progress for Jordan
      setDemoStep(3);
      setCurrentPage("roadmap");
      setDemoLog((prev) => [...prev, "Simulating Jordan completing 2 foundation tasks & logging hours..."]);
      const simJordan = await api.simulateDemoStep("a");
      await refreshAll();
      setDemoLog((prev) => [...prev, `Jordan Replanned: Available hours reduced to 3h/wk. Diff: ${simJordan.diff.summary}`]);
      setCurrentPage("dashboard");
      await new Promise((r) => setTimeout(r, 1500));

      // Step 4: Switch to Learner B (Alex Chen - CS Graduate)
      setDemoStep(4);
      setDemoLog((prev) => [...prev, "Activating Learner B: Alex Chen (CS Graduate, 15 hrs/wk -> Junior Full-Stack)..."]);
      setActiveLearnerId("learner-b-alex-chen");
      setCurrentPage("comparison");
      await new Promise((r) => setTimeout(r, 1200));

      // Step 5: Simulate Role Switch for Alex
      setDemoStep(5);
      setCurrentPage("roadmap");
      setDemoLog((prev) => [...prev, "Simulating Alex pivoting target role from Full-Stack to Cloud/DevOps Associate..."]);
      const simAlex = await api.simulateDemoStep("b");
      await refreshAll();
      setDemoLog((prev) => [...prev, `Alex Replanned: Switched target role to Cloud/DevOps. Diff: ${simAlex.diff.summary}`]);
      setCurrentPage("dashboard");
      await new Promise((r) => setTimeout(r, 1200));

      setDemoStep(6);
      setDemoLog((prev) => [...prev, "Demo Walkthrough Completed Successfully! Both roadmaps updated with distinct pacing and content."]);
    } catch (err) {
      console.error("Demo failed:", err);
      setDemoLog((prev) => [...prev, `Error: ${err.message}`]);
    } finally {
      setDemoRunning(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B1220] text-[#F8FAFC] flex flex-col font-sans">
      {/* Persistent Disclaimer Banner (visible across all views) */}
      <DisclaimerBanner />

      {/* Top Navigation */}
      <Navbar
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        onRunDemo={runAutomatedDemo}
      />

      {/* Main Page Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {currentPage === "home" && <HomePage setCurrentPage={setCurrentPage} onRunDemo={runAutomatedDemo} />}
        {currentPage === "profile" && <ProfilePage setCurrentPage={setCurrentPage} />}
        {currentPage === "comparison" && <ComparisonPage setCurrentPage={setCurrentPage} />}
        {currentPage === "roadmap" && <RoadmapPage setCurrentPage={setCurrentPage} />}
        {currentPage === "dashboard" && <DashboardPage setCurrentPage={setCurrentPage} />}
        {currentPage === "traceability" && <TraceabilityPage />}
        {currentPage === "about" && <AboutPage />}
      </main>

      {/* Persistent Footer with Safeguard Notice */}
      <footer className="bg-[#141F32] border-t border-[#29384F] py-6 text-xs text-[#94A3B8] mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div>
            <div className="font-semibold text-[#F1F5F9]">Your AI Career Navigator • Framework Alignment Engine</div>
            <div className="text-[11px] text-[#94A3B8]">
              Deterministic gap scoring & schedule packing • Aligned with SFIA 8 & O*NET standards
            </div>
          </div>
          <div className="text-[11px] text-[#94A3B8] max-w-md">
            Estimates represent framework readiness guidance, not job guarantees. No personal ability ranking.
          </div>
        </div>
      </footer>

      {/* Automated Demo Walkthrough Modal */}
      {demoModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#0B1220]/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-[#141F32] border border-[#29384F] rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-elevated">
            <div className="flex items-center justify-between border-b border-[#29384F] pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#22C5E5]" />
                <h3 className="font-bold text-[#F1F5F9] text-sm">Automated 2-Learner Walkthrough</h3>
              </div>
              <button
                onClick={() => setDemoModalOpen(false)}
                className="text-[#94A3B8] hover:text-[#F1F5F9] p-1 rounded hover:bg-[#1A2940] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-[#94A3B8]">
              Simulating profile comparison, staged roadmaps, logged progress, and replan diffs for both learners:
            </p>

            {/* Stepper Progress */}
            <div className="space-y-2 text-xs">
              {[
                { step: 1, text: "Seed Initial Learner Profiles (Jordan & Alex)" },
                { step: 2, text: "Jordan Miller (Career Changer): Gap Analysis on Data Analyst" },
                { step: 3, text: "Jordan: Simulated Progress + Hours Reduction (6h → 3h) Replan Diff" },
                { step: 4, text: "Alex Chen (CS Grad): Gap Analysis on Junior Full-Stack" },
                { step: 5, text: "Alex: Career Pivot to Cloud/DevOps Associate Replan Diff" },
                { step: 6, text: "Verification Complete: Inspected Distinct Pacing & Content" }
              ].map((item) => (
                <div
                  key={item.step}
                  className={`flex items-center gap-2 p-2 rounded-lg text-xs font-medium transition-all ${
                    demoStep === item.step
                      ? "bg-[#1A2940] text-[#22C5E5] border border-[#22C5E5]/40 shadow-sm"
                      : demoStep > item.step
                      ? "text-[#34D399]"
                      : "text-[#94A3B8]/60"
                  }`}
                >
                  <CheckCircle2
                    className={`w-4 h-4 shrink-0 ${
                      demoStep > item.step
                        ? "text-[#34D399]"
                        : demoStep === item.step
                        ? "text-[#22C5E5] animate-pulse"
                        : "text-[#29384F]"
                    }`}
                  />
                  <span>{item.text}</span>
                </div>
              ))}
            </div>

            {/* Live Log */}
            <div className="bg-[#0B1220] p-3.5 rounded-xl border border-[#29384F] text-[11px] font-mono text-[#F1F5F9] space-y-1 max-h-36 overflow-y-auto custom-scrollbar">
              {demoLog.map((log, idx) => (
                <div key={idx} className="leading-tight">
                  <span className="text-[#34D399] mr-1.5">✓</span>
                  {log}
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setDemoModalOpen(false)}
                disabled={demoRunning}
                className="px-5 py-2 bg-[#22C5E5] hover:bg-[#06B6D4] text-[#0B1220] disabled:opacity-50 rounded-lg text-xs font-bold transition-all shadow-sm"
              >
                {demoRunning ? "Simulating Walkthrough..." : "Close & Explore App"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <LearnerProvider>
      <AppContent />
    </LearnerProvider>
  );
}

