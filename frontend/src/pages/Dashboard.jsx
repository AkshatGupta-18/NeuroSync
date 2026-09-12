import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "../services/api";
import { clearTokens } from "../services/auth";

/* ---------------------------------------------------------
   NeuroSync — Dashboard
   Protected authenticated user dashboard.
--------------------------------------------------------- */

const displayFont = { fontFamily: "'Space Grotesk', sans-serif" };
const monoFont = { fontFamily: "'IBM Plex Mono', monospace" };

/* ---------- Icons ---------- */

const iconProps = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

function IconMark({ className }) {
  return (
    <svg viewBox="0 0 32 32" className={className}>
      <circle
        cx="16"
        cy="16"
        r="13"
        stroke="#34d399"
        strokeWidth="1.6"
        fill="none"
      />
      <path
        d="M7 16h4l2-6 4 12 2-8 1.5 2H25"
        stroke="#a78bfa"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

function IconMenu({ className }) {
  return (
    <svg {...iconProps} className={className}>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

function IconClose({ className }) {
  return (
    <svg {...iconProps} className={className}>
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

function IconGrid({ className }) {
  return (
    <svg {...iconProps} className={className}>
      <rect x="4" y="4" width="7" height="7" rx="1.5" />
      <rect x="13" y="4" width="7" height="7" rx="1.5" />
      <rect x="4" y="13" width="7" height="7" rx="1.5" />
      <rect x="13" y="13" width="7" height="7" rx="1.5" />
    </svg>
  );
}

function IconPulseLine({ className }) {
  return (
    <svg {...iconProps} className={className}>
      <path d="M3 12h4l2-6 3 12 2-8 1.5 2H21" />
    </svg>
  );
}

function IconTrend({ className }) {
  return (
    <svg {...iconProps} className={className}>
      <path d="M4 16l5-5 4 4 7-8" />
      <path d="M14 7h6v6" />
    </svg>
  );
}

function IconScan({ className }) {
  return (
    <svg {...iconProps} className={className}>
      <path d="M4 8V6a2 2 0 0 1 2-2h2M20 8V6a2 2 0 0 0-2-2h-2M4 16v2a2 2 0 0 0 2 2h2M20 16v2a2 2 0 0 1-2 2h-2" />
      <rect x="8" y="8" width="8" height="8" rx="1" />
    </svg>
  );
}

function IconSettings({ className }) {
  return (
    <svg {...iconProps} className={className}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 13a7.6 7.6 0 0 0 0-2l2-1.5-2-3.5-2.4 1a7.7 7.7 0 0 0-1.7-1L15 3h-4l-.3 2.5a7.7 7.7 0 0 0-1.7 1l-2.4-1-2 3.5L6.6 11a7.6 7.6 0 0 0 0 2l-2 1.5 2 3.5 2.4-1a7.7 7.7 0 0 0 1.7-1L11 21h4l.3-2.5a7.7 7.7 0 0 0 1.7-1l2.4 1 2-3.5-2-1.5Z" />
    </svg>
  );
}

function IconLogout({ className }) {
  return (
    <svg {...iconProps} className={className}>
      <path d="M9 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h3" />
      <path d="M16 16l4-4-4-4" />
      <path d="M20 12H9" />
    </svg>
  );
}

function IconBell({ className }) {
  return (
    <svg {...iconProps} className={className}>
      <path d="M6 9a6 6 0 0 1 12 0c0 4 1.5 5.5 1.5 5.5H4.5S6 13 6 9Z" />
      <path d="M10 19a2 2 0 0 0 4 0" />
    </svg>
  );
}

function IconCamera({ className }) {
  return (
    <svg {...iconProps} className={className}>
      <path d="M4 8a2 2 0 0 1 2-2h2l1.5-2h5L16 6h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8Z" />
      <circle cx="12" cy="13" r="3.2" />
    </svg>
  );
}

function IconWatch({ className }) {
  return (
    <svg {...iconProps} className={className}>
      <rect x="7" y="7" width="10" height="10" rx="2.5" />
      <path d="M9 4h6M9 20h6M12 10.5V13l1.6 1" />
    </svg>
  );
}

function IconUpload({ className }) {
  return (
    <svg {...iconProps} className={className}>
      <path d="M12 16V5M8 9l4-4 4 4" />
      <path d="M5 16v2a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-2" />
    </svg>
  );
}

function IconX({ className }) {
  return (
    <svg {...iconProps} className={className}>
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

function IconAlert({ className }) {
  return (
    <svg {...iconProps} className={className}>
      <path d="M12 4 3 20h18L12 4Z" />
      <path d="M12 10v4M12 17h.01" />
    </svg>
  );
}

function IconCheck({ className }) {
  return (
    <svg {...iconProps} className={className}>
      <path d="M5 13l4 4L19 7" />
    </svg>
  );
}

function IconFile({ className }) {
  return (
    <svg {...iconProps} className={className}>
      <path d="M6 3h8l4 4v14H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z" />
      <path d="M14 3v4h4" />
    </svg>
  );
}

/* ---------- Design tokens ---------- */

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

/* ---------- Mock data ---------- */

const navItems = [
  { label: "Dashboard", icon: IconGrid, href: "/dashboard", active: true },
  { label: "Signals", icon: IconPulseLine, href: "/signals" },
  { label: "Trends", icon: IconTrend, href: "/trends" },
  { label: "Medical scans", icon: IconScan, href: "/scans" },
  { label: "Settings", icon: IconSettings, href: "/settings" },
];

const initialMetrics = [
  {
    key: "stress",
    label: "Stress",
    value: 24,
    tag: "Low",
    delta: -4,
    color: accent.emerald,
  },
  {
    key: "fatigue",
    label: "Fatigue",
    value: 18,
    tag: "Low",
    delta: -2,
    color: accent.emerald,
  },
  {
    key: "focus",
    label: "Focus",
    value: 82,
    tag: "High",
    delta: 6,
    color: accent.violet,
  },
  {
    key: "emotional",
    label: "Emotional wellness",
    value: 76,
    tag: "Good",
    delta: 3,
    color: accent.emerald,
  },
];

const weeklyTrend = [62, 68, 60, 71, 74, 70, 78];
const weekLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const initialRecommendations = [
  {
    id: "r1",
    text: "Take a 5-minute breathing break",
    tag: "Stress",
  },
  {
    id: "r2",
    text: "You've been at the screen a while — stretch",
    tag: "Fatigue",
  },
  {
    id: "r3",
    text: "Try winding down 30 minutes earlier tonight",
    tag: "Sleep",
  },
];

const initialAlerts = [
  {
    id: "a1",
    level: "amber",
    text: "Fatigue trending up over the last 3 sessions",
    time: "2h ago",
  },
  {
    id: "a2",
    level: "emerald",
    text: "Focus score hit a 7-day high",
    time: "Yesterday",
  },
  {
    id: "a3",
    level: "violet",
    text: "New weekly trend report is ready",
    time: "2 days ago",
  },
];

const activityLog = [
  {
    id: "l1",
    label: "Webcam read",
    detail: "Stress 22 · Focus 80",
    time: "9:42 AM",
  },
  {
    id: "l2",
    label: "Self-reported mood",
    detail: 'Logged as "Good"',
    time: "Yesterday, 8:10 PM",
  },
  {
    id: "l3",
    label: "Wearable sync",
    detail: "HRV, sleep imported",
    time: "Yesterday, 7:05 AM",
  },
  {
    id: "l4",
    label: "Scan uploaded",
    detail: "chest_xray_03.png",
    time: "3 days ago",
  },
];

/* ---------- Component ---------- */

export default function Dashboard() {
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!document.head.querySelector("[data-neurosync-fonts]")) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href =
        "https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@500;600&family=IBM+Plex+Sans:wght@400;500;600&family=Space+Grotesk:wght@500;600;700&display=swap";
      link.setAttribute("data-neurosync-fonts", "true");
      document.head.appendChild(link);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    const fetchProfile = async () => {
      try {
        const response = await apiRequest("/users/profile/");

        if (response.status === 401) {
          clearTokens();

          if (isMounted) {
            navigate("/login", { replace: true });
          }

          return;
        }

        if (!response.ok) {
          console.error(
            "Profile request failed with status:",
            response.status
          );
          return;
        }

        const data = await response.json();

        if (isMounted) {
          setUser(data);
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchProfile();

    return () => {
      isMounted = false;
    };
  }, [navigate]);

  const handleLogout = () => {
    clearTokens();
    setSidebarOpen(false);
    navigate("/login", { replace: true });
  };

  const greeting = useMemo(() => {
    const h = new Date().getHours();

    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";

    return "Good evening";
  }, []);

  const wellnessScore = 78;
  const angleDeg = 180 - (wellnessScore / 100) * 180;
  const angleRad = (angleDeg * Math.PI) / 180;
  const needleX = 100 + 62 * Math.cos(angleRad);
  const needleY = 100 - 62 * Math.sin(angleRad);

  const trendPoints = weeklyTrend.map((value, index) => {
    const x = (index / (weeklyTrend.length - 1)) * 400;
    const y = 110 - (value / 100) * 90;

    return [x, y];
  });

  const trendPath = trendPoints
    .map(
      ([x, y], index) =>
        `${index === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`
    )
    .join(" ");

  function dismissRecommendation(id) {
    setRecommendations((prev) => prev.filter((r) => r.id !== id));
  }

  function dismissAlert(id) {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  }

  function handleScanChange(event) {
    const file = event.target.files?.[0];

    if (file) {
      setScanFile(file.name);
    }
  }

  const userInitial = user?.username
    ? user.username.charAt(0).toUpperCase()
    : "U";

  return (
    <div
      className="min-h-screen bg-slate-950 text-slate-100 antialiased"
      style={{ fontFamily: "'IBM Plex Sans', sans-serif" }}
    >
      <div className="flex">
        <aside className="sticky top-0 hidden h-screen w-64 flex-none flex-col border-r border-white/10 bg-slate-950 px-5 py-6 lg:flex">
          <a
            href="/dashboard"
            className="flex items-center gap-2.5 px-1"
          >
            <IconMark className="h-8 w-8" />

            <span
              style={displayFont}
              className="text-lg font-semibold tracking-tight"
            >
              NeuroSync
            </span>
          </a>

          <nav className="mt-10 flex flex-1 flex-col gap-1">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                  item.active
                    ? "bg-white/5 text-slate-100"
                    : "text-slate-400 hover:bg-white/5 hover:text-slate-100"
                }`}
              >
                <item.icon className="h-4.5 w-4.5" />
                {item.label}
              </a>
            ))}
          </nav>

          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-400 transition-colors hover:bg-white/5 hover:text-slate-100"
          >
            <IconLogout className="h-4.5 w-4.5" />
            Sign out
          </button>
        </aside>

        {sidebarOpen && (
          <div className="fixed inset-0 z-50 flex lg:hidden">
            <div
              className="absolute inset-0 bg-black/60"
              onClick={() => setSidebarOpen(false)}
            />

            <aside className="relative flex h-full w-64 flex-col border-r border-white/10 bg-slate-950 px-5 py-6">
              <div className="flex items-center justify-between">
                <a
                  href="/dashboard"
                  className="flex items-center gap-2.5"
                >
                  <IconMark className="h-8 w-8" />

                  <span
                    style={displayFont}
                    className="text-lg font-semibold tracking-tight"
                  >
                    NeuroSync
                  </span>
                </a>

                <button
                  type="button"
                  onClick={() => setSidebarOpen(false)}
                  aria-label="Close menu"
                  className="text-slate-400"
                >
                  <IconClose className="h-5 w-5" />
                </button>
              </div>

              <nav className="mt-10 flex flex-1 flex-col gap-1">
                {navItems.map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                      item.active
                        ? "bg-white/5 text-slate-100"
                        : "text-slate-400 hover:bg-white/5 hover:text-slate-100"
                    }`}
                  >
                    <item.icon className="h-4.5 w-4.5" />
                    {item.label}
                  </a>
                ))}
              </nav>

              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-400 hover:bg-white/5 hover:text-slate-100"
              >
                <IconLogout className="h-4.5 w-4.5" />
                Sign out
              </button>
            </aside>
          </div>
        )}

        <div className="min-w-0 flex-1">
          <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/90 px-6 py-4 backdrop-blur">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setSidebarOpen(true)}
                  className="text-slate-300 lg:hidden"
                  aria-label="Open menu"
                >
                  <IconMenu className="h-6 w-6" />
                </button>

                <div>
                  <h1
                    style={displayFont}
                    className="text-xl font-semibold tracking-tight text-slate-100 sm:text-2xl"
                  >
                    {greeting},{" "}
                    {loading ? "..." : user?.username || "User"}
                  </h1>

                  <p className="text-sm text-slate-500">
                    Here's where things stand today.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <button
                  type="button"
                  className="relative text-slate-400 transition-colors hover:text-slate-100"
                  aria-label="Notifications"
                >
                  <IconBell className="h-5 w-5" />

                  {alerts.length > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-400 text-[10px] font-semibold text-slate-950">
                      {alerts.length}
                    </span>
                  )}
                </button>

                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-violet-400/10 text-sm font-semibold text-violet-300">
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

                  <span className="rounded-full bg-emerald-400/10 px-2.5 py-1 text-xs font-medium text-emerald-400">
                    +6 this week
                  </span>
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
                  </svg>

                  <div className="-mt-2 text-center">
                    <div
                      style={monoFont}
                      className="text-4xl font-semibold text-slate-100"
                    >
                      {wellnessScore}
                    </div>

                    <div className="text-sm text-slate-500">
                      out of 100
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:col-span-3">
                {initialMetrics.map((metric) => (
                  <div
                    key={metric.key}
                    className="rounded-2xl border border-white/10 bg-slate-900 p-5"
                  >
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-400">
                        {metric.label}
                      </span>

                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${metric.color.badgeBg} ${metric.color.badgeText}`}
                      >
                        {metric.tag}
                      </span>
                    </div>

                    <div className="mt-3 flex items-end justify-between">
                      <span
                        style={monoFont}
                        className="text-3xl font-semibold text-slate-100"
                      >
                        {metric.value}
                      </span>

                      <span
                        className={`text-xs font-medium ${
                          metric.delta >= 0
                            ? "text-emerald-400"
                            : "text-rose-400"
                        }`}
                      >
                        {metric.delta >= 0 ? "▲" : "▼"}{" "}
                        {Math.abs(metric.delta)} vs last week
                      </span>
                    </div>

                    <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-white/5">
                      <div
                        className={`h-full rounded-full ${metric.color.bar}`}
                        style={{ width: `${metric.value}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-5 grid gap-5 lg:grid-cols-5">
              <div className="rounded-3xl border border-white/10 bg-slate-900 p-6 lg:col-span-2">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-semibold text-slate-100">
                    Live signal read
                  </h2>

                  {cameraActive && (
                    <span className="flex items-center gap-2 text-xs font-medium text-emerald-400">
                      <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
                      recording
                    </span>
                  )}
                </div>

                <div className="mt-4 flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
                  <div className="flex items-center gap-3">
                    <span
                      className={`flex h-9 w-9 items-center justify-center rounded-lg ${accent.violet.iconBg} ${accent.violet.iconText}`}
                    >
                      <IconCamera className="h-4.5 w-4.5" />
                    </span>

                    <div>
                      <div className="text-sm font-medium text-slate-100">
                        Webcam
                      </div>

                      <div className="text-xs text-slate-500">
                        {cameraActive
                          ? "Reading expression & blink rate"
                          : "Paused"}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setCameraActive((value) => !value)}
                    className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
                      cameraActive
                        ? "bg-white/10 text-slate-200 hover:bg-white/15"
                        : "bg-emerald-400 text-slate-950 hover:bg-emerald-300"
                    }`}
                  >
                    {cameraActive ? "Pause" : "Start"}
                  </button>
                </div>

                <div className="mt-3 flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
                  <div className="flex items-center gap-3">
                    <span
                      className={`flex h-9 w-9 items-center justify-center rounded-lg ${accent.emerald.iconBg} ${accent.emerald.iconText}`}
                    >
                      <IconWatch className="h-4.5 w-4.5" />
                    </span>

                    <div>
                      <div className="text-sm font-medium text-slate-100">
                        Wearable
                      </div>

                      <div className="text-xs text-slate-500">
                        {wearableConnected
                          ? "Synced 12 minutes ago"
                          : "Not connected"}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setWearableConnected((value) => !value)
                    }
                    className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
                      wearableConnected
                        ? "bg-white/10 text-slate-200 hover:bg-white/15"
                        : "bg-emerald-400 text-slate-950 hover:bg-emerald-300"
                    }`}
                  >
                    {wearableConnected ? "Disconnect" : "Connect"}
                  </button>
                </div>

                <div className="mt-5">
                  <div className="text-sm font-medium text-slate-100">
                    How are you feeling right now?
                  </div>

                  <div className="mt-2.5 flex flex-wrap gap-2">
                    {["Great", "Okay", "Tired", "Stressed"].map(
                      (moodOption) => (
                        <button
                          type="button"
                          key={moodOption}
                          onClick={() => setMood(moodOption)}
                          className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors ${
                            mood === moodOption
                              ? "border-emerald-400 bg-emerald-400/10 text-emerald-400"
                              : "border-white/10 text-slate-300 hover:border-white/20"
                          }`}
                        >
                          {moodOption}
                        </button>
                      )
                    )}
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-slate-900 p-6 lg:col-span-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-semibold text-slate-100">
                    7-day wellness trend
                  </h2>

                  <span className="text-xs text-slate-500">
                    Mon – Sun
                  </span>
                </div>

                <svg
                  viewBox="0 0 400 130"
                  className="mt-4 w-full"
                >
                  <line
                    x1="0"
                    y1="110"
                    x2="400"
                    y2="110"
                    stroke="#ffffff14"
                    strokeWidth="1"
                  />

                  <path
                    d={trendPath}
                    fill="none"
                    stroke="#34d399"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  {trendPoints.map(([x, y], index) => (
                    <circle
                      key={index}
                      cx={x}
                      cy={y}
                      r={
                        index === trendPoints.length - 1
                          ? 4
                          : 2.5
                      }
                      fill={
                        index === trendPoints.length - 1
                          ? "#34d399"
                          : "#6ee7b7"
                      }
                    />
                  ))}
                </svg>

                <div className="mt-1 flex justify-between text-xs text-slate-500">
                  {weekLabels.map((day) => (
                    <span key={day}>{day}</span>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-5 grid gap-5 lg:grid-cols-5">
              <div className="rounded-3xl border border-white/10 bg-slate-900 p-6 lg:col-span-3">
                <h2 className="text-base font-semibold text-slate-100">
                  Suggested for you
                </h2>

                {recommendations.length === 0 ? (
                  <p className="mt-4 text-sm text-slate-500">
                    You're all caught up — new suggestions will show up here.
                  </p>
                ) : (
                  <ul className="mt-4 space-y-3">
                    {recommendations.map((recommendation) => (
                      <li
                        key={recommendation.id}
                        className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3"
                      >
                        <div className="flex items-center gap-3">
                          <span className="flex h-7 w-7 flex-none items-center justify-center rounded-full bg-emerald-400/10 text-emerald-400">
                            <IconCheck className="h-3.5 w-3.5" />
                          </span>

                          <div>
                            <div className="text-sm text-slate-100">
                              {recommendation.text}
                            </div>

                            <div className="text-xs text-slate-500">
                              {recommendation.tag}
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            dismissRecommendation(
                              recommendation.id
                            )
                          }
                          className="text-slate-500 hover:text-slate-200"
                          aria-label="Dismiss"
                        >
                          <IconX className="h-4 w-4" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="rounded-3xl border border-white/10 bg-slate-900 p-6 lg:col-span-2">
                <h2 className="text-base font-semibold text-slate-100">
                  Alerts
                </h2>

                {alerts.length === 0 ? (
                  <p className="mt-4 text-sm text-slate-500">
                    No active alerts right now.
                  </p>
                ) : (
                  <ul className="mt-4 space-y-3">
                    {alerts.map((alert) => {
                      const color =
                        accent[alert.level] || accent.violet;

                      return (
                        <li
                          key={alert.id}
                          className="flex items-start justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3"
                        >
                          <div className="flex items-start gap-3">
                            <span
                              className={`mt-0.5 flex h-7 w-7 flex-none items-center justify-center rounded-full ${color.iconBg} ${color.iconText}`}
                            >
                              <IconAlert className="h-3.5 w-3.5" />
                            </span>

                            <div>
                              <div className="text-sm text-slate-100">
                                {alert.text}
                              </div>

                              <div className="text-xs text-slate-500">
                                {alert.time}
                              </div>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => dismissAlert(alert.id)}
                            className="text-slate-500 hover:text-slate-200"
                            aria-label="Dismiss"
                          >
                            <IconX className="h-4 w-4" />
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </div>

            <div className="mt-5 grid gap-5 lg:grid-cols-5">
              <div className="rounded-3xl border border-white/10 bg-slate-900 p-6 lg:col-span-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`flex h-8 w-8 items-center justify-center rounded-lg ${accent.amber.iconBg} ${accent.amber.iconText}`}
                  >
                    <IconScan className="h-4 w-4" />
                  </span>

                  <h2 className="text-base font-semibold text-slate-100">
                    Medical scan (assistive)
                  </h2>
                </div>

                <label
                  htmlFor="scan-upload"
                  className="mt-4 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-white/15 bg-white/[0.02] px-4 py-8 text-center transition-colors hover:border-white/25"
                >
                  <IconUpload className="h-5 w-5 text-slate-400" />

                  <span className="text-sm text-slate-300">
                    {scanFile
                      ? "Replace file"
                      : "Upload an X-ray, CT, or MRI"}
                  </span>

                  <span className="text-xs text-slate-500">
                    PNG, JPG, or DICOM
                  </span>

                  <input
                    id="scan-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleScanChange}
                  />
                </label>

                {scanFile && (
                  <div className="mt-3 flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5 text-sm text-slate-200">
                    <IconFile className="h-4 w-4 flex-none text-slate-400" />

                    <span className="truncate">{scanFile}</span>
                  </div>
                )}

                <p className="mt-4 text-xs leading-relaxed text-slate-500">
                  Preliminary findings only — always a starting point for a
                  professional, never a diagnosis.
                </p>
              </div>

              <div className="rounded-3xl border border-white/10 bg-slate-900 p-6 lg:col-span-3">
                <h2 className="text-base font-semibold text-slate-100">
                  Recent activity
                </h2>

                <ul className="mt-4 divide-y divide-white/5">
                  {activityLog.map((activity) => (
                    <li
                      key={activity.id}
                      className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
                    >
                      <div>
                        <div className="text-sm text-slate-100">
                          {activity.label}
                        </div>

                        <div className="text-xs text-slate-500">
                          {activity.detail}
                        </div>
                      </div>

                      <span
                        style={monoFont}
                        className="flex-none text-xs text-slate-500"
                      >
                        {activity.time}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}