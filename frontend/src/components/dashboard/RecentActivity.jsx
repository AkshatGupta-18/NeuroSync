function RecentActivity({
  activityLog,
  IconTrend,
}) {
  return (
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
  );
}

export default RecentActivity;
