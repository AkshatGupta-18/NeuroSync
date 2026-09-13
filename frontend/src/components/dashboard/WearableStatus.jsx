function WearableStatus({
  wearableConnected,
  setWearableConnected,
  IconWatch,
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-slate-900 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-200">
            Wearable
          </p>

          <p className="mt-1 text-xs text-slate-500">
            Health data synchronization
          </p>
        </div>

        <IconWatch className="h-5 w-5 text-violet-400" />
      </div>

      <div className="mt-5 flex items-center justify-between rounded-2xl border border-white/10 bg-slate-950/50 p-4">
        <div>
          <p className="text-sm font-medium text-slate-200">
            {wearableConnected ? "Connected" : "Disconnected"}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            {wearableConnected
              ? "Last synced recently"
              : "Connect a supported device"}
          </p>
        </div>

        <span
          className={`rounded-full px-2.5 py-1 text-xs font-medium ${
            wearableConnected
              ? "bg-emerald-400/10 text-emerald-400"
              : "bg-slate-800 text-slate-400"
          }`}
        >
          {wearableConnected ? "Online" : "Offline"}
        </span>
      </div>

      <button
        type="button"
        onClick={() =>
          setWearableConnected((current) => !current)
        }
        className="mt-5 w-full rounded-xl border border-white/10 px-4 py-2.5 text-sm font-medium text-slate-300 transition-colors hover:bg-white/5"
      >
        {wearableConnected
          ? "Disconnect"
          : "Connect wearable"}
      </button>
    </div>
  );
}

export default WearableStatus;
