function MoodCheckIn({
  mood,
  setMood,
}) {
  const moodOptions = [
    { value: "great", emoji: "😄" },
    { value: "good", emoji: "🙂" },
    { value: "okay", emoji: "😐" },
    { value: "bad", emoji: "😞" },
  ];

  return (
    <div className="rounded-3xl border border-white/10 bg-slate-900 p-6">
      <div>
        <p className="text-sm font-medium text-slate-200">
          Mood check-in
        </p>

        <p className="mt-1 text-xs text-slate-500">
          How are you feeling right now?
        </p>
      </div>

      <div className="mt-5 grid grid-cols-4 gap-2">
        {moodOptions.map((item) => (
          <button
            key={item.value}
            type="button"
            onClick={() => setMood(item.value)}
            className={`flex h-11 items-center justify-center rounded-xl border text-lg transition ${
              mood === item.value
                ? "border-emerald-400/50 bg-emerald-400/10"
                : "border-white/10 bg-slate-950/40 hover:bg-white/5"
            }`}
            aria-label={item.value}
          >
            {item.emoji}
          </button>
        ))}
      </div>

      <p className="mt-4 text-xs text-slate-500">
        {mood
          ? `Selected mood: ${mood}`
          : "Your check-in helps personalize recommendations."}
      </p>
    </div>
  );
}

export default MoodCheckIn;
