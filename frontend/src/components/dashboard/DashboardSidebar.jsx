import {
  IconMark,
  IconClose,
  IconGrid,
  IconPulseLine,
  IconTrend,
  IconScan,
  IconSettings,
  IconLogout,
} from "./DashboardIcons";

const navItems = [
  {
    label: "Dashboard",
    path: "/dashboard",
    icon: IconGrid,
  },
  {
    label: "Signals",
    path: "/signals",
    icon: IconPulseLine,
  },
  {
    label: "Trends",
    path: "/trends",
    icon: IconTrend,
  },
  {
    label: "Medical scans",
    path: "/scans",
    icon: IconScan,
  },
  {
    label: "Settings",
    path: "/settings",
    icon: IconSettings,
  },
];

function DashboardSidebar({
  sidebarOpen,
  setSidebarOpen,
  navigate,
  handleLogout,
}) {
  return (
    <>
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-white/10 bg-slate-950/95 px-5 py-6 backdrop-blur-xl transition-transform duration-200 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-400/10 text-emerald-400">
              <IconMark className="h-6 w-6" />
            </div>

            <div>
              <div className="text-base font-semibold tracking-tight">
                NeuroSync
              </div>
              <div className="text-xs text-slate-500">
                Wellness intelligence
              </div>
            </div>
          </div>

          <button
            type="button"
            className="rounded-lg p-2 text-slate-400 hover:bg-white/5 hover:text-slate-100 lg:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
          >
            <IconClose />
          </button>
        </div>

        <nav className="mt-10 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = item.path === "/dashboard";

            return (
              <button
                key={item.label}
                type="button"
                onClick={() => {
                  navigate(item.path);
                  setSidebarOpen(false);
                }}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${
                  active
                    ? "bg-emerald-400/10 text-emerald-300"
                    : "text-slate-400 hover:bg-white/5 hover:text-slate-100"
                }`}
              >
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="mt-auto border-t border-white/10 pt-4">
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-400 transition hover:bg-rose-400/10 hover:text-rose-300"
          >
            <IconLogout className="h-5 w-5" />
            <span>Sign out</span>
          </button>
        </div>
      </aside>
    </>
  );
}

export default DashboardSidebar;