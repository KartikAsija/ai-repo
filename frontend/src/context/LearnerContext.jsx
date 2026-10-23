import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { api } from "../api/client";

const LearnerContext = createContext(null);

export function LearnerProvider({ children }) {
  const [learners, setLearners] = useState([]);
  const [activeLearnerId, setActiveLearnerId] = useState(null);
  const [activeLearner, setActiveLearner] = useState(null);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [demoStatus, setDemoStatus] = useState(null);

  // Load roles & learners
  const refreshAll = useCallback(async () => {
    try {
      setLoading(true);
      const [rolesData, learnersData] = await Promise.all([
        api.getRoles(),
        api.getLearners()
      ]);
      setRoles(rolesData);
      setLearners(learnersData);

      // Default to Learner A if none selected
      if (!activeLearnerId && learnersData.length > 0) {
        setActiveLearnerId(learnersData[0].id);
      }
      setError(null);
    } catch (err) {
      console.error("Failed to load initial context data:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [activeLearnerId]);

  useEffect(() => {
    refreshAll();
  }, []);

  // Fetch full details of active learner whenever ID changes
  useEffect(() => {
    if (!activeLearnerId) {
      setActiveLearner(null);
      return;
    }
    let isMounted = true;
    api.getLearner(activeLearnerId)
      .then((data) => {
        if (isMounted) setActiveLearner(data);
      })
      .catch((err) => {
        console.error("Failed to fetch learner details:", err);
      });
    return () => { isMounted = false; };
  }, [activeLearnerId]);

  return (
    <LearnerContext.Provider
      value={{
        learners,
        activeLearnerId,
        setActiveLearnerId,
        activeLearner,
        setActiveLearner,
        roles,
        loading,
        error,
        refreshAll,
        demoStatus,
        setDemoStatus
      }}
    >
      {children}
    </LearnerContext.Provider>
  );
}

export function useLearner() {
  const context = useContext(LearnerContext);
  if (!context) {
    throw new Error("useLearner must be used within a LearnerProvider");
  }
  return context;
}

