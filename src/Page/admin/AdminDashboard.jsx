import {
  Activity,
  BarChart3,
  Briefcase,
  ChevronRight,
  TrendingUp,
  Users as UsersIcon,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import MainHeader from "../../component/MainHeader";

import UsersTable from "./UsersTable";

import ProjectsTable from "./ProjectTable";

// Minimal, dependency-free charts (stacked bars + donut) built with div/SVG
function StackedMonthlyChart({ data, height = 100 }) {
  if (!data || data.length === 0) return null;

  // Find maximum total value
  const maxTotal = Math.max(
    ...data.map((d) => (d.totalSales ?? d.basicSales + d.proSales) || 0),
    1
  );

  return (
    <div className="w-full overflow-hidden">
      <div
        className="flex items-end gap-4 px-2 border border-wih-700 rounded-lg p-2 bg-wih-900/40"
        style={{ height }}
      >
        {data.map((d) => {
          const basic = d.basicSales || 0;
          const pro = d.proSales || 0;
          const total = (d.totalSales ?? (basic + pro)) || 0;

          // Calculate safe heights relative to the container
          const totalPx = Math.max((total / maxTotal) * (height - 10), 2); // subtract a bit to keep margin
          const basicPx = total === 0 ? 0 : (basic / total) * totalPx;
          const proPx = total === 0 ? 0 : (pro / total) * totalPx;

          return (
            <div key={d.period} className="flex w-16 flex-col items-center">
              <div
                className="flex w-10 flex-col-reverse overflow-hidden rounded bg-wih-800/60 border border-wih-700"
                style={{
                  height: `${totalPx}px`,
                  maxHeight: `${height - 10}px`,
                  transition: "height 0.3s ease",
                }}
              >
                <div
                  className="bg-emerald-500"
                  style={{ height: `${basicPx}px` }}
                  title={`Basic: ${basic.toFixed(2)}`}
                ></div>
                <div
                  className="bg-sky-500"
                  style={{ height: `${proPx}px` }}
                  title={`Pro: ${pro.toFixed(2)}`}
                ></div>
              </div>
              <div
                className="mt-2 text-center text-xs text-wih-400 truncate"
                title={d.period}
              >
                {formatPeriodLabel(d.period)}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-3 flex items-center justify-center gap-4 text-xs text-wih-300">
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-sm bg-sky-500 inline-block"></span>
          Pro
        </div>
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-sm bg-emerald-500 inline-block"></span>
          Basic
        </div>
      </div>
    </div>
  );
}


function DonutPie({ basicTotal, proTotal, size = 160, thickness = 20 }) {
  const total = Math.max(basicTotal + proTotal, 0.0001);
  const basicPct = (basicTotal / total) * 100;
  const proPct = 100 - basicPct;
  const bg = `conic-gradient(rgb(14 165 233) 0% ${proPct}%, rgb(16 185 129) ${proPct}% 100%)`;
  const inner = size - thickness * 2;
  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <div
        className="rounded-full"
        style={{ width: size, height: size, background: bg }}
      />
      <div
        className="absolute rounded-full bg-wih-900"
        style={{ width: inner, height: inner }}
      />
      <div className="absolute text-center">
        <div className="text-sm text-wih-400">Pro vs Basic</div>
        <div className="text-lg font-semibold text-wih-50">
          {formatCurrency(total)}
        </div>
      </div>
    </div>
  );
}

function formatCurrency(n) {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(n || 0);
  } catch {
    return `\$\${(n || 0).toFixed(0)}`;
  }
}

function parseDateInput(date) {
  if (!date) return "";
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return "";
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
}

function formatPeriodLabel(period) {
  // Accepts YYYY-MM or YYYY-MM-DD or YYYY
  if (!period) return "";
  try {
    if (/^\d{4}-\d{2}$/.test(period)) {
      const [y, m] = period.split("-").map(Number);
      const d = new Date(y, m - 1, 1);
      return d.toLocaleString(undefined, { month: "short" });
    }
    if (/^\d{4}-\d{2}-\d{2}$/.test(period)) {
      const d = new Date(period);
      return d.toLocaleString(undefined, { month: "short", day: "2-digit" });
    }
    if (/^\d{4}$/.test(period)) return period;
    return period;
  } catch {
    return period;
  }
}

const sidebarItems = [

  {
    key: "sales",
    label: "Sales Report",
    icon: BarChart3,
  },

  {
    key: "dashboard",
    label: "dashboard",
    icon: Briefcase,
  },

  {
    key: "users",
    label: "Users",
    icon: UsersIcon,
  },
];

function AdminSideBar(props) {
  return (
    <aside
      className={`z-30 flex w-64 flex-col border-r border-wih-700 bg-wih-800/95 backdrop-blur transition-transform duration-300 lg:static lg:translate-x-0 ${props.sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
    >
      <div className="border-b border-wih-700 px-6 py-5">
        <p className="text-xl font-extrabold text-wih-500">Admin Controls</p>
      </div>

      <nav className="flex-1 space-y-2 px-4 py-6">
        {sidebarItems.map((item) => {
          const Icon = item.icon;
          const isActive = props.activeSection === item.key;
          return (
            <button
              key={item.key}
              onClick={() => {
                props.setActiveSection(item.key);
                props.setSidebarOpen(false);
              }}
              className={`w-full rounded-md border px-6 py-6 text-left transition ${isActive
                ? "border-wih-500 bg-wih-700/70 shadow-lg shadow-wih-900/40"
                : "border-transparent hover:border-wih-600 hover:bg-wih-700/40"
                }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Icon className="h-5 w-5 text-wih-50" />
                  <div>
                    <p className="text-sm text-wih-400">{item.label}</p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-wih-500" />
              </div>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}

function AdminDashboard() {
  const orgList = useMemo(
    () => [
      { id: 1, orgName: "Harmony Studio" },
      { id: 2, orgName: "Northwind Labs" },
      { id: 3, orgName: "Latitude Partners" },
    ],
    []
  );

  const [currentOrg, setCurrentOrg] = useState(orgList[0]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("sales");

  // Sales graph state
  const today = new Date();
  const defaultEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0); // end of current month
  const defaultStart = new Date(defaultEnd);
  defaultStart.setMonth(defaultStart.getMonth() - 2); // last 3 months window
  defaultStart.setDate(1);

  const [startDate, setStartDate] = useState(parseDateInput(defaultStart));
  const [endDate, setEndDate] = useState(parseDateInput(defaultEnd));
  const [groupBy, setGroupBy] = useState("MONTH");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [salesData, setSalesData] = useState([]);

  const fetchSales = async () => {
    if (!startDate || !endDate) return;
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({ startDate, endDate, groupBy });
      const res = await fetch(
        `https://api.zonion.fun/auth/admin/dashboard/sales-graph?${params.toString()}`,
        {
          method: "GET",
          credentials: "include",
        }
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setSalesData(Array.isArray(json) ? json : []);
    } catch (e) {
      setError(`Failed to load sales: ${e?.message || e}`);
      setSalesData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSales();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const totals = useMemo(() => {
    const sum = salesData.reduce(
      (acc, d) => {
        acc.basicSales += d.basicSales || 0;
        acc.proSales += d.proSales || 0;
        acc.totalSales +=
          d.totalSales || (d.basicSales || 0) + (d.proSales || 0);
        acc.basicCount += d.basicCount || 0;
        acc.proCount += d.proCount || 0;
        return acc;
      },
      { basicSales: 0, proSales: 0, totalSales: 0, basicCount: 0, proCount: 0 }
    );
    return sum;
  }, [salesData]);

  // (unused placeholders removed)

  return (
    <div className="flex min-h-screen flex-col bg-wih-900 text-wih-50">
      <MainHeader
        setSidebarOpen={setSidebarOpen}
        orgList={orgList}
        currentOrg={currentOrg}
        onChangeOrg={setCurrentOrg}
      />

      <div className="flex flex-1 overflow-hidden">
        <AdminSideBar
          currentOrg={currentOrg}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          activeSection={activeSection}
          setActiveSection={setActiveSection}
        ></AdminSideBar>

        <main className="flex-1 overflow-y-auto bg-gradient-to-b from-wih-900 via-wih-900 to-wih-800">
          {activeSection === "sales" && (
            <div className="mx-auto w-full max-w-6xl space-y-6 p-6">
              <div className="flex flex-wrap items-end gap-4 rounded-md border border-wih-700 bg-wih-800/50 p-4">
                <div className="flex flex-col">
                  <label className="mb-1 text-xs text-wih-400">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="rounded border border-wih-700 bg-wih-900 px-3 py-2 text-wih-50 outline-none"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="mb-1 text-xs text-wih-400">End Date</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="rounded border border-wih-700 bg-wih-900 px-3 py-2 text-wih-50 outline-none"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="mb-1 text-xs text-wih-400">Group By</label>
                  <select
                    value={groupBy}
                    onChange={(e) => setGroupBy(e.target.value)}
                    className="rounded border border-wih-700 bg-wih-900 px-3 py-2 text-wih-50 outline-none"
                  >
                    <option value="DAY">Day</option>
                    <option value="MONTH">Month</option>
                    <option value="YEAR">Year</option>
                  </select>
                </div>
                <button
                  onClick={fetchSales}
                  className="ml-auto rounded-md bg-wih-600 px-4 py-2 text-sm font-semibold text-wih-50 hover:bg-wih-500"
                >
                  Refresh
                </button>
              </div>

              <div className="flex gap-2 ml-auto">
                <button
                  onClick={fetchSales}
                  className="rounded-md bg-wih-600 px-4 py-2 text-sm font-semibold text-wih-50 hover:bg-wih-500"
                >
                  Refresh
                </button>

                <button
                  onClick={() => window.open(
                    `http://localhost:8010/admin/dashboard/sales-graph/excel?startDate=${startDate}&endDate=${endDate}&groupBy=${groupBy}`,
                    "_blank"
                  )}
                  className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-wih-50 hover:bg-emerald-500"
                >
                  Download Excel
                </button>

                <button
                  onClick={() => window.open(
                    `http://localhost:8010/admin/dashboard/sales-graph/pdf?startDate=${startDate}&endDate=${endDate}&groupBy=${groupBy}`,
                    "_blank"
                  )}
                  className="rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-wih-50 hover:bg-red-500"
                >
                  Download PDF
                </button>
              </div>

              {error && (
                <div className="rounded-md border border-red-600 bg-red-950/40 p-3 text-sm text-red-300">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <div className="col-span-2 rounded-md border border-wih-700 bg-wih-800/60 p-4">
                  <div className="mb-3 flex items-center gap-2 text-wih-200">
                    <BarChart3 className="h-4 w-4" />
                    <span className="text-sm">Monthly Sales (Pro + Basic)</span>
                  </div>
                  {loading ? (
                    <div className="py-16 text-center text-wih-400">
                      Loading...
                    </div>
                  ) : (
                    <StackedMonthlyChart data={salesData} height={220} />
                  )}
                </div>
                <div className="rounded-md border border-wih-700 bg-wih-800/60 p-4">
                  <div className="mb-3 flex items-center gap-2 text-wih-200">
                    <Activity className="h-4 w-4" />
                    <span className="text-sm">Plan Mix</span>
                  </div>
                  {loading ? (
                    <div className="py-10 text-center text-wih-400">
                      Loading...
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-4">
                      <DonutPie
                        basicTotal={totals.basicSales}
                        proTotal={totals.proSales}
                      />
                      <div className="flex items-center gap-4 text-xs text-wih-300">
                        <div className="flex items-center gap-2">
                          <span className="inline-block h-3 w-3 rounded-sm bg-sky-500" />
                          Pro {formatCurrency(totals.proSales)}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="inline-block h-3 w-3 rounded-sm bg-emerald-500" />
                          Basic {formatCurrency(totals.basicSales)}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                <SummaryCard
                  icon={TrendingUp}
                  label="Total Sales"
                  value={formatCurrency(totals.totalSales)}
                />
                <SummaryCard
                  icon={UsersIcon}
                  label="Basic Count"
                  value={totals.basicCount}
                />
                <SummaryCard
                  icon={UsersIcon}
                  label="Pro Count"
                  value={totals.proCount}
                />
                <SummaryCard
                  icon={Briefcase}
                  label="Avg / Month"
                  value={formatCurrency(
                    safeAvg(totals.totalSales, salesData.length)
                  )}
                />
              </div>
            </div>
          )}
          {activeSection === "users" && (
            <div className="mx-auto w-full max-w-6xl space-y-6 p-6">
              <UsersTable />
            </div>
          )}

          {activeSection === "dashboard" && (
            <div>
              <ProjectsTable />
            </div>
          )}

        </main>
      </div>
    </div>
  );
}

export default AdminDashboard;

function SummaryCard({ icon: Icon, label, value }) {
  return (
    <div className="rounded-md border border-wih-700 bg-wih-800/60 p-4">
      <div className="flex items-center gap-3">
        <div className="rounded-md bg-wih-700/70 p-2">
          <Icon className="h-5 w-5 text-wih-300" />
        </div>
        <div>
          <div className="text-xs text-wih-400">{label}</div>
          <div className="text-lg font-semibold text-wih-50">{value}</div>
        </div>
      </div>
    </div>
  );
}

function safeAvg(total, count) {
  if (!count) return 0;
  return total / count;
}



