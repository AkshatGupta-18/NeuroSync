function WellnessOverview({
  latestAssessment,
  assessmentLoading,
  wellnessScore,
  needleX,
  needleY,
  monoFont,
  handleStartAssessment,
  IconArrowRight,
}) {
  return (
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
  );
}

export default WellnessOverview;
