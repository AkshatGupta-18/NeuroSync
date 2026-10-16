
const monoFont = {
  fontFamily: "'IBM Plex Mono', monospace",
};

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

function IconGrid({ className = "h-5 w-5" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <rect x="4" y="4" width="6" height="6" rx="1.2" stroke="currentColor" strokeWidth="1.7" />
      <rect x="14" y="4" width="6" height="6" rx="1.2" stroke="currentColor" strokeWidth="1.7" />
      <rect x="4" y="14" width="6" height="6" rx="1.2" stroke="currentColor" strokeWidth="1.7" />
      <rect x="14" y="14" width="6" height="6" rx="1.2" stroke="currentColor" strokeWidth="1.7" />
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

function WellnessOverview({
  latestAssessment,
  assessmentLoading,
  onStartAssessment,
}) {
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

  return (
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
          <svg viewBox="0 0 200 120" className="w-full max-w-[220px]">
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

                <circle cx="100" cy="100" r="5" fill="#f1f5f9" />
              </>
            )}
          </svg>

          <div className="-mt-2 text-center">
            <div
              style={monoFont}
              className="text-4xl font-semibold text-slate-100"
            >
              {assessmentLoading ? "..." : wellnessScore ?? "--"}
            </div>

            <div className="text-sm text-slate-500">
              {latestAssessment ? "out of 100" : "complete an assessment"}
            </div>
          </div>

          <button
            type="button"
            onClick={onStartAssessment}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-400 px-4 py-3 text-sm font-semibold text-slate-950 transition-colors hover:bg-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:ring-offset-2 focus:ring-offset-slate-900"
          >
            {latestAssessment ? "Take New Assessment" : "Start Assessment"}
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
                  <p className="text-sm text-slate-500">{metric.label}</p>

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
                      width: `${Math.max(0, Math.min(100, metric.value ?? 0))}%`,
                    }}
                  />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default WellnessOverview;