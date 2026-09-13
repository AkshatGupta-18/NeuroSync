import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "../services/api";
import { clearTokens } from "../services/auth";

const displayFont = {
  fontFamily: "'Space Grotesk', sans-serif",
};

const monoFont = {
  fontFamily: "'IBM Plex Mono', monospace",
};

function IconMark({ className = "h-5 w-5" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M12 3C7.03 3 3 7.03 3 12s4.03 9 9 9 9-4.03 9-9-4.03-9-9-9Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M8 12c1.4-1.7 2.87-2.55 4.4-2.55 1.53 0 2.73.7 3.6 2.1"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M8.5 15.2c1.2.9 2.37 1.35 3.5 1.35 1.2 0 2.37-.45 3.5-1.35"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconMenu({ className = "h-5 w-5" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M4 7h16M4 12h16M4 17h16"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconClose({ className = "h-5 w-5" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="m6 6 12 12M18 6 6 18"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconGrid({ className = "h-5 w-5" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <rect
        x="4"
        y="4"
        width="6"
        height="6"
        rx="1.2"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <rect
        x="14"
        y="4"
        width="6"
        height="6"
        rx="1.2"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <rect
        x="4"
        y="14"
        width="6"
        height="6"
        rx="1.2"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <rect
        x="14"
        y="14"
        width="6"
        height="6"
        rx="1.2"
        stroke="currentColor"
        strokeWidth="1.7"
      />
    </svg>
  );
}

function IconPulseLine({ className = "h-5 w-5" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M3 12h4l2.2-5 4.1 10 2.2-5H21"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconTrend({ className = "h-5 w-5" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M4 17 9 12l3 3 7-8"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M15 7h4v4"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconScan({ className = "h-5 w-5" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M7 4H5a1 1 0 0 0-1 1v2M17 4h2a1 1 0 0 1 1 1v2M7 20H5a1 1 0 0 1-1-1v-2M17 20h2a1 1 0 0 0 1-1v-2"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M8 12h8"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconSettings({ className = "h-5 w-5" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M12 15.2a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4Z"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <path
        d="M19.4 15a1.8 1.8 0 0 0 .36 1.98l.06.06-1.86 1.86-.06-.06a1.8 1.8 0 0 0-1.98-.36 1.8 1.8 0 0 0-1.1 1.65V21h-2.63v-.09a1.8 1.8 0 0 0-1.1-1.65 1.8 1.8 0 0 0-1.98.36l-.06.06-1.86-1.86.06-.06A1.8 1.8 0 0 0 5.6 15a1.8 1.8 0 0 0-1.65-1.1H3.86v-2.63h.09A1.8 1.8 0 0 0 5.6 10.2a1.8 1.8 0 0 0-.36-1.98l-.06-.06 1.86-1.86.06.06a1.8 1.8 0 0 0 1.98.36 1.8 1.8 0 0 0 1.1-1.65V5h2.63v.09a1.8 1.8 0 0 0 1.1 1.65 1.8 1.8 0 0 0 1.98-.36l.06-.06 1.86 1.86-.06.06A1.8 1.8 0 0 0 19.4 10c.2.66.8 1.1 1.48 1.1h.09v2.63h-.09A1.8 1.8 0 0 0 19.4 15Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconLogout({ className = "h-5 w-5" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M10 5H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h4"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M14 8l4 4-4 4M18 12H9"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconBell({ className = "h-5 w-5" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path
        d="M10 21h4"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconCamera({ className = "h-5 w-5" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M4 8.5A2.5 2.5 0 0 1 6.5 6H9l1.3-2h3.4L15 6h2.5A2.5 2.5 0 0 1 20 8.5v8A2.5 2.5 0 0 1 17.5 19h-11A2.5 2.5 0 0 1 4 16.5v-8Z"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <circle
        cx="12"
        cy="12.5"
        r="3.2"
        stroke="currentColor"
        strokeWidth="1.7"
      />
    </svg>
  );
}

function IconWatch({ className = "h-5 w-5" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <rect
        x="7"
        y="6"
        width="10"
        height="12"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <path
        d="M9 3h6M9 21h6"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <path
        d="M10 12h2l1-2 1 4 1-2"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconUpload({ className = "h-5 w-5" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M12 15V4M8 8l4-4 4 4"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5 14v4a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-4"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconX({ className = "h-4 w-4" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="m6 6 12 12M18 6 6 18"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconAlert({ className = "h-5 w-5" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M12 4 21 19H3L12 4Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path
        d="M12 9v4"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <circle cx="12" cy="16" r="0.8" fill="currentColor" />
    </svg>
  );
}

function IconCheck({ className = "h-5 w-5" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="m5 12 4 4L19 6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconFile({ className = "h-5 w-5" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M7 3h7l4 4v14H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path
        d="M14 3v5h5M9 12h6M9 16h6"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.7"
      />
    </svg>
  );
}

function IconArrowRight({ className = "h-5 w-5" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M5 12h14M13 6l6 6-6 6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const accent = {
  emerald: {
    iconBg: "bg-emerald-400/10",
    iconText: "text-emerald-400",
    bar: "bg-emerald-400",
    badgeBg: "bg-emerald-400/10",
    badgeText: "text-emerald-400",
  },
  violet: {
    iconBg: "bg-violet-400/10",
    iconText: "text-violet-400",
    bar: "bg-violet-400",
    badgeBg: "bg-violet-400/10",
    badgeText: "text-violet-400",
  },
  amber: {
    iconBg: "bg-amber-400/10",
    iconText: "text-amber-400",
    bar: "bg-amber-400",
    badgeBg: "bg-amber-400/10",
    badgeText: "text-amber-400",
  },
  rose: {
    iconBg: "bg-rose-400/10",
    iconText: "text-rose-400",
    bar: "bg-rose-400",
    badgeBg: "bg-rose-400/10",
    badgeText: "text-rose-400",
  },
};

const navItems = [
  {
    label: "Dashboard",
    path: "/dashboard",
    icon: IconGrid,
  },
  {
    label: "Signals",
    path: "/signals",
    icon: IconPulseLine,
  },
  {
    label: "Trends",
    path: "/trends",
    icon: IconTrend,
  },
  {
    label: "Medical scans",
    path: "/scans",
    icon: IconScan,
  },
  {
    label: "Settings",
    path: "/settings",
    icon: IconSettings,
  },
];

const initialRecommendations = [
  {
    id: 1,
    title: "Take a breathing break",
    description:
      "A short breathing exercise can support a calmer mental state.",
    accent: "emerald",
  },
  {
    id: 2,
    title: "Stretch for five minutes",
    description:
      "A short movement break may help support energy and recovery.",
    accent: "violet",
  },
  {
    id: 3,
    title: "Wind down earlier",
    description:
      "Consistent recovery habits can support your overall wellness.",
    accent: "amber",
  },
];

const initialAlerts = [
  {
    id: 1,
    title: "Assessment available",
    description:
      "Complete a fresh wellness check-in to update your current indicators.",
    type: "info",
  },
  {
    id: 2,
    title: "Wellness indicators are personal",
    description:
      "Use changes over time as a self-monitoring signal, not a medical diagnosis.",
    type: "success",
  },
];

const activityLog = [
  {
    id: 1,
    title: "Webcam signal read",
    time: "Today, 10:42 AM",
    icon: IconCamera,
  },
  {
    id: 2,
    title: "Mood check-in completed",
    time: "Today, 9:18 AM",
    icon: IconPulseLine,
  },
  {
    id: 3,
    title: "Wearable synced",
    time: "Yesterday, 8:30 PM",
    icon: IconWatch,
  },
  {
    id: 4,
    title: "Medical scan uploaded",
    time: "Yesterday, 4:12 PM",
    icon: IconFile,
  },
];

function toNumber(value) {
  const parsed = Number(value);

  return Number.isFinite(parsed) ? parsed : null;
}

function calculateOverallWellness(assessment) {
  if (!assessment) {
    return null;
  }

  const scores = [
    toNumber(assessment.stress_score),
    toNumber(assessment.fatigue_score),
    toNumber(assessment.mental_fitness_score),
    toNumber(assessment.cognitive_fitness_score),
  ];

  if (scores.some((score) => score === null)) {
    return null;
  }

  return Math.round(
    scores.reduce((total, score) => total + score, 0) / scores.length
  );
}

function getScoreLabel(score) {
  if (score === null) {
    return "not available";
  }

  if (score >= 75) {
    return "strong";
  }

  if (score >= 50) {
    return "moderate";
  }

  return "needs attention";
}

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
  const [user, setUser] = useState(null);
  const [latestAssessment, setLatestAssessment] = useState(null);
  const [completedAssessments, setCompletedAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assessmentLoading, setAssessmentLoading] = useState(true);
  const [assessmentError, setAssessmentError] = useState("");

  useEffect(() => {
    const fontLink = document.createElement("link");

    fontLink.rel = "stylesheet";
    fontLink.href =
      "https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=Space+Grotesk:wght@400;500;600;700&display=swap";

    document.head.appendChild(fontLink);

    return () => {
      document.head.removeChild(fontLink);
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadDashboardData = async () => {
      try {
        const [profileResponse, assessmentsResponse] = await Promise.all([
          apiRequest("/users/profile/"),
          apiRequest("/assessments/"),
        ]);

        if (
          profileResponse.status === 401 ||
          assessmentsResponse.status === 401
        ) {
          clearTokens();

          if (isMounted) {
            navigate("/login", { replace: true });
          }

          return;
        }

        if (!profileResponse.ok) {
          console.error(
            "Profile request failed with status:",
            profileResponse.status
          );
        } else {
          const profileData = await profileResponse.json();

          if (isMounted) {
            setUser(profileData);
          }
        }

        if (!assessmentsResponse.ok) {
          console.error(
            "Assessment request failed with status:",
            assessmentsResponse.status
          );

          if (isMounted) {
            setAssessmentError(
              "We couldn't load your latest wellness assessment."
            );
          }

          return;
        }

        const assessmentsData = await assessmentsResponse.json();

        const assessments = Array.isArray(assessmentsData)
          ? assessmentsData
          : assessmentsData.results || [];

        const completed = assessments
          .filter((assessment) => assessment.status === "completed")
          .sort(
            (a, b) =>
              new Date(b.completed_at || b.created_at) -
              new Date(a.completed_at || a.created_at)
          );

        if (isMounted) {
          setCompletedAssessments(completed);
          setLatestAssessment(completed[0] || null);
        }
      } catch (error) {
        console.error("Failed to load dashboard:", error);

        if (isMounted) {
          setAssessmentError(
            "Unable to connect to NeuroSync right now. Please try again."
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
          setAssessmentLoading(false);
        }
      }
    };

    loadDashboardData();

    return () => {
      isMounted = false;
    };
  }, [navigate]);

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

  const wellnessScore = calculateOverallWellness(latestAssessment);

  const metrics = latestAssessment
    ? [
        {
          label: "Stress balance",
          value: toNumber(latestAssessment.stress_score),
          unit: getScoreLabel(toNumber(latestAssessment.stress_score)),
          accent: "emerald",
          icon: IconPulseLine,
        },
        {
          label: "Energy & recovery",
          value: toNumber(latestAssessment.fatigue_score),
          unit: getScoreLabel(toNumber(latestAssessment.fatigue_score)),
          accent: "violet",
          icon: IconTrend,
        },
        {
          label: "Cognitive fitness",
          value: toNumber(latestAssessment.cognitive_fitness_score),
          unit: getScoreLabel(
            toNumber(latestAssessment.cognitive_fitness_score)
          ),
          accent: "amber",
          icon: IconGrid,
        },
        {
          label: "Mental fitness",
          value: toNumber(latestAssessment.mental_fitness_score),
          unit: getScoreLabel(
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
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-white/10 bg-slate-950/95 px-5 py-6 backdrop-blur-xl transition-transform duration-200 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-400/10 text-emerald-400">
              <IconMark className="h-6 w-6" />
            </div>

            <div>
              <div className="text-base font-semibold tracking-tight">
                NeuroSync
              </div>
              <div className="text-xs text-slate-500">
                Wellness intelligence
              </div>
            </div>
          </div>

          <button
            type="button"
            className="rounded-lg p-2 text-slate-400 hover:bg-white/5 hover:text-slate-100 lg:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
          >
            <IconClose />
          </button>
        </div>

        <nav className="mt-10 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = item.path === "/dashboard";

            return (
              <button
                key={item.path}
                type="button"
                onClick={() => {
                  setSidebarOpen(false);
                  navigate(item.path);
                }}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors ${
                  active
                    ? "bg-white/10 text-slate-100"
                    : "text-slate-400 hover:bg-white/5 hover:text-slate-100"
                }`}
              >
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="mt-auto">
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-400 transition-colors hover:bg-rose-400/10 hover:text-rose-300"
          >
            <IconLogout className="h-5 w-5" />
            <span>Sign out</span>
          </button>
        </div>
      </aside>

      <div className="lg:pl-72">
        <header className="sticky top-0 z-30 border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
          <div className="flex h-20 items-center justify-between px-6 lg:px-8">
            <div className="flex items-center gap-4">
              <button
                type="button"
                className="rounded-xl border border-white/10 bg-white/5 p-2.5 text-slate-300 hover:bg-white/10 lg:hidden"
                onClick={() => setSidebarOpen(true)}
                aria-label="Open sidebar"
              >
                <IconMenu />
              </button>

              <div>
                <p className="text-sm text-slate-500">{greeting}</p>

                <h1 className="text-lg font-semibold text-slate-100">
                  {user?.first_name || user?.username || "Welcome back"}
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                className="relative rounded-xl border border-white/10 bg-white/5 p-2.5 text-slate-400 hover:bg-white/10 hover:text-slate-100"
                aria-label="Notifications"
              >
                <IconBell className="h-5 w-5" />
                <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-emerald-400" />
              </button>

              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-400 text-sm font-bold text-slate-950">
                {userInitial}
              </div>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-6xl px-6 py-8">
          <div className="grid gap-5 lg:grid-cols-5">
            <div className="rounded-3xl border border-white/10 bg-slate-900 p-6 sm:p-8 lg:col-span-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">
                  Overall wellness index
                </span>

                {latestAssessment && (
                  <span className="rounded-full bg-emerald-400/10 px-2.5 py-1 text-xs font-medium text-emerald-400">
                    Latest check-in
                  </span>
                )}
              </div>

              <div className="flex flex-col items-center">
                <svg
                  viewBox="0 0 200 120"
                  className="w-full max-w-[220px]"
                >
                  <defs>
                    <linearGradient
                      id="gaugeGradDash"
                      x1="20"
                      y1="0"
                      x2="180"
                      y2="0"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="0%" stopColor="#fb7185" />
                      <stop offset="50%" stopColor="#fbbf24" />
                      <stop offset="100%" stopColor="#34d399" />
                    </linearGradient>
                  </defs>

                  <path
                    d="M20,100 A80,80 0 0 1 180,100"
                    fill="none"
                    stroke="url(#gaugeGradDash)"
                    strokeWidth="14"
                    strokeLinecap="round"
                  />

                  {latestAssessment && (
                    <>
                      <line
                        x1="100"
                        y1="100"
                        x2={needleX}
                        y2={needleY}
                        stroke="#f1f5f9"
                        strokeWidth="3"
                        strokeLinecap="round"
                      />

                      <circle
                        cx="100"
                        cy="100"
                        r="5"
                        fill="#f1f5f9"
                      />
                    </>
                  )}
                </svg>

                <div className="-mt-2 text-center">
                  <div
                    style={monoFont}
                    className="text-4xl font-semibold text-slate-100"
                  >
                    {assessmentLoading
                      ? "..."
                      : wellnessScore ?? "--"}
                  </div>

                  <div className="text-sm text-slate-500">
                    {latestAssessment
                      ? "out of 100"
                      : "complete an assessment"}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleStartAssessment}
                  className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-400 px-4 py-3 text-sm font-semibold text-slate-950 transition-colors hover:bg-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:ring-offset-2 focus:ring-offset-slate-900"
                >
                  {latestAssessment
                    ? "Take New Assessment"
                    : "Start Assessment"}
                  <IconArrowRight className="h-4 w-4" />
                </button>

                <p className="mt-2 text-center text-xs text-slate-500">
                  Get a fresh snapshot of your current wellness.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:col-span-3">
              {assessmentLoading ? (
                <div className="sm:col-span-2 flex min-h-48 items-center justify-center rounded-3xl border border-white/10 bg-slate-900">
                  <p className="text-sm text-slate-500">
                    Loading your latest wellness indicators...
                  </p>
                </div>
              ) : metrics.length === 0 ? (
                <div className="sm:col-span-2 flex min-h-48 flex-col items-center justify-center rounded-3xl border border-dashed border-white/10 bg-slate-900 p-6 text-center">
                  <p className="text-sm font-medium text-slate-300">
                    No completed assessment yet
                  </p>

                  <p className="mt-2 max-w-md text-xs leading-5 text-slate-500">
                    Complete your first wellness check-in to generate your
                    personalized indicators.
                  </p>
                </div>
              ) : (
                metrics.map((metric) => {
                  const styles = accent[metric.accent];
                  const Icon = metric.icon;

                  return (
                    <div
                      key={metric.label}
                      className="rounded-3xl border border-white/10 bg-slate-900 p-5"
                    >
                      <div className="flex items-start justify-between">
                        <div
                          className={`flex h-10 w-10 items-center justify-center rounded-xl ${styles.iconBg} ${styles.iconText}`}
                        >
                          <Icon className="h-5 w-5" />
                        </div>

                        <span
                          className={`rounded-full px-2 py-1 text-xs font-medium ${styles.badgeBg} ${styles.badgeText}`}
                        >
                          {metric.unit}
                        </span>
                      </div>

                      <div className="mt-5">
                        <p className="text-sm text-slate-500">
                          {metric.label}
                        </p>

                        <div className="mt-1 flex items-end gap-2">
                          <span
                            style={monoFont}
                            className="text-3xl font-semibold text-slate-100"
                          >
                            {metric.value ?? "--"}
                          </span>

                          <span className="pb-1 text-xs uppercase tracking-wider text-slate-500">
                            / 100
                          </span>
                        </div>
                      </div>

                      <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-slate-800">
                        <div
                          className={`h-full rounded-full ${styles.bar}`}
                          style={{
                            width: `${Math.max(
                              0,
                              Math.min(100, metric.value ?? 0)
                            )}%`,
                          }}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {assessmentError && (
            <div className="mt-5 rounded-2xl border border-rose-400/20 bg-rose-400/5 px-4 py-3 text-sm text-rose-300">
              {assessmentError}
            </div>
          )}

          <div className="mt-5 grid gap-5 lg:grid-cols-3">
            <div className="rounded-3xl border border-white/10 bg-slate-900 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-200">
                    Live signal read
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Camera-based wellness signal
                  </p>
                </div>

                <div
                  className={`h-2.5 w-2.5 rounded-full ${
                    cameraActive ? "bg-emerald-400" : "bg-slate-600"
                  }`}
                />
              </div>

              <div className="mt-5 flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-400/10 text-emerald-400">
                  <IconCamera className="h-7 w-7" />
                </div>

                <div>
                  <p className="text-lg font-semibold text-slate-100">
                    {cameraActive ? "Active" : "Paused"}
                  </p>

                  <p className="text-xs text-slate-500">
                    {cameraActive
                      ? "Signal monitoring is ready"
                      : "Camera monitoring is paused"}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setCameraActive((current) => !current)}
                className="mt-5 w-full rounded-xl border border-white/10 px-4 py-2.5 text-sm font-medium text-slate-300 transition-colors hover:bg-white/5"
              >
                {cameraActive ? "Pause signal" : "Activate signal"}
              </button>
            </div>

            <div className="rounded-3xl border border-white/10 bg-slate-900 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-200">
                    Wearable
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Health data synchronization
                  </p>
                </div>

                <IconWatch className="h-5 w-5 text-violet-400" />
              </div>

              <div className="mt-5 flex items-center justify-between rounded-2xl border border-white/10 bg-slate-950/50 p-4">
                <div>
                  <p className="text-sm font-medium text-slate-200">
                    {wearableConnected ? "Connected" : "Disconnected"}
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    {wearableConnected
                      ? "Last synced recently"
                      : "Connect a supported device"}
                  </p>
                </div>

                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                    wearableConnected
                      ? "bg-emerald-400/10 text-emerald-400"
                      : "bg-slate-800 text-slate-400"
                  }`}
                >
                  {wearableConnected ? "Online" : "Offline"}
                </span>
              </div>

              <button
                type="button"
                onClick={() =>
                  setWearableConnected((current) => !current)
                }
                className="mt-5 w-full rounded-xl border border-white/10 px-4 py-2.5 text-sm font-medium text-slate-300 transition-colors hover:bg-white/5"
              >
                {wearableConnected
                  ? "Disconnect"
                  : "Connect wearable"}
              </button>
            </div>

            <div className="rounded-3xl border border-white/10 bg-slate-900 p-6">
              <div>
                <p className="text-sm font-medium text-slate-200">
                  Mood check-in
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  How are you feeling right now?
                </p>
              </div>

              <div className="mt-5 grid grid-cols-5 gap-2">
                {[
                  { value: "great", emoji: "😄" },
                  { value: "good", emoji: "🙂" },
                  { value: "okay", emoji: "😐" },
                  { value: "low", emoji: "🙁" },
                  { value: "bad", emoji: "😞" },
                ].map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => setMood(item.value)}
                    className={`flex h-11 items-center justify-center rounded-xl border text-lg transition ${
                      mood === item.value
                        ? "border-emerald-400/50 bg-emerald-400/10"
                        : "border-white/10 bg-slate-950/40 hover:bg-white/5"
                    }`}
                    aria-label={item.value}
                  >
                    {item.emoji}
                  </button>
                ))}
              </div>

              <p className="mt-4 text-xs text-slate-500">
                {mood
                  ? `Selected mood: ${mood}`
                  : "Your check-in helps personalize recommendations."}
              </p>
            </div>
          </div>

          <div className="mt-5 grid gap-5 lg:grid-cols-2">
            <div className="rounded-3xl border border-white/10 bg-slate-900 p-6 sm:p-7">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-slate-200">
                    Wellness history
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    Your completed assessments and overall wellness progress.
                  </p>
                </div>

                <span className="shrink-0 rounded-full bg-emerald-400/10 px-2.5 py-1 text-xs font-medium text-emerald-400">
                  {completedAssessments.length}{" "}
                  {completedAssessments.length === 1
                    ? "assessment"
                    : "assessments"}
                </span>
              </div>

              {completedAssessments.length === 0 ? (
                <div className="mt-6 flex min-h-44 items-center justify-center rounded-2xl border border-dashed border-white/10 bg-slate-950/30 p-6 text-center">
                  <div>
                    <IconTrend className="mx-auto h-7 w-7 text-slate-600" />

                    <p className="mt-3 text-sm text-slate-400">
                      No completed assessments yet.
                    </p>

                    <p className="mt-1 text-xs text-slate-600">
                      Complete your first wellness check-in to start
                      building your personal history.
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
                      <p className="text-xs text-slate-500">
                        Current score
                      </p>

                      <div
                        style={monoFont}
                        className="mt-1 text-2xl font-semibold text-slate-100"
                      >
                        {calculateOverallWellness(
                          completedAssessments[0]
                        ) ?? "--"}
                      </div>

                      <p className="mt-1 text-[11px] text-slate-600">
                        Latest completed check-in
                      </p>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
                      <p className="text-xs text-slate-500">
                        Best score
                      </p>

                      <div
                        style={monoFont}
                        className="mt-1 text-2xl font-semibold text-emerald-400"
                      >
                        {bestWellnessScore ?? "--"}
                      </div>

                      <p className="mt-1 text-[11px] text-slate-600">
                        Across completed assessments
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 overflow-hidden rounded-2xl border border-white/10 bg-slate-950/30">
                    {completedAssessments.length >= 2 && (
                      <div className="border-b border-white/10 px-4 py-4">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-medium text-slate-400">
                            Progress over time
                          </p>

                          <p className="text-[11px] text-slate-600">
                            Older → latest
                          </p>
                        </div>

                        <div className="mt-4 h-28 w-full">
                          <svg
                            viewBox="0 0 400 120"
                            preserveAspectRatio="none"
                            className="h-full w-full"
                            role="img"
                            aria-label="Overall wellness score progress across completed assessments"
                          >
                            <line
                              x1="0"
                              y1="100"
                              x2="400"
                              y2="100"
                              stroke="currentColor"
                              className="text-white/5"
                              strokeWidth="1"
                            />

                            <line
                              x1="0"
                              y1="60"
                              x2="400"
                              y2="60"
                              stroke="currentColor"
                              className="text-white/5"
                              strokeWidth="1"
                            />

                            <line
                              x1="0"
                              y1="20"
                              x2="400"
                              y2="20"
                              stroke="currentColor"
                              className="text-white/5"
                              strokeWidth="1"
                            />

                            {(() => {
                              const chartAssessments = [
                                ...completedAssessments,
                              ]
                                .slice(0, 8)
                                .reverse();

                              const points = chartAssessments
                                .map((assessment, index) => {
                                  const score =
                                    calculateOverallWellness(
                                      assessment
                                    );

                                  if (score === null) {
                                    return null;
                                  }

                                  const x =
                                    chartAssessments.length === 1
                                      ? 200
                                      : (index /
                                          (chartAssessments.length -
                                            1)) *
                                        400;

                                  const y = 100 - score * 0.8;

                                  return {
                                    x,
                                    y,
                                    score,
                                  };
                                })
                                .filter(Boolean);

                              if (points.length === 0) {
                                return (
                                  <text
                                    x="200"
                                    y="65"
                                    textAnchor="middle"
                                    className="fill-slate-600 text-[11px]"
                                  >
                                    Scores unavailable
                                  </text>
                                );
                              }

                              const polylinePoints = points
                                .map(
                                  (point) =>
                                    `${point.x},${point.y}`
                                )
                                .join(" ");

                              return (
                                <>
                                  <polyline
                                    points={polylinePoints}
                                    fill="none"
                                    stroke="currentColor"
                                    className="text-emerald-400"
                                    strokeWidth="3"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />

                                  {points.map((point, index) => (
                                    <g
                                      key={`${point.x}-${index}`}
                                    >
                                      <circle
                                        cx={point.x}
                                        cy={point.y}
                                        r="5"
                                        fill="currentColor"
                                        className="text-slate-950"
                                        stroke="currentColor"
                                        strokeWidth="3"
                                      />

                                      <circle
                                        cx={point.x}
                                        cy={point.y}
                                        r="2.5"
                                        fill="currentColor"
                                        className="text-emerald-400"
                                      />
                                    </g>
                                  ))}
                                </>
                              );
                            })()}
                          </svg>
                        </div>
                      </div>
                    )}

                    <div className="divide-y divide-white/5">
                      {completedAssessments
                        .slice(0, 5)
                        .map((assessment, index) => {
                          const score =
                            calculateOverallWellness(assessment);

                          const assessmentDate = new Date(
                            assessment.completed_at ||
                              assessment.created_at
                          );

                          const formattedDate =
                            assessmentDate.toLocaleDateString(
                              undefined,
                              {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              }
                            );

                          const formattedTime =
                            assessmentDate.toLocaleTimeString(
                              undefined,
                              {
                                hour: "numeric",
                                minute: "2-digit",
                              }
                            );

                          return (
                            <div
                              key={assessment.id}
                              className="flex items-center justify-between gap-4 px-4 py-3.5"
                            >
                              <div className="flex min-w-0 items-center gap-3">
                                <div
                                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                                    index === 0
                                      ? "bg-emerald-400/10 text-emerald-400"
                                      : "bg-white/5 text-slate-500"
                                  }`}
                                >
                                  {index === 0 ? (
                                    <IconCheck className="h-4 w-4" />
                                  ) : (
                                    <IconTrend className="h-4 w-4" />
                                  )}
                                </div>

                                <div className="min-w-0">
                                  <p className="truncate text-sm font-medium text-slate-300">
                                    {index === 0
                                      ? "Latest assessment"
                                      : `Assessment ${
                                          completedAssessments.length -
                                          index
                                        }`}
                                  </p>

                                  <p className="mt-0.5 text-xs text-slate-600">
                                    {formattedDate} · {formattedTime}
                                  </p>
                                </div>
                              </div>

                              <div className="shrink-0 text-right">
                                <p
                                  style={monoFont}
                                  className="text-sm font-semibold text-slate-200"
                                >
                                  {score ?? "--"}
                                </p>

                                <p className="text-[10px] uppercase tracking-wider text-slate-600">
                                  / 100
                                </p>
                              </div>
                            </div>
                          );
                        })}
                    </div>

                    {completedAssessments.length > 5 && (
                      <div className="border-t border-white/5 px-4 py-3 text-center">
                        <p className="text-xs text-slate-600">
                          Showing the 5 most recent completed assessments
                        </p>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            <div className="rounded-3xl border border-white/10 bg-slate-900 p-6 sm:p-7">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-200">
                    Suggested for you
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    Small actions to support your current wellness.
                  </p>
                </div>
              </div>

              <div className="mt-5 space-y-3">
                {recommendations.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-white/10 p-5 text-center">
                    <p className="text-sm text-slate-400">
                      You are all caught up.
                    </p>

                    <p className="mt-1 text-xs text-slate-600">
                      New recommendations will appear here.
                    </p>
                  </div>
                ) : (
                  recommendations.map((recommendation) => {
                    const styles = accent[recommendation.accent];

                    return (
                      <div
                        key={recommendation.id}
                        className="flex gap-3 rounded-2xl border border-white/10 bg-slate-950/40 p-4"
                      >
                        <div
                          className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${styles.iconBg} ${styles.iconText}`}
                        >
                          <IconPulseLine className="h-4 w-4" />
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-slate-200">
                            {recommendation.title}
                          </p>

                          <p className="mt-1 text-xs leading-5 text-slate-500">
                            {recommendation.description}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            dismissRecommendation(recommendation.id)
                          }
                          className="self-start rounded-lg p-1 text-slate-600 hover:bg-white/5 hover:text-slate-300"
                          aria-label={`Dismiss ${recommendation.title}`}
                        >
                          <IconX className="h-4 w-4" />
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          <div className="mt-5 grid gap-5 lg:grid-cols-2">
            <div className="rounded-3xl border border-white/10 bg-slate-900 p-6 sm:p-7">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-200">
                    Alerts
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    Important updates from your wellness data
                  </p>
                </div>

                <IconBell className="h-5 w-5 text-slate-500" />
              </div>

              <div className="mt-5 space-y-3">
                {alerts.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-white/10 p-5 text-center">
                    <IconCheck className="mx-auto h-5 w-5 text-emerald-400" />

                    <p className="mt-2 text-sm text-slate-400">
                      No active alerts.
                    </p>
                  </div>
                ) : (
                  alerts.map((alert) => {
                    const alertStyles = {
                      warning: {
                        icon: IconAlert,
                        bg: "bg-amber-400/10",
                        text: "text-amber-400",
                      },
                      success: {
                        icon: IconCheck,
                        bg: "bg-emerald-400/10",
                        text: "text-emerald-400",
                      },
                      info: {
                        icon: IconBell,
                        bg: "bg-violet-400/10",
                        text: "text-violet-400",
                      },
                    };

                    const styles = alertStyles[alert.type];
                    const AlertIcon = styles.icon;

                    return (
                      <div
                        key={alert.id}
                        className="flex gap-3 rounded-2xl border border-white/10 bg-slate-950/40 p-4"
                      >
                        <div
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${styles.bg} ${styles.text}`}
                        >
                          <AlertIcon className="h-4 w-4" />
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-slate-200">
                            {alert.title}
                          </p>

                          <p className="mt-1 text-xs leading-5 text-slate-500">
                            {alert.description}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => dismissAlert(alert.id)}
                          className="self-start rounded-lg p-1 text-slate-600 hover:bg-white/5 hover:text-slate-300"
                          aria-label={`Dismiss ${alert.title}`}
                        >
                          <IconX className="h-4 w-4" />
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-slate-900 p-6 sm:p-7">
              <div>
                <p className="text-sm font-medium text-slate-200">
                  Medical scan
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Upload a report or scan for your NeuroSync record.
                </p>
              </div>

              <label className="mt-5 flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-slate-950/40 px-6 py-8 text-center transition hover:border-emerald-400/30 hover:bg-white/[0.02]">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-400/10 text-emerald-400">
                  <IconUpload className="h-6 w-6" />
                </div>

                <p className="mt-4 text-sm font-medium text-slate-200">
                  {scanFile ? scanFile.name : "Choose a medical file"}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  PDF, JPG or PNG
                </p>

                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="hidden"
                  onChange={handleScanChange}
                />
              </label>

              {scanFile && (
                <div className="mt-4 flex items-center justify-between rounded-xl border border-white/10 bg-slate-950/50 px-4 py-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <IconFile className="h-5 w-5 shrink-0 text-slate-500" />

                    <div className="min-w-0">
                      <p className="truncate text-xs font-medium text-slate-300">
                        {scanFile.name}
                      </p>

                      <p className="text-[11px] text-slate-600">
                        {(scanFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setScanFile(null)}
                    className="rounded-lg p-1.5 text-slate-500 hover:bg-white/5 hover:text-slate-200"
                    aria-label="Remove selected file"
                  >
                    <IconX className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="mt-5 rounded-3xl border border-white/10 bg-slate-900 p-6 sm:p-7">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-200">
                  Recent activity
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Your latest NeuroSync interactions
                </p>
              </div>

              <IconTrend className="h-5 w-5 text-slate-500" />
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-2">
              {activityLog.map((activity) => {
                const ActivityIcon = activity.icon;

                return (
                  <div
                    key={activity.id}
                    className="flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-950/40 p-4"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/5 text-slate-400">
                      <ActivityIcon className="h-5 w-5" />
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-slate-300">
                        {activity.title}
                      </p>

                      <p className="mt-1 text-xs text-slate-600">
                        {activity.time}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default Dashboard;