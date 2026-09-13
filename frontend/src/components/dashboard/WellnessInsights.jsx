function WellnessInsights({
  latestAssessment,
  interpretationLoading,
  interpretationError,
  interpretation,
  monoFont,
}) {
  return (
            <div className="mt-5 rounded-3xl border border-white/10 bg-slate-900 p-6 sm:p-7">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-200">
                    Wellness insights
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Personalized guidance generated from your latest completed assessment.
                  </p>
                </div>

                {interpretationLoading ? (
                  <span className="rounded-full bg-white/5 px-2.5 py-1 text-xs text-slate-500">
                    Analyzing...
                  </span>
                ) : interpretation?.overall_status ? (
                  <span className="rounded-full bg-emerald-400/10 px-2.5 py-1 text-xs font-medium text-emerald-400">
                    {interpretation.overall_status}
                  </span>
                ) : null}
              </div>

              {interpretationError ? (
                <div className="mt-5 rounded-2xl border border-amber-400/20 bg-amber-400/5 px-4 py-3 text-sm text-amber-300">
                  {interpretationError}
                </div>
              ) : interpretation ? (
                <>
                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
                      <p className="text-xs uppercase tracking-wider text-slate-600">
                        Strongest area
                      </p>
                      <p className="mt-2 text-sm font-medium text-slate-200">
                        {interpretation.strongest_dimension?.label || "Not available"}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {interpretation.strongest_dimension?.score ?? "--"} / 100 · {interpretation.strongest_dimension?.status || ""}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
                      <p className="text-xs uppercase tracking-wider text-slate-600">
                        Priority area
                      </p>
                      <p className="mt-2 text-sm font-medium text-slate-200">
                        {interpretation.priority_dimension?.label || "Not available"}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {interpretation.priority_dimension?.score ?? "--"} / 100 · {interpretation.priority_dimension?.status || ""}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    {interpretation.dimensions.map((dimension) => (
                      <div
                        key={dimension.dimension}
                        className="rounded-2xl border border-white/10 bg-slate-950/40 p-4"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-sm font-medium text-slate-200">
                            {dimension.label}
                          </p>
                          <span style={monoFont} className="text-xs text-slate-500">
                            {dimension.score ?? "--"}
                          </span>
                        </div>

                        <p className="mt-1 text-xs font-medium text-slate-500">
                          {dimension.status || "Not available"}
                        </p>

                        <p className="mt-3 text-xs leading-5 text-slate-500">
                          {dimension.guidance || "No guidance is available for this indicator yet."}
                        </p>
                      </div>
                    ))}
                  </div>

                  <p className="mt-4 text-[11px] leading-5 text-slate-600">
                    These indicators are intended for self-monitoring and wellness awareness, not medical diagnosis.
                  </p>
                </>
              ) : (
                <div className="mt-5 rounded-2xl border border-dashed border-white/10 p-5 text-center">
                  <p className="text-sm text-slate-400">
                    Personalized insights are not available yet.
                  </p>
                </div>
              )}
            </div>
  );
}

export default WellnessInsights;
