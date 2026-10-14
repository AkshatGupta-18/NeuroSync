function Alerts({
  alerts,
  dismissAlert,
  IconBell,
  IconAlert,
  IconCheck,
  IconX,
}) {
  const alertStyles = {
    warning: {
      icon: IconAlert,
      bg: "bg-amber-400/10",
      text: "text-amber-400",
    },
    success: {
      icon: IconCheck,
      bg: "bg-emerald-400/10",
      text: "text-emerald-400",
    },
    info: {
      icon: IconBell,
      bg: "bg-violet-400/10",
      text: "text-violet-400",
    },
  };

  return (
    <div className="rounded-3xl border border-white/10 bg-slate-900 p-6 sm:p-7">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-200">
            Alerts
          </p>

          <p className="mt-1 text-xs text-slate-500">
            Important updates from your wellness data
          </p>
        </div>

        <IconBell className="h-5 w-5 text-slate-500" />
      </div>

      <div className="mt-5 space-y-3">
        {alerts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/10 p-5 text-center">
            <IconCheck className="mx-auto h-5 w-5 text-emerald-400" />

            <p className="mt-2 text-sm text-slate-400">
              No active alerts.
            </p>
          </div>
        ) : (
          alerts.map((alert) => {
            const styles = alertStyles[alert.type] || alertStyles.info;
            const AlertIcon = styles.icon;

            return (
              <div
                key={alert.id}
                className="flex gap-3 rounded-2xl border border-white/10 bg-slate-950/40 p-4"
              >
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${styles.bg} ${styles.text}`}
                >
                  <AlertIcon className="h-4 w-4" />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-slate-200">
                    {alert.title}
                  </p>

                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    {alert.description}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => dismissAlert(alert.id)}
                  className="self-start rounded-lg p-1 text-slate-600 hover:bg-white/5 hover:text-slate-300"
                  aria-label={`Dismiss ${alert.title}`}
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

export default Alerts;
