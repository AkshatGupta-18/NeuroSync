import React, { useState, useEffect } from "react";

/* ---------------------------------------------------------
   NeuroSync — Landing Page
   A cognitive & wellness analysis system (final year project)

   Notes for integration:
   - Uses plain <a href="/login"> and <a href="/register"> so it
     works with any router (react-router, Next.js, or none).
   - Loads Space Grotesk / IBM Plex Sans / IBM Plex Mono from
     Google Fonts at runtime. For best performance, move the
     <link> in the useEffect below into your index.html <head>.
   - Tailwind only (no extra dependencies, no config changes
     required — everything uses Tailwind's default palette).
--------------------------------------------------------- */

const displayFont = { fontFamily: "'Space Grotesk', sans-serif" };
const monoFont = { fontFamily: "'IBM Plex Mono', monospace" };

/* ---------- Icons (small inline line icons, no dependency) ---------- */

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
      <circle cx="16" cy="16" r="13" stroke="#34d399" strokeWidth="1.6" fill="none" />
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

function IconCamera({ className }) {
  return (
    <svg {...iconProps} className={className}>
      <path d="M4 8a2 2 0 0 1 2-2h2l1.5-2h5L16 6h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8Z" />
      <circle cx="12" cy="13" r="3.2" />
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

function IconKeyboard({ className }) {
  return (
    <svg {...iconProps} className={className}>
      <rect x="3" y="7" width="18" height="11" rx="2" />
      <path d="M7 11h.01M11 11h.01M15 11h.01M17 11h.01M7 14.5h10" />
    </svg>
  );
}

function IconMoon({ className }) {
  return (
    <svg {...iconProps} className={className}>
      <path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5Z" />
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

function IconLock({ className }) {
  return (
    <svg {...iconProps} className={className}>
      <rect x="5" y="11" width="14" height="9" rx="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </svg>
  );
}

function IconShield({ className }) {
  return (
    <svg {...iconProps} className={className}>
      <path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3Z" />
    </svg>
  );
}

function IconNote({ className }) {
  return (
    <svg {...iconProps} className={className}>
      <rect x="5" y="3" width="14" height="18" rx="2" />
      <path d="M8 8h8M8 12h8M8 16h5" />
    </svg>
  );
}

function IconAudit({ className }) {
  return (
    <svg {...iconProps} className={className}>
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <path d="M8 9.5l1.5 1.5L12 8M8 15.5l1.5 1.5L12 14" />
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

/* ---------- Static content ---------- */

const steps = [
  {
    title: "Set up your profile",
    desc: "Tell us a little about yourself — age, lifestyle, and what you actually want to track.",
  },
  {
    title: "Share your signals",
    desc: "Turn on your webcam for a short read, connect a wearable, or just log how you're feeling.",
  },
  {
    title: "NeuroSync reads the patterns",
    desc: "Expression, pulse, and behaviour are read together, not in isolation, to reduce false alarms.",
  },
  {
    title: "Get insights you can use",
    desc: "See your stress, fatigue, and focus scores, with suggestions that fit the rest of your day.",
  },
];

const accent = {
  emerald: {
    iconBg: "bg-emerald-400/10",
    iconText: "text-emerald-400",
    bar: "bg-emerald-400",
    badgeBg: "bg-emerald-400/10",
    badgeText: "text-emerald-600",
  },
  violet: {
    iconBg: "bg-violet-400/10",
    iconText: "text-violet-400",
    bar: "bg-violet-400",
    badgeBg: "bg-violet-400/10",
    badgeText: "text-violet-600",
  },
  amber: {
    iconBg: "bg-amber-400/10",
    iconText: "text-amber-500",
    bar: "bg-amber-400",
    badgeBg: "bg-amber-400/10",
    badgeText: "text-amber-600",
  },
};

const signals = [
  {
    icon: IconCamera,
    color: accent.violet,
    title: "Face & eyes",
    desc: "Expression, blink rate, and eye movement, read through your webcam.",
  },
  {
    icon: IconPulseLine,
    color: accent.emerald,
    title: "Heart & breath",
    desc: "Optional wearable data for heart-rate variability and breathing patterns.",
  },
  {
    icon: IconKeyboard,
    color: accent.violet,
    title: "How you interact",
    desc: "Typing rhythm, mouse movement, and reaction time during focus tasks.",
  },
  {
    icon: IconMoon,
    color: accent.emerald,
    title: "Sleep, mood & habits",
    desc: "What you tell us about your sleep, activity, and how you're feeling.",
  },
  {
    icon: IconScan,
    color: accent.amber,
    title: "Medical scans (assistive)",
    desc: "Upload an X-ray, CT, or MRI for a preliminary read, always paired with a note to see a professional.",
  },
];

const metrics = [
  { label: "Stress", value: 24, tag: "Low", color: accent.emerald },
  { label: "Fatigue", value: 18, tag: "Low", color: accent.emerald },
  { label: "Focus", value: 82, tag: "High", color: accent.violet },
  { label: "Emotional wellness", value: 76, tag: "Good", color: accent.emerald },
];

const recommendations = [
  "Take a 5-minute breathing break",
  "You've been at the screen a while — stretch",
  "Try winding down 30 minutes earlier tonight",
];

const outputs = [
  {
    title: "Real-time dashboard",
    desc: "Your current state, updated as new signals come in.",
  },
  {
    title: "Personalized recommendations",
    desc: "Small, specific suggestions that fit your day.",
  },
  {
    title: "Trends & progress",
    desc: "Watch your patterns shift over days and weeks.",
  },
  {
    title: "Timely alerts",
    desc: "A nudge when stress or fatigue climbs higher than usual.",
  },
];

const trust = [
  {
    icon: IconLock,
    title: "End-to-end encryption",
    desc: "Signals and scores are encrypted in transit and at rest.",
  },
  {
    icon: IconShield,
    title: "You choose what to share",
    desc: "Camera, wearable, or self-report — every input is opt-in, module by module.",
  },
  {
    icon: IconNote,
    title: "Not a diagnosis",
    desc: "Findings, especially from scans, are a starting point for a professional, not a verdict.",
  },
  {
    icon: IconAudit,
    title: "Secure by design",
    desc: "Two-factor login, role-based access, and audit logs come built in.",
  },
];

/* ---------- Component ---------- */

export default function Landing() {
  const [menuOpen, setMenuOpen] = useState(false);

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

  // Wellness gauge math (semicircle dial, center 100,100 radius 80)
  const score = 78;
  const angleDeg = 180 - (score / 100) * 180;
  const angleRad = (angleDeg * Math.PI) / 180;
  const needleX = 100 + 62 * Math.cos(angleRad);
  const needleY = 100 - 62 * Math.sin(angleRad);

  return (
    <div
      className="min-h-screen bg-slate-950 text-slate-100 antialiased"
      style={{ fontFamily: "'IBM Plex Sans', sans-serif" }}
    >
      <style>{`
        html { scroll-behavior: smooth; }
        .draw-in { stroke-dasharray: 1; stroke-dashoffset: 1; animation: draw-in 1.8s ease-out forwards; }
        @keyframes draw-in { to { stroke-dashoffset: 0; } }
        @media (prefers-reduced-motion: reduce) {
          .draw-in { animation: none; stroke-dashoffset: 0; }
        }
      `}</style>

      {/* ================= NAV ================= */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <a href="/" className="flex items-center gap-2.5">
            <IconMark className="h-8 w-8" />
            <span style={displayFont} className="text-lg font-semibold tracking-tight">
              NeuroSync
            </span>
          </a>

          <nav className="hidden items-center gap-8 text-sm text-slate-400 md:flex">
            <a href="#how-it-works" className="transition-colors hover:text-slate-100">
              How it works
            </a>
            <a href="#signals" className="transition-colors hover:text-slate-100">
              What we read
            </a>
            <a href="#privacy" className="transition-colors hover:text-slate-100">
              Privacy
            </a>
          </nav>

          <div className="hidden items-center gap-6 md:flex">
            <a href="/login" className="text-sm font-medium text-slate-300 transition-colors hover:text-slate-100">
              Sign in
            </a>
            <a
              href="/register"
              className="rounded-full bg-emerald-400 px-5 py-2 text-sm font-medium text-slate-950 transition-colors hover:bg-emerald-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
            >
              Create account
            </a>
          </div>

          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="text-slate-300 md:hidden"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
          >
            {menuOpen ? <IconClose className="h-6 w-6" /> : <IconMenu className="h-6 w-6" />}
          </button>
        </div>

        {menuOpen && (
          <div className="border-t border-white/10 px-6 py-5 md:hidden">
            <div className="flex flex-col gap-4 text-sm text-slate-300">
              <a href="#how-it-works" onClick={() => setMenuOpen(false)}>
                How it works
              </a>
              <a href="#signals" onClick={() => setMenuOpen(false)}>
                What we read
              </a>
              <a href="#privacy" onClick={() => setMenuOpen(false)}>
                Privacy
              </a>
              <a href="/login" onClick={() => setMenuOpen(false)}>
                Sign in
              </a>
              <a
                href="/register"
                onClick={() => setMenuOpen(false)}
                className="mt-1 inline-block w-fit rounded-full bg-emerald-400 px-5 py-2 font-medium text-slate-950"
              >
                Create account
              </a>
            </div>
          </div>
        )}
      </header>

      {/* ================= HERO ================= */}
      <section className="px-6 pb-20 pt-16 md:pt-24">
        <div className="mx-auto grid max-w-6xl gap-16 md:grid-cols-2 md:items-center">
          <div>
            <h1
              style={displayFont}
              className="text-4xl font-semibold leading-[1.1] tracking-tight text-slate-100 sm:text-5xl lg:text-[3.4rem]"
            >
              See what your face, pulse, and habits are already telling you.
            </h1>
            <p className="mt-6 max-w-md text-lg leading-relaxed text-slate-400">
              NeuroSync reads everyday signals — a webcam glance, a heartbeat, the way you type —
              and turns them into a clear picture of your stress, fatigue, and focus.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-5">
              <a
                href="/register"
                className="rounded-full bg-emerald-400 px-7 py-3 text-base font-medium text-slate-950 transition-colors hover:bg-emerald-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
              >
                Create your account
              </a>
              <a
                href="/login"
                className="text-base font-medium text-slate-100 underline decoration-slate-600 underline-offset-4 transition-colors hover:decoration-slate-300"
              >
                Sign in
              </a>
            </div>
            <p className="mt-6 text-sm text-slate-500">
              Built as a final year capstone project. Preliminary insights only, not a medical
              diagnosis.
            </p>
          </div>

          {/* Hero visual: live pulse read */}
          <div className="relative rounded-3xl border border-white/10 bg-slate-900 p-6 sm:p-8">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-400">Live signal read</span>
              <span className="flex items-center gap-2 text-xs font-medium text-emerald-400">
                <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
                recording
              </span>
            </div>

            <svg viewBox="0 0 400 140" className="mt-6 w-full">
              <path
                d="M0,40 C40,20 80,60 120,40 C160,20 200,60 240,40 C280,20 320,60 360,40 C380,30 390,35 400,40"
                fill="none"
                stroke="#a78bfa"
                strokeOpacity="0.55"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                pathLength="1"
                className="draw-in"
                d="M0,90 L20,90 L35,60 L45,110 L55,40 L65,90 L120,90 L135,60 L145,110 L155,40 L165,90 L220,90 L235,60 L245,110 L255,40 L265,90 L400,90"
                fill="none"
                stroke="#34d399"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>

            <div className="mt-6 flex flex-wrap gap-3">
              <span className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-300">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                Stress <span className="font-medium text-slate-100">Low</span>
              </span>
              <span className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-300">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                Fatigue <span className="font-medium text-slate-100">Low</span>
              </span>
              <span className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-300">
                <span className="h-1.5 w-1.5 rounded-full bg-violet-400" />
                Focus <span className="font-medium text-slate-100">82</span>
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ================= HOW IT WORKS ================= */}
      <section id="how-it-works" className="bg-slate-50 px-6 py-24 text-slate-900">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-xl">
            <h2 style={displayFont} className="text-3xl font-semibold tracking-tight sm:text-4xl">
              How NeuroSync works
            </h2>
            <p className="mt-4 text-lg text-slate-500">
              Four steps between opening the app and understanding your own patterns.
            </p>
          </div>

          <ol className="relative mt-16 grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
            <div className="pointer-events-none absolute left-0 right-0 top-6 hidden h-px bg-slate-200 lg:block" />
            {steps.map((step, i) => (
              <li key={step.title} className="relative">
                <div
                  style={monoFont}
                  className="relative z-10 flex h-12 w-12 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-lg font-semibold text-slate-700"
                >
                  {i + 1}
                </div>
                <h3 className="mt-5 text-lg font-semibold text-slate-900">{step.title}</h3>
                <p className="mt-2 leading-relaxed text-slate-500">{step.desc}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ================= SIGNALS ================= */}
      <section id="signals" className="bg-slate-950 px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-xl">
            <h2 style={displayFont} className="text-3xl font-semibold tracking-tight text-slate-100 sm:text-4xl">
              What we read
            </h2>
            <p className="mt-4 text-lg text-slate-400">
              Built from signals you already produce. No special hardware required to get
              started.
            </p>
          </div>

          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {signals.map((s) => (
              <div key={s.title} className="rounded-2xl border border-white/10 bg-slate-900 p-6">
                <div className={`mb-4 flex h-10 w-10 items-center justify-center rounded-lg ${s.color.iconBg} ${s.color.iconText}`}>
                  <s.icon className="h-5 w-5" />
                </div>
                <h3 className="text-base font-semibold text-slate-100">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= INSIGHTS PREVIEW ================= */}
      <section className="bg-slate-50 px-6 py-24 text-slate-900">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-xl">
            <h2 style={displayFont} className="text-3xl font-semibold tracking-tight sm:text-4xl">
              See your wellness, not just your data
            </h2>
            <p className="mt-4 text-lg text-slate-500">
              Every signal gets fused into scores and suggestions you can actually use.
            </p>
          </div>

          <div className="mt-14 grid gap-8 lg:grid-cols-5 lg:items-start">
            {/* Dashboard mock */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8 lg:col-span-3">
              <div className="grid gap-8 sm:grid-cols-2 sm:items-center">
                <div className="flex flex-col items-center">
                  <svg viewBox="0 0 200 120" className="w-full max-w-[220px]">
                    <defs>
                      <linearGradient id="gaugeGrad" x1="20" y1="0" x2="180" y2="0" gradientUnits="userSpaceOnUse">
                        <stop offset="0%" stopColor="#fb7185" />
                        <stop offset="50%" stopColor="#fbbf24" />
                        <stop offset="100%" stopColor="#34d399" />
                      </linearGradient>
                    </defs>
                    <path
                      d="M20,100 A80,80 0 0 1 180,100"
                      fill="none"
                      stroke="url(#gaugeGrad)"
                      strokeWidth="14"
                      strokeLinecap="round"
                    />
                    <line x1="100" y1="100" x2={needleX} y2={needleY} stroke="#0f172a" strokeWidth="3" strokeLinecap="round" />
                    <circle cx="100" cy="100" r="5" fill="#0f172a" />
                  </svg>
                  <div className="-mt-2 text-center">
                    <div style={monoFont} className="text-3xl font-semibold text-slate-900">
                      {score}
                    </div>
                    <div className="text-sm text-slate-500">Overall wellness index</div>
                  </div>
                </div>

                <div className="space-y-4">
                  {metrics.map((m) => (
                    <div key={m.label}>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-700">{m.label}</span>
                        <span className="flex items-center gap-2">
                          <span style={monoFont} className="text-slate-500">
                            {m.value}
                          </span>
                          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${m.color.badgeBg} ${m.color.badgeText}`}>
                            {m.tag}
                          </span>
                        </span>
                      </div>
                      <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                        <div className={`h-full rounded-full ${m.color.bar}`} style={{ width: `${m.value}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-8 border-t border-slate-100 pt-6">
                <div className="text-sm font-medium text-slate-900">Suggested for you</div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {recommendations.map((r) => (
                    <span key={r} className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-700">
                      {r}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Output list */}
            <div className="lg:col-span-2">
              <ul className="space-y-5">
                {outputs.map((o) => (
                  <li key={o.title} className="flex gap-3">
                    <span className="mt-0.5 flex h-6 w-6 flex-none items-center justify-center rounded-full bg-emerald-400/10 text-emerald-600">
                      <IconCheck className="h-3.5 w-3.5" />
                    </span>
                    <div>
                      <div className="font-medium text-slate-900">{o.title}</div>
                      <div className="text-sm text-slate-500">{o.desc}</div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ================= PRIVACY ================= */}
      <section id="privacy" className="bg-slate-950 px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-xl">
            <h2 style={displayFont} className="text-3xl font-semibold tracking-tight text-slate-100 sm:text-4xl">
              Your data stays yours
            </h2>
            <p className="mt-4 text-lg text-slate-400">
              NeuroSync is built around consent and caution, especially since it touches health
              information.
            </p>
          </div>

          <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {trust.map((t) => (
              <div key={t.title}>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/5 text-slate-300">
                  <t.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-base font-semibold text-slate-100">{t.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">{t.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= FINAL CTA ================= */}
      <section className="bg-slate-950 px-6 pb-24">
        <div className="mx-auto max-w-6xl overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900 to-slate-950 p-10 text-center sm:p-16">
          <h2 style={displayFont} className="text-3xl font-semibold tracking-tight text-slate-100 sm:text-4xl">
            Ready to see your own signals?
          </h2>
          <p className="mx-auto mt-4 max-w-md text-lg text-slate-400">
            Set up takes about two minutes. Connect a webcam or wearable whenever you're ready —
            everything else is optional.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-5">
            <a
              href="/register"
              className="rounded-full bg-emerald-400 px-7 py-3 text-base font-medium text-slate-950 transition-colors hover:bg-emerald-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
            >
              Create your account
            </a>
            <a
              href="/login"
              className="text-base font-medium text-slate-100 underline decoration-slate-600 underline-offset-4 transition-colors hover:decoration-slate-300"
            >
              Already have an account? Sign in
            </a>
          </div>
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="bg-black px-6 py-12 text-slate-400">
        <div className="mx-auto flex max-w-6xl flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-2.5">
              <IconMark className="h-7 w-7" />
              <span style={displayFont} className="text-base font-semibold text-slate-100">
                NeuroSync
              </span>
            </div>
            <p className="mt-3 max-w-xs text-sm leading-relaxed">
              A cognitive & wellness analysis system, built as a final year capstone project.
            </p>
          </div>

          <nav className="flex flex-wrap gap-x-8 gap-y-3 text-sm">
            <a href="#how-it-works" className="hover:text-slate-100">
              How it works
            </a>
            <a href="#signals" className="hover:text-slate-100">
              What we read
            </a>
            <a href="#privacy" className="hover:text-slate-100">
              Privacy
            </a>
            <a href="/login" className="hover:text-slate-100">
              Sign in
            </a>
            <a href="/register" className="hover:text-slate-100">
              Create account
            </a>
          </nav>
        </div>

        <div className="mx-auto mt-10 max-w-6xl border-t border-white/10 pt-6 text-xs text-slate-600">
          © 2026 NeuroSync. Academic prototype. Not a substitute for professional medical advice.
        </div>
      </footer>
    </div>
  );
}