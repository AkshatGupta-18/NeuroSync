function LiveSignals({
  cameraActive,
  setCameraActive,
  IconCamera,
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-slate-900 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-200">
            Live signal read
          </p>

          <p className="mt-1 text-xs text-slate-500">
            Camera-based wellness signal
          </p>
        </div>

        <div
          className={`h-2.5 w-2.5 rounded-full ${
            cameraActive ? "bg-emerald-400" : "bg-slate-600"
          }`}
        />
      </div>

      <div className="mt-5 flex items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-400/10 text-emerald-400">
          <IconCamera className="h-7 w-7" />
        </div>

        <div>
          <p className="text-lg font-semibold text-slate-100">
            {cameraActive ? "Active" : "Paused"}
          </p>

          <p className="text-xs text-slate-500">
            {cameraActive
              ? "Signal monitoring is ready"
              : "Camera monitoring is paused"}
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setCameraActive((current) => !current)}
        className="mt-5 w-full rounded-xl border border-white/10 px-4 py-2.5 text-sm font-medium text-slate-300 transition-colors hover:bg-white/5"
      >
        {cameraActive ? "Pause signal" : "Activate signal"}
      </button>
    </div>
  );
}

export default LiveSignals;
