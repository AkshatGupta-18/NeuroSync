function Recommendations({
  recommendations,
  dismissRecommendation,
  accent,
  IconPulseLine,
  IconX,
}) {
  return (
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
  );
}

export default Recommendations;
