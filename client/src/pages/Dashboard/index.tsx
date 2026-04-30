import { useAuth } from "@/context/AuthContext";
import { useDashboardSummary } from "@/hooks/dashboard/useDashboardSummary";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Clock, DollarSign } from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";

function formatCurrency(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
}

function formatCurrencyFull(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);
}

const PIE_COLORS = ["#16a34a", "#dc2626", "#d97706"];

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}

function AreaTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border bg-white px-3 py-2 shadow-md text-sm">
      <p className="font-medium text-neutral-700 mb-1">{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center justify-between gap-4">
          <span style={{ color: p.color }}>{p.name}</span>
          <span className="tabular-nums font-medium">{formatCurrencyFull(p.value)}</span>
        </div>
      ))}
    </div>
  );
}

interface PieTooltipProps {
  active?: boolean;
  payload?: Array<{ name: string; value: number }>;
}

function PieTooltipContent({ active, payload }: PieTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border bg-white px-3 py-2 shadow-md text-sm">
      <p className="font-medium">{payload[0].name}</p>
      <p className="tabular-nums text-neutral-700">{formatCurrencyFull(payload[0].value)}</p>
    </div>
  );
}

function MetricSkeleton() {
  return <div className="h-8 w-28 bg-neutral-100 rounded animate-pulse mt-1" />;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const { data, isLoading } = useDashboardSummary();

  const metrics = [
    {
      label: "Total Revenue",
      value: data?.revenue ?? 0,
      description: "From paid invoices",
      icon: TrendingUp,
      iconColor: "text-green-600",
      iconBg: "bg-green-50",
      valueColor: "text-neutral-900",
    },
    {
      label: "Total Expenses",
      value: data?.expenses ?? 0,
      description: "From expense transactions",
      icon: TrendingDown,
      iconColor: "text-red-600",
      iconBg: "bg-red-50",
      valueColor: "text-neutral-900",
    },
    {
      label: "Outstanding",
      value: data?.outstanding ?? 0,
      description: "From sent invoices",
      icon: Clock,
      iconColor: "text-amber-600",
      iconBg: "bg-amber-50",
      valueColor: "text-neutral-900",
    },
    {
      label: "Net Income",
      value: (data?.income ?? 0) - (data?.expenses ?? 0),
      description: "Income minus expenses",
      icon: DollarSign,
      iconColor: "text-blue-600",
      iconBg: "bg-blue-50",
      valueColor: (data?.income ?? 0) - (data?.expenses ?? 0) < 0 ? "text-red-600" : "text-neutral-900",
    },
  ];

  const pieData = [
    { name: "Revenue", value: data?.revenue ?? 0 },
    { name: "Expenses", value: data?.expenses ?? 0 },
    { name: "Outstanding", value: data?.outstanding ?? 0 },
  ].filter((d) => d.value > 0);

  const hasMonthlyData = data?.monthly?.some((m) => m.revenue > 0 || m.expenses > 0 || m.income > 0);
  const hasPieData = pieData.length > 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Dashboard</h1>
        <p className="text-neutral-500 mt-1">
          Welcome back{user?.name ? `, ${user.name}` : ""}!
        </p>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map(({ label, value, description, icon: Icon, iconColor, iconBg, valueColor }) => (
          <Card key={label}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-neutral-500">{label}</CardTitle>
                <div className={`${iconBg} p-2 rounded-md`}>
                  <Icon className={`w-4 h-4 ${iconColor}`} />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <MetricSkeleton />
              ) : (
                <>
                  <p className={`text-2xl font-bold ${valueColor}`}>{formatCurrency(value)}</p>
                  <p className="text-xs text-neutral-400 mt-1">{description}</p>
                </>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Area chart — last 6 months */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Revenue & Expenses — Last 6 Months</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-64 bg-neutral-50 rounded animate-pulse" />
            ) : !hasMonthlyData ? (
              <div className="h-64 flex flex-col items-center justify-center text-neutral-400 gap-2">
                <TrendingUp className="w-8 h-8 text-neutral-200" />
                <p className="text-sm">No data yet — add transactions and invoices to see trends</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={data?.monthly} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gradRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#16a34a" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gradIncome" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.12} />
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gradExpenses" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#dc2626" stopOpacity={0.12} />
                      <stop offset="95%" stopColor="#dc2626" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 11, fill: "#9ca3af" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                    tick={{ fontSize: 11, fill: "#9ca3af" }}
                    axisLine={false}
                    tickLine={false}
                    width={48}
                  />
                  <Tooltip content={<AreaTooltip />} />
                  <Legend
                    wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
                    iconType="circle"
                    iconSize={8}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    name="Revenue"
                    stroke="#16a34a"
                    strokeWidth={2}
                    fill="url(#gradRevenue)"
                    dot={false}
                    activeDot={{ r: 4 }}
                  />
                  <Area
                    type="monotone"
                    dataKey="income"
                    name="Income"
                    stroke="#2563eb"
                    strokeWidth={2}
                    fill="url(#gradIncome)"
                    dot={false}
                    activeDot={{ r: 4 }}
                  />
                  <Area
                    type="monotone"
                    dataKey="expenses"
                    name="Expenses"
                    stroke="#dc2626"
                    strokeWidth={2}
                    fill="url(#gradExpenses)"
                    dot={false}
                    activeDot={{ r: 4 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Pie chart — financial composition */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Financial Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-64 bg-neutral-50 rounded animate-pulse" />
            ) : !hasPieData ? (
              <div className="h-64 flex flex-col items-center justify-center text-neutral-400 gap-2">
                <DollarSign className="w-8 h-8 text-neutral-200" />
                <p className="text-sm text-center">No financial data yet</p>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={48}
                      outerRadius={76}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {pieData.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<PieTooltipContent />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2 w-full mt-1">
                  {pieData.map((item, i) => (
                    <div key={item.name} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                          style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }}
                        />
                        <span className="text-neutral-600">{item.name}</span>
                      </div>
                      <span className="tabular-nums font-medium text-neutral-800">
                        {formatCurrency(item.value)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
