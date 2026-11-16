
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { uploadMedicalReport } from "../../services/medicalReports";

function MedicalScan({
  scanFile,
  setScanFile,
  handleScanChange,
  IconUpload,
  IconFile,
  IconX,
}) {
  const navigate = useNavigate();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleUpload = async () => {
    if (!scanFile) return;

    setUploading(true);
    setError("");
    setSuccess("");

    try {
      await uploadMedicalReport(scanFile, "other");
      setSuccess("Your medical record was uploaded.");
      setScanFile(null);
    } catch (err) {
      setError(err.message || "Unable to upload your medical record.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="rounded-3xl border border-white/10 bg-slate-900 p-6 sm:p-7">
      <div>
        <p className="text-sm font-medium text-slate-200">
          Medical records
        </p>

        <p className="mt-1 text-xs text-slate-500">
          Securely upload a report to your personal health library.
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
          PDF, JPG or PNG · Maximum 15 MB
        </p>

        <input
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          className="hidden"
          onChange={(event) => {
            setError("");
            setSuccess("");
            handleScanChange(event);
          }}
          disabled={uploading}
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
            onClick={() => {
              setScanFile(null);
              setError("");
              setSuccess("");
            }}
            disabled={uploading}
            className="rounded-lg p-1.5 text-slate-500 hover:bg-white/5 hover:text-slate-200"
            aria-label="Remove selected file"
          >
            <IconX className="h-4 w-4" />
          </button>
        </div>
      )}

      {error && (
        <p role="alert" className="mt-3 text-xs text-rose-300">
          {error}
        </p>
      )}

      {success && (
        <p role="status" className="mt-3 text-xs text-emerald-300">
          {success}
        </p>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={handleUpload}
          disabled={!scanFile || uploading}
          className="rounded-xl bg-emerald-400 px-4 py-2.5 text-xs font-semibold text-slate-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {uploading ? "Uploading..." : "Upload record"}
        </button>

        <button
          type="button"
          onClick={() => navigate("/medical-records")}
          className="rounded-xl border border-white/10 px-4 py-2.5 text-xs font-medium text-slate-300 hover:bg-white/5"
        >
          View all records
        </button>
      </div>
    </div>
  );
}

export default MedicalScan;
