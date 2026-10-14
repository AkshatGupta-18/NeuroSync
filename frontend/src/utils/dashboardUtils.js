import {
  IconGrid,
  IconPulseLine,
  IconTrend,
  IconScan,
  IconSettings,
  IconCamera,
  IconWatch,
  IconFile,
} from "../components/dashboard/DashboardIcons";

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

export {
  accent,
  navItems,
  initialRecommendations,
  initialAlerts,
  activityLog,
  toNumber,
  calculateOverallWellness,
  getScoreLabel,
};
