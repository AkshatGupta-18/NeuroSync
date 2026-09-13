function WellnessHistory({
  completedAssessments,
  bestWellnessScore,
  calculateOverallWellness,
  monoFont,
  IconTrend,
  IconCheck,
}) {
  return (
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
                    Older ? latest
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
  );
}

export default WellnessHistory;
