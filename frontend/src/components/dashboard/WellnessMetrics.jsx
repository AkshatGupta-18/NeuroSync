function WellnessMetrics({
  assessmentLoading,
  metrics,
  accent,
  monoFont,
}) {
  return (
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
  );
}

export default WellnessMetrics;
