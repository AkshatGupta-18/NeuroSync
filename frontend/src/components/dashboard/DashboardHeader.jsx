import { IconMenu, IconBell } from "./DashboardIcons";

function DashboardHeader({
  greeting,
  user,
  userInitial,
  setSidebarOpen,
}) {
  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
      <div className="flex h-20 items-center justify-between px-6 lg:px-8">
        <div className="flex items-center gap-4">
          <button
            type="button"
            className="rounded-xl border border-white/10 bg-white/5 p-2.5 text-slate-300 hover:bg-white/10 lg:hidden"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open sidebar"
          >
            <IconMenu />
          </button>

          <div>
            <p className="text-sm text-slate-500">{greeting}</p>

            <h1 className="text-lg font-semibold text-slate-100">
              {user?.first_name || user?.username || "Welcome back"}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            className="relative rounded-xl border border-white/10 bg-white/5 p-2.5 text-slate-400 hover:bg-white/10 hover:text-slate-100"
            aria-label="Notifications"
          >
            <IconBell className="h-5 w-5" />
            <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-emerald-400" />
          </button>

          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-400 text-sm font-bold text-slate-950">
            {userInitial}
          </div>
        </div>
      </div>
    </header>
  );
}

export default DashboardHeader;