import Alerts from "../components/dashboard/Alerts";
import MedicalScan from "../components/dashboard/MedicalScan";
import RecentActivity from "../components/dashboard/RecentActivity";
import WellnessHistory from "../components/dashboard/WellnessHistory";
import Recommendations from "../components/dashboard/Recommendations";
import DashboardSidebar from "../components/dashboard/DashboardSidebar";
import DashboardHeader from "../components/dashboard/DashboardHeader";
import WellnessOverview from "../components/dashboard/WellnessOverview";
import WellnessMetrics from "../components/dashboard/WellnessMetrics";
import WellnessInsights from "../components/dashboard/WellnessInsights";
import WearableStatus from "../components/dashboard/WearableStatus";
import MoodCheckIn from "../components/dashboard/MoodCheckIn";
import LiveSignals from "../components/dashboard/LiveSignals";
import React, { useState, useEffect, useMemo } from "react";
import useDashboardData from "../hooks/useDashboardData";
import { useNavigate } from "react-router-dom";
import { clearTokens } from "../services/auth";
import {
  accent,
  navItems,
  initialRecommendations,
  initialAlerts,
  activityLog,
  toNumber,
  calculateOverallWellness,
  getScoreLabel,
} from "../utils/dashboardUtils";

const displayFont = {
  fontFamily: "'Space Grotesk', sans-serif",
};

const monoFont = {
  fontFamily: "'IBM Plex Mono', monospace",
};

import {
  IconMark,
  IconMenu,
  IconClose,
  IconGrid,
  IconPulseLine,
  IconTrend,
  IconScan,
  IconCamera,
  IconWatch,
  IconLogout,
  IconBell,
  IconUpload,
  IconX,
  IconAlert,
  IconCheck,
  IconArrowRight,
  IconFile,
} from "../components/dashboard/DashboardIcons";
function Dashboard() {
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [cameraActive, setCameraActive] = useState(true);
  const [wearableConnected, setWearableConnected] = useState(true);
  const [recommendations, setRecommendations] = useState(
    initialRecommendations
  );
  const [alerts, setAlerts] = useState(initialAlerts);
  const [scanFile, setScanFile] = useState(null);
  const [mood, setMood] = useState(null);
  const {
    user,
    latestAssessment,
    completedAssessments,
    loading,
    assessmentLoading,
    assessmentError,
    interpretation,
    interpretationLoading,
    interpretationError,
  } = useDashboardData();

  const handleLogout = () => {
    clearTokens();
    setSidebarOpen(false);
    navigate("/login", { replace: true });
  };

  const handleStartAssessment = () => {
    navigate("/assessment");
  };

  const greeting = useMemo(() => {
    const hour = new Date().getHours();

    if (hour < 12) {
      return "Good morning";
    }

    if (hour < 18) {
      return "Good afternoon";
    }

    return "Good evening";
  }, []);

  const wellnessScore =
    interpretation?.overall_score ?? calculateOverallWellness(latestAssessment);

  const interpretationByDimension = new Map(
    (interpretation?.dimensions || []).map((dimension) => [
      dimension.dimension,
      dimension,
    ])
  );

  const metrics = latestAssessment
    ? [
        {
          label: "Stress balance",
          dimension: "stress_score",
          value: toNumber(latestAssessment.stress_score),
          unit:
            interpretationByDimension.get("stress_score")?.status ||
            getScoreLabel(toNumber(latestAssessment.stress_score)),
          accent: "emerald",
          icon: IconPulseLine,
        },
        {
          label: "Energy & recovery",
          dimension: "fatigue_score",
          value: toNumber(latestAssessment.fatigue_score),
          unit:
            interpretationByDimension.get("fatigue_score")?.status ||
            getScoreLabel(toNumber(latestAssessment.fatigue_score)),
          accent: "violet",
          icon: IconTrend,
        },
        {
          label: "Cognitive fitness",
          dimension: "cognitive_fitness_score",
          value: toNumber(latestAssessment.cognitive_fitness_score),
          unit:
            interpretationByDimension.get("cognitive_fitness_score")?.status ||
            getScoreLabel(
              toNumber(latestAssessment.cognitive_fitness_score)
            ),
          accent: "amber",
          icon: IconGrid,
        },
        {
          label: "Mental fitness",
          dimension: "mental_fitness_score",
          value: toNumber(latestAssessment.mental_fitness_score),
          unit:
            interpretationByDimension.get("mental_fitness_score")?.status ||
            getScoreLabel(
              toNumber(latestAssessment.mental_fitness_score)
            ),
          accent: "rose",
          icon: IconPulseLine,
        },
      ]
    : [];

  const gaugeScore = wellnessScore ?? 0;

  const gaugeAngle = 180 - (gaugeScore / 100) * 180;
  const angleInRadians = (gaugeAngle * Math.PI) / 180;

  const needleX = 100 + 80 * Math.cos(angleInRadians);
  const needleY = 100 - 80 * Math.sin(angleInRadians);

  const historyScores = completedAssessments
    .map((assessment) => calculateOverallWellness(assessment))
    .filter((score) => score !== null);

  const bestWellnessScore =
    historyScores.length > 0 ? Math.max(...historyScores) : null;

  const dismissRecommendation = (id) => {
    setRecommendations((current) =>
      current.filter((recommendation) => recommendation.id !== id)
    );
  };

  const dismissAlert = (id) => {
    setAlerts((current) => current.filter((alert) => alert.id !== id));
  };

  const handleScanChange = (event) => {
    const file = event.target.files?.[0] ?? null;
    setScanFile(file);
  };

  const userInitial =
    user?.first_name?.charAt(0)?.toUpperCase() ||
    user?.username?.charAt(0)?.toUpperCase() ||
    "U";

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100">
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-slate-700 border-t-emerald-400" />
            <p className="text-sm text-slate-400">
              Loading your NeuroSync dashboard...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-slate-950 text-slate-100"
      style={displayFont}
    >
      <DashboardSidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        navigate={navigate}
        handleLogout={handleLogout}
      />
      <div className="lg:pl-72">
        <DashboardHeader
          greeting={greeting}
          user={user}
          userInitial={userInitial}
          setSidebarOpen={setSidebarOpen}
        />
        <main className="mx-auto max-w-6xl px-6 py-8">
          <div className="grid gap-5 lg:grid-cols-5">
            <WellnessOverview
              latestAssessment={latestAssessment}
              assessmentLoading={assessmentLoading}
              wellnessScore={wellnessScore}
              needleX={needleX}
              needleY={needleY}
              monoFont={monoFont}
              handleStartAssessment={handleStartAssessment}
              IconArrowRight={IconArrowRight}
            />

            <WellnessMetrics
              assessmentLoading={assessmentLoading}
              metrics={metrics}
              accent={accent}
              monoFont={monoFont}
            />


          </div>
          {assessmentError && (
            <div className="mt-5 rounded-2xl border border-rose-400/20 bg-rose-400/5 px-4 py-3 text-sm text-rose-300">
              {assessmentError}
            </div>
          )}

          {latestAssessment && (
          <WellnessInsights
            latestAssessment={latestAssessment}
            interpretationLoading={interpretationLoading}
            interpretationError={interpretationError}
            interpretation={interpretation}
            monoFont={monoFont}
          />
          )}

          <div className="mt-5 grid gap-5 lg:grid-cols-3">
            <LiveSignals
              cameraActive={cameraActive}
              setCameraActive={setCameraActive}
              IconCamera={IconCamera}
            />

            <WearableStatus
              wearableConnected={wearableConnected}
              setWearableConnected={setWearableConnected}
              IconWatch={IconWatch}
            />

            <MoodCheckIn
              mood={mood}
              setMood={setMood}
            />
          </div>

          <div className="mt-5 grid gap-5 lg:grid-cols-2">
            <WellnessHistory
              completedAssessments={completedAssessments}
              bestWellnessScore={bestWellnessScore}
              calculateOverallWellness={calculateOverallWellness}
              monoFont={monoFont}
              IconTrend={IconTrend}
              IconCheck={IconCheck}
            />

            <Recommendations
              recommendations={recommendations}
              dismissRecommendation={dismissRecommendation}
              accent={accent}
              IconPulseLine={IconPulseLine}
              IconX={IconX}
            />
          </div>

          <div className="mt-5 grid gap-5 lg:grid-cols-2">
            <Alerts
              alerts={alerts}
              dismissAlert={dismissAlert}
              IconBell={IconBell}
              IconAlert={IconAlert}
              IconCheck={IconCheck}
              IconX={IconX}
            />

            <MedicalScan
              scanFile={scanFile}
              setScanFile={setScanFile}
              handleScanChange={handleScanChange}
              IconUpload={IconUpload}
              IconFile={IconFile}
              IconX={IconX}
            />
          </div>

          <RecentActivity
            activityLog={activityLog}
            IconTrend={IconTrend}
          />
        </main>
      </div>
    </div>
  );
}

export default Dashboard;
