function MedicalScan({
  scanFile,
  setScanFile,
  handleScanChange,
  IconUpload,
  IconFile,
  IconX,
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-slate-900 p-6 sm:p-7">
      <div>
        <p className="text-sm font-medium text-slate-200">
          Medical scan
        </p>

        <p className="mt-1 text-xs text-slate-500">
          Upload a report or scan for your NeuroSync record.
        </p>
      </div>

      <label className="mt-5 flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-slate-950/40 px-6 py-8 text-center transition hover:border-emerald-400/30 hover:bg-white/[0.02]">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-400/10 text-emerald-400">
          <IconUpload className="h-6 w-6" />
        </div>

        <p className="mt-4 text-sm font-medium text-slate-200">
          {scanFile ? scanFile.name : "Choose a medical file"}
        </p>

        <p className="mt-1 text-xs text-slate-500">
          PDF, JPG or PNG
        </p>

        <input
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          className="hidden"
          onChange={handleScanChange}
        />
      </label>

      {scanFile && (
        <div className="mt-4 flex items-center justify-between rounded-xl border border-white/10 bg-slate-950/50 px-4 py-3">
          <div className="flex min-w-0 items-center gap-3">
            <IconFile className="h-5 w-5 shrink-0 text-slate-500" />

            <div className="min-w-0">
              <p className="truncate text-xs font-medium text-slate-300">
                {scanFile.name}
              </p>

              <p className="text-[11px] text-slate-600">
                {(scanFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setScanFile(null)}
            className="rounded-lg p-1.5 text-slate-500 hover:bg-white/5 hover:text-slate-200"
            aria-label="Remove selected file"
          >
            <IconX className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}

export default MedicalScan;
